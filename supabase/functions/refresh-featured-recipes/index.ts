import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Generate 6 new featured recipes via AI
    const prompt = `Du är en svensk receptgenerator. Skapa exakt 6 olika recept som JSON-array.
Varje recept ska ha dessa fält:
- title (kreativt svenskt namn, max 40 tecken)
- description (lockande beskrivning, max 120 tecken)
- total_cost (totalpris i kr för 4 portioner, realistiskt mellan 40-150)
- cost_per_portion (pris per portion i kr)
- cook_time_minutes (tillagning i minuter, 10-60)
- ingredient_count (antal ingredienser, 4-12)
- cuisine (en av: Italienskt, Indiskt, Asiatiskt, Svenskt, Medelhavs, Mexikanskt)
- servings (alltid 4)

Blanda olika kök och prisklasser. Svara ENBART med en JSON-array, inget annat.`;

    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const raw = aiData.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON array");

    const recipes = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error("Invalid recipes array");
    }

    // Clear old recipes and insert new ones
    await supabase.from("featured_recipes").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const { error: insertError } = await supabase.from("featured_recipes").insert(
      recipes.map((r: any) => ({
        title: String(r.title).slice(0, 100),
        description: String(r.description).slice(0, 200),
        total_cost: Number(r.total_cost) || 80,
        cost_per_portion: Number(r.cost_per_portion) || 20,
        cook_time_minutes: Number(r.cook_time_minutes) || 30,
        ingredient_count: Number(r.ingredient_count) || 7,
        cuisine: r.cuisine || "Svenskt",
        servings: 4,
      }))
    );

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, count: recipes.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error refreshing featured recipes:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
