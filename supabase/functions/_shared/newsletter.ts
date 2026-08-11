// Shared helpers for the weekly newsletter (VeckansMatFynd)

export const SITE_URL = "https://www.veckansmatfynd.se";
export const FROM_ADDRESS =
  Deno.env.get("NEWSLETTER_FROM") ?? "VeckansMatFynd <veckomeny@veckansmatfynd.se>";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export function unsubscribeUrl(token: string) {
  return `${SITE_URL}/avprenumerera?token=${token}`;
}

/** Wraps AI/admin generated HTML in a branded email shell with an unsubscribe footer. */
export function wrapEmail(opts: {
  subject: string;
  contentHtml: string;
  token: string;
}) {
  const unsub = unsubscribeUrl(opts.token);
  return `<!doctype html>
<html lang="sv"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(
    opts.subject,
  )}</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;color:#2b2b2b;">
  <div style="max-width:600px;margin:0 auto;padding:24px 20px;">
    <div style="text-align:center;padding-bottom:16px;border-bottom:2px solid #f0ece6;">
      <div style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">Veckans<span style="color:#e2622b;">MatFynd</span></div>
      <div style="font-size:12px;color:#8a8279;margin-top:4px;">Veckomeny för 4 personer – under 500 kr</div>
    </div>
    <div style="padding:20px 0;font-size:15px;line-height:1.6;">
      ${opts.contentHtml}
    </div>
    <div style="text-align:center;padding:18px 0;">
      <a href="${SITE_URL}" style="display:inline-block;background:#e2622b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;font-size:14px;">Skapa egna recept på veckansmatfynd.se</a>
    </div>
    <div style="border-top:1px solid #f0ece6;padding-top:14px;font-size:11px;color:#9a938b;text-align:center;line-height:1.6;">
      Du får detta mejl eftersom du prenumererar på VeckansMatFynds veckomeny.<br />
      <a href="${unsub}" style="color:#9a938b;text-decoration:underline;">Avprenumerera här</a>
    </div>
  </div>
</body></html>`;
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}