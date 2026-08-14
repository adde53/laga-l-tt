import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const key = Deno.env.get("RESEND_API_KEY");
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const verify = url.searchParams.get("verify") === "1";
  const endpoint = id
    ? `https://api.resend.com/domains/${id}${verify ? "/verify" : ""}`
    : "https://api.resend.com/domains";
  const res = await fetch(endpoint, {
    method: verify ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}` },
  });
  return new Response(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
});
