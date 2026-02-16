import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STORE_URLS: Record<string, string> = {
  ica: "https://www.ica.se/erbjudanden/",
  coop: "https://www.coop.se/erbjudanden/",
  willys: "https://www.willys.se/erbjudanden",
  lidl: "https://www.lidl.se/erbjudanden",
  hemkop: "https://www.hemkop.se/erbjudanden",
  citygross: "https://www.citygross.se/erbjudanden",
  netto: "https://www.netto.se/erbjudanden/",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { store } = await req.json();
    
    if (!store || !STORE_URLS[store]) {
      return new Response(JSON.stringify({ error: "Ogiltig butik" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Firecrawl är inte konfigurerat" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = STORE_URLS[store];
    console.log("Scraping store deals from:", url);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl error:", data);
      return new Response(JSON.stringify({ error: "Kunde inte hämta erbjudanden" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const markdown = data?.data?.markdown || data?.markdown || "";
    
    // Trim to reasonable length for AI context
    const trimmed = markdown.slice(0, 8000);

    return new Response(JSON.stringify({ success: true, text: trimmed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-store-deals error:", e);
    return new Response(JSON.stringify({ error: "Något gick fel" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
