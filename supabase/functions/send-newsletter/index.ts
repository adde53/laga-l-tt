import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin");
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });
    }

    const { draftId } = await req.json();
    if (!draftId) throw new Error("draftId required");

    // Get the draft
    const { data: draft, error: draftErr } = await supabase
      .from("newsletter_drafts")
      .select("*")
      .eq("id", draftId)
      .single();
    if (draftErr || !draft) throw new Error("Draft not found");
    if (draft.status === "sent") throw new Error("Already sent");

    // Get active subscribers
    const { data: subscribers, error: subErr } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);
    if (subErr) throw subErr;
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ error: "No active subscribers" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via Resend (batch, max 100 per call)
    const emails = subscribers.map((s: any) => s.email);
    const batchSize = 50;
    let sentCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      const resendRes = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          batch.map((email: string) => ({
            from: "VeckansMatFynd <onboarding@resend.dev>",
            to: email,
            subject: draft.subject,
            html: draft.content,
          }))
        ),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error("Resend error:", resendRes.status, errText);
        // Continue with remaining batches
      } else {
        sentCount += batch.length;
      }
    }

    // Mark draft as sent
    await supabase
      .from("newsletter_drafts")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", draftId);

    return new Response(JSON.stringify({ success: true, sentCount, totalSubscribers: emails.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-newsletter error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
