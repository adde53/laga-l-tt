import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/newsletter.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const maskEmail = (email: string) => String(email).replace(/^(.).*(@.*)$/, "$1***$2");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let token: string | null = null;
    let email: string | null = null;
    if (req.method === "GET") {
      token = new URL(req.url).searchParams.get("token");
    } else {
      const body = await req.json().catch(() => ({}));
      token = typeof body?.token === "string" ? body.token : null;
      email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
    }

    // Unsubscribe by e-mail address (form on /avprenumerera)
    if (!token && email) {
      if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);

      const { data: found } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (found) {
        const { error } = await supabase
          .from("newsletter_subscribers")
          .delete()
          .eq("id", found.id);
        if (error) throw error;
      }

      // Always report success so the endpoint can't be used to probe the list
      return json({ status: "unsubscribed", email: maskEmail(email) });
    }

    if (!token || !UUID_RE.test(token)) {
      return json({ error: "invalid_token" }, 400);
    }

    const { data: sub } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, is_active")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (!sub) return json({ error: "invalid_token" }, 404);

    const masked = maskEmail(sub.email);

    // GET = look up only (so email scanners can't unsubscribe people)
    if (req.method === "GET") {
      return json({ status: sub.is_active ? "active" : "already_unsubscribed", email: masked });
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", sub.id);
    if (error) throw error;

    return json({ status: "unsubscribed", email: masked });
  } catch (e) {
    console.error("newsletter-unsubscribe error:", e);
    return json({ error: e instanceof Error ? e.message : "unknown_error" }, 500);
  }
});