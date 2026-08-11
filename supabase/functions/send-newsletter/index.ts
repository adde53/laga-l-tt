import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  corsHeaders,
  json,
  wrapEmail,
  unsubscribeUrl,
  FROM_ADDRESS,
} from "../_shared/newsletter.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Auth: either an admin user, or the internal scheduler secret ──
    const cronSecret = req.headers.get("x-cron-secret");
    let authorized = false;

    if (cronSecret) {
      const { data: settings } = await supabase
        .from("newsletter_settings")
        .select("cron_secret")
        .limit(1)
        .maybeSingle();
      authorized = !!settings?.cron_secret && settings.cron_secret === cronSecret;
      if (!authorized) return json({ error: "Unauthorized" }, 401);
    } else {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return json({ error: "Unauthorized" }, 401);
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userErr } = await supabase.auth.getUser(token);
      if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin");
      if (!roles || roles.length === 0) return json({ error: "Admin access required" }, 403);
      authorized = true;
    }

    const body = await req.json().catch(() => ({}));
    const draftId = body?.draftId;
    const testEmail: string | undefined =
      typeof body?.testEmail === "string" ? body.testEmail.trim().toLowerCase() : undefined;
    if (!draftId) throw new Error("draftId required");

    const { data: draft, error: draftErr } = await supabase
      .from("newsletter_drafts")
      .select("*")
      .eq("id", draftId)
      .single();
    if (draftErr || !draft) throw new Error("Draft not found");
    if (!testEmail && draft.status === "sent") throw new Error("Already sent");

    // ── Recipients ──
    type Recipient = { email: string; unsubscribe_token: string };
    let recipients: Recipient[] = [];

    if (testEmail) {
      const { data: existing } = await supabase
        .from("newsletter_subscribers")
        .select("email, unsubscribe_token")
        .eq("email", testEmail)
        .maybeSingle();
      recipients = [
        existing ?? { email: testEmail, unsubscribe_token: crypto.randomUUID() },
      ];
    } else {
      const { data: subscribers, error: subErr } = await supabase
        .from("newsletter_subscribers")
        .select("email, unsubscribe_token")
        .eq("is_active", true);
      if (subErr) throw subErr;
      recipients = (subscribers ?? []) as Recipient[];
      if (recipients.length === 0) return json({ error: "No active subscribers" }, 400);
    }

    // ── Send one personalised email per recipient (Resend batch API) ──
    const batchSize = 50;
    let sentCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const resendRes = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          batch.map((r) => ({
            from: FROM_ADDRESS,
            to: r.email,
            subject: testEmail ? `[TEST] ${draft.subject}` : draft.subject,
            html: wrapEmail({
              subject: draft.subject,
              contentHtml: draft.content ?? "",
              token: r.unsubscribe_token,
            }),
            headers: {
              "List-Unsubscribe": `<${unsubscribeUrl(r.unsubscribe_token)}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          })),
        ),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error("Resend error:", resendRes.status, errText);
        errors.push(`${resendRes.status}: ${errText}`);
      } else {
        sentCount += batch.length;
      }
    }

    if (sentCount === 0) {
      return json({ error: "Utskicket misslyckades", details: errors }, 502);
    }

    if (!testEmail) {
      await supabase
        .from("newsletter_drafts")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", draftId);
    }

    return json({
      success: true,
      sentCount,
      totalSubscribers: recipients.length,
      test: !!testEmail,
      errors,
    });
  } catch (e) {
    console.error("send-newsletter error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
