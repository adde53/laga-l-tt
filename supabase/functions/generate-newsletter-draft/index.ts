import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Optionally verify admin via auth header
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: claimsErr } = await supabase.auth.getUser(token);
      if (claimsErr || !claims?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", claims.user.id).eq("role", "admin");
      if (!roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });
      }
    }

    // Calculate next Monday
    const now = new Date();
    const nextMonday = new Date(now);
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(8, 0, 0, 0);

    // Generate newsletter content via AI
    const systemPrompt = `Du är en svensk matkock som skapar ett veckovis nyhetsbrev med budgetrecept.

Skapa ett nyhetsbrev med:
- En kort, engagerande hälsning
- 5 vardagsrätter för 4 portioner, totalt under 500 kr
- Varje rätt ska ha: namn, kort beskrivning (1-2 meningar), ingredienslista med priser, och enkel tillagning
- Balanserade måltider: protein, grönsaker/fibrer och kolhydrater
- Avsluta med total veckokostnad

Formatera i HTML som fungerar i e-post (inline styles, enkla tabeller).
Använd en varm, inbjudande ton med emojis.
Ämnesrad ska vara catchy och inkludera veckonumret.`;

    const weekNum = getWeekNumber(nextMonday);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Skapa veckans nyhetsbrev (vecka ${weekNum}). Budgetmål: under 500 kr totalt för 5 rätter, 4 portioner per rätt.` },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Failed to generate newsletter content");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Extract subject from content or use default
    const subject = `🍽️ Veckans MatFynd – Vecka ${weekNum}: 5 rätter under 500 kr`;

    // Save draft
    const { data: draft, error: insertErr } = await supabase
      .from("newsletter_drafts")
      .insert({
        subject,
        content,
        status: "draft",
        scheduled_for: nextMonday.toISOString(),
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ success: true, draft }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-newsletter-draft error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
