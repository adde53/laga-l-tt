import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pdfText, craving, budget, mode, store, cuisines, selectedDays, portions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const dayNames: Record<string, string> = {
      monday: "Måndag", tuesday: "Tisdag", wednesday: "Onsdag", thursday: "Torsdag",
      friday: "Fredag", saturday: "Lördag", sunday: "Söndag"
    };
    const selectedDayNames = (selectedDays && selectedDays.length > 0)
      ? selectedDays.map((d: string) => dayNames[d] || d)
      : Object.values(dayNames);

    const cuisineText = cuisines && cuisines.length > 0
      ? `Matinspiration/kökstyp: ${cuisines.join(", ")}. Anpassa recepten efter dessa kök.`
      : "";

    const portionCount = portions || "4";

    const recipeStructure = `Varje recept MÅSTE följa denna struktur:
1. **Rättnamn** som rubrik
2. **Kort beskrivning** (1-2 meningar om rätten)
3. **👥 ${portionCount} portioner**
4. **Ingredienser** - lista VARJE ingrediens med:
   - Mängd
   - Ungefärligt pris i SEK
   Exempel: "- 500g kycklingfilé – 45 kr"
5. **Tillagning** - numrerade steg med tydliga instruktioner
6. **💰 Totalkostnad: X kr (Y kr/portion)**`;

    const systemPrompt = `Du är en glad och kreativ svensk kock som hjälper folk att laga billig och god mat. Du svarar ALLTID på svenska.

Antal portioner: ${portionCount} portioner. Anpassa alla mängder efter detta.

${mode === "weekly" ? `Skapa en veckomeny för DESSA dagar: ${selectedDayNames.join(", ")}. Regler:
- Vardagar: enkla vardagsrätter
- Fredag (om inkluderad): något extra enkelt (typ tacofredag eller snabb pasta)
- Lördag-söndag (om inkluderade): lite mer festlig mat

${recipeStructure}

- Avsluta med total veckokostnad: "## 💰 Totalt veckan: X kr (snitt Y kr/dag, Z kr/portion)"` : `Skapa ETT recept.

${recipeStructure}`}

${cuisineText}

Formatera svaret i markdown. Använd emojis för att göra det roligt! 🍽️

VIKTIGT: Avsluta ALLTID med dessa två sektioner (använd exakt dessa rubriker):

## 🛒 Inköpslista
Lista alla ingredienser som behöver handlas, en per rad med "- " prefix. Inkludera mängd och pris.

## 🏠 Har du troligen hemma?
Lista vanliga basvaror (salt, peppar, olja, smör, socker, mjöl, kryddor etc.) som receptet behöver men som de flesta har hemma. En per rad med "- " prefix.

${pdfText ? `Här är erbjudanden från reklamblad att använda:\n${pdfText}` : "Inga reklamblad tillgängliga."}

${store && store !== "none" ? `Användaren handlar på ${store.toUpperCase()}. Prioritera ingredienser och produkter som brukar finnas till bra pris på ${store.toUpperCase()}.` : "Ingen specifik butik vald, föreslå vanliga billiga ingredienser."}

Budget: ${budget} kr
${craving ? `Användaren är sugen på: ${craving}` : "Inget speciellt önskemål."}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: craving ? `Jag är sugen på ${craving} och har ${budget} kr att lägga.${mode === "weekly" ? " Gör en veckomeny!" : " Ge mig ett recept!"}` : `Ge mig ${mode === "weekly" ? "en veckomeny" : "ett recept"} för ${budget} kr.` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "För många förfrågningar, vänta lite och försök igen." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Receptskaparen är tillfälligt otillgänglig, försök igen senare." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Recipe gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Kunde inte skapa recept just nu, försök igen." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("recipe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Okänt fel" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
