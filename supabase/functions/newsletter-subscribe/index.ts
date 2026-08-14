import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  corsHeaders,
  json,
  wrapEmail,
  unsubscribeUrl,
  FROM_ADDRESS,
  SITE_URL,
} from "../_shared/newsletter.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return json({ error: "Ange en giltig e-postadress" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Insert or reactivate
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("email, unsubscribe_token, is_active")
      .eq("email", email)
      .maybeSingle();

    let token = existing?.unsubscribe_token as string | undefined;
    let alreadySubscribed = false;

    if (existing) {
      alreadySubscribed = !!existing.is_active;
      if (!existing.is_active) {
        await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, unsubscribed_at: null })
          .eq("email", email);
      }
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from("newsletter_subscribers")
        .insert({ email })
        .select("unsubscribe_token")
        .single();
      if (insErr) throw insErr;
      token = inserted?.unsubscribe_token as string;
    }

    if (!token) token = crypto.randomUUID();

    // Welcome email
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;
    let emailError: string | null = null;

    if (!RESEND_API_KEY) {
      emailError = "RESEND_API_KEY is not configured";
    } else {
      const contentHtml = `
        <h2 style="margin:0 0 12px;font-size:20px;">Välkommen till VeckansMatFynd! 🎉</h2>
        <p style="margin:0 0 12px;line-height:1.6;">Du är nu med på veckobrevet. Varje måndag får du <strong>5 middagar för 4 personer under 500 kronor</strong>, byggda på veckans erbjudanden i butikerna.</p>
        <ul style="margin:0 0 12px;padding-left:20px;line-height:1.7;">
          <li>Färdig veckomeny – ingen planering krävs</li>
          <li>Komplett handlingslista</li>
          <li>Priser baserade på aktuella extrapriser</li>
        </ul>
        <p style="margin:0 0 12px;line-height:1.6;">Vill du ha ett recept direkt? Skapa ett på <a href="${SITE_URL}" style="color:#e2622b;">veckansmatfynd.se</a>.</p>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: email,
          subject: "Välkommen! Din gratis veckomeny kommer på måndag 🍽️",
          html: wrapEmail({
            subject: "Välkommen till VeckansMatFynd",
            contentHtml,
            token,
          }),
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl(token)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        }),
      });

      if (res.ok) {
        emailSent = true;
      } else {
        emailError = `${res.status}: ${await res.text()}`;
        console.error("Resend welcome email failed:", emailError);
      }
    }

    return json({ success: true, alreadySubscribed, emailSent, emailError });
  } catch (err) {
    console.error("newsletter-subscribe error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
