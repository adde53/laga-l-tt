import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RECIPE_SITES = [
  "ica.se/recept",
  "koket.se",
  "arla.se/recept",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { craving, cuisines, budget, portions, dayName, pdfText } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build search query
    const parts: string[] = ["recept"];
    if (craving) parts.push(craving);
    if (cuisines?.length) parts.push(cuisines[0]);
    if (budget) parts.push(`budget ${budget} kr`);
    const query = parts.join(" ");

    // Pick a random site to search
    const site = RECIPE_SITES[Math.floor(Math.random() * RECIPE_SITES.length)];
    const searchQuery = `site:${site} ${query}`;

    console.log("Searching for recipe:", searchQuery);

    // Use Firecrawl search to find a matching recipe
    const searchResp = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 3,
        lang: "sv",
        country: "se",
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    const searchData = await searchResp.json();

    if (!searchResp.ok || !searchData?.data?.length) {
      console.error("Firecrawl search failed or no results:", searchData);
      return new Response(JSON.stringify({ success: false, error: "Inga recept hittades" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pick the best result (first one with markdown content)
    const bestResult = searchData.data.find((r: any) => r.markdown && r.markdown.length > 200) || searchData.data[0];
    const recipeMarkdown = bestResult.markdown?.slice(0, 6000) || "";
    const sourceUrl = bestResult.url || "";
    const sourceTitle = bestResult.title || "";

    console.log("Found recipe from:", sourceUrl);

    const portionCount = portions || "4";

    // Use AI to reformat the scraped recipe to match our format
    const formatPrompt = `Du är en svensk kock. Formatera detta recept till vårt standardformat.

Originalkälla: ${sourceUrl}
Originalrecept:
${recipeMarkdown}

${pdfText ? `Aktuella erbjudanden:\n${pdfText}\n\nJämför ingredienserna med erbjudandena och uppdatera priserna om något matchar.` : ""}

Formatera receptet EXAKT så här (anpassa till ${portionCount} portioner):

${dayName ? `## ${dayName}` : ""}
### 🍽️ [Rättens namn]
*Källa: [${sourceTitle || sourceUrl}](${sourceUrl})*

[Kort beskrivning 1-2 meningar]

**👥 ${portionCount} portioner**

**Ingredienser:**
- [Mängd] [ingrediens] – [uppskattad kostnad] kr
- ...

**Tillagning:**
1. [Steg 1]
2. [Steg 2]
...

**💰 Totalkostnad: ~X kr (Y kr/portion)**

VIKTIGT:
- Uppskatta realistiska svenska matpriser i SEK
- Anpassa mängderna till ${portionCount} portioner
- Behåll originalreceptets instruktioner men gör dem tydliga
- Budget: ${budget} kr
- Inkludera källlänk`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: formatPrompt },
          { role: "user", content: "Formatera receptet enligt instruktionerna." },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI format error:", aiResp.status, errText);
      // Fallback: return raw scraped content
      return new Response(JSON.stringify({
        success: true,
        recipe: `### 🍽️ ${sourceTitle}\n*Källa: [${sourceTitle}](${sourceUrl})*\n\n${recipeMarkdown.slice(0, 3000)}`,
        source: sourceUrl,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const formattedRecipe = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({
      success: true,
      recipe: formattedRecipe,
      source: sourceUrl,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-web-recipe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Okänt fel" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
