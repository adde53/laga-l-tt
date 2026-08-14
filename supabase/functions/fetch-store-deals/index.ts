import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CHAINS,
  CHAIN_KEYS,
  currentWeekStart,
  fetchDealsForStore,
  normalizeStoreId,
} from "../_shared/storeRegistry.ts";
import { StoreRef } from "../_shared/stores.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/**
 * Registrerar att butiken används, så att den kommer med i den veckovisa
 * uppdateringen. Körs i bakgrunden – ska aldrig blockera svaret till användaren.
 */
async function touchStore(
  supabase: SupabaseClient,
  chain: string,
  storeId: string,
  name: string,
  town?: string,
): Promise<void> {
  try {
    const { error } = await supabase.from("store_locations").upsert(
      {
        chain,
        store_id: storeId,
        name,
        town: town ?? null,
        last_requested_at: new Date().toISOString(),
      },
      { onConflict: "chain,store_id" },
    );

    if (error) {
      console.error(`Kunde inte registrera butik ${chain}/${storeId}:`, error.message);
    }
  } catch (e) {
    // Registreringen är ren bokföring – den får aldrig fälla förfrågan.
    console.error(`Kunde inte registrera butik ${chain}/${storeId}:`, e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    return await handleRequest(req);
  } catch (e) {
    console.error("fetch-store-deals misslyckades:", e);
    return json({ error: "Något gick fel vid hämtning av erbjudanden" }, 500);
  }
});

async function handleRequest(req: Request): Promise<Response> {
  let payload: {
    store?: string;
    storeId?: string;
    storeName?: string;
    action?: string;
    query?: string;
    refresh?: boolean;
  };

  try {
    payload = await req.json();
  } catch {
    return json({ error: "Ogiltig förfrågan" }, 400);
  }

  const { store, storeId, storeName, action, query, refresh } = payload;

  if (!store || !CHAINS[store]) {
    return json({ error: "Ogiltig butik", validStores: CHAIN_KEYS }, 400);
  }

  const config = CHAINS[store];

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  /* ---------------------------------------------------------------- */
  /* Lista/sök butiker                                                  */
  /* ---------------------------------------------------------------- */
  if (action === "listStores") {
    if (!config.listStores) {
      return json({ success: true, stores: [], searchable: false });
    }
    if (config.storeSearchRequiresQuery && !query?.trim()) {
      return json({ success: true, stores: [], searchable: true, requiresQuery: true });
    }
    try {
      const stores: StoreRef[] = await config.listStores(query?.trim() ?? "");
      return json({
        success: true,
        stores,
        searchable: true,
        requiresQuery: config.storeSearchRequiresQuery ?? false,
      });
    } catch (e) {
      console.error(`Kunde inte lista butiker för ${store}:`, e);
      return json({ error: "Kunde inte hämta butikslistan" }, 502);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Hämta erbjudanden                                                  */
  /* ---------------------------------------------------------------- */
  const effectiveStoreId = normalizeStoreId(store, storeId);
  const weekStart = currentWeekStart();
  const displayName = storeName?.trim() || config.name;

  // Registrera användningen så butiken kommer med i veckojobbet.
  const touch = touchStore(supabase, store, effectiveStoreId, displayName);

  // 1. Innevarande veckas erbjudanden ur databasen – snabbaste vägen.
  if (!refresh) {
    const { data: cached, error } = await supabase
      .from("store_deals")
      .select("store_name, source, deals, deals_text, deal_count, fetched_at")
      .eq("chain", store)
      .eq("store_id", effectiveStoreId)
      .eq("week_start", weekStart)
      .maybeSingle();

    if (error) {
      console.error("Kunde inte läsa store_deals:", error.message);
    } else if (cached) {
      await touch;
      return json({
        success: true,
        store,
        storeName: cached.store_name,
        storeId: effectiveStoreId,
        source: cached.source,
        deals: cached.deals,
        text: cached.deals_text,
        weekStart,
        cached: true,
        fetchedAt: cached.fetched_at,
      });
    }
  }

  // 2. Inget sparat för veckan (ny butik, eller cron har inte hunnit) –
  //    hämta live och spara så nästa besökare slipper vänta.
  const { deals, source, text, errors } = await fetchDealsForStore(store, effectiveStoreId);

  if (deals.length === 0) {
    // Hellre förra veckans erbjudanden än inga alls.
    const { data: stale } = await supabase
      .from("store_deals")
      .select("store_name, source, deals, deals_text, week_start, fetched_at")
      .eq("chain", store)
      .eq("store_id", effectiveStoreId)
      .maybeSingle();

    if (stale) {
      console.warn(`${store}/${effectiveStoreId}: faller tillbaka på ${stale.week_start}`);
      await touch;
      return json({
        success: true,
        store,
        storeName: stale.store_name,
        storeId: effectiveStoreId,
        source: stale.source,
        deals: stale.deals,
        text: stale.deals_text,
        weekStart: stale.week_start,
        cached: true,
        stale: true,
        fetchedAt: stale.fetched_at,
      });
    }

    return json(
      {
        error: `Kunde inte hämta erbjudanden från ${config.name} just nu. Försök igen om en stund.`,
        details: errors,
      },
      502,
    );
  }

  const { error: saveError } = await supabase.from("store_deals").upsert(
    {
      chain: store,
      store_id: effectiveStoreId,
      store_name: displayName,
      week_start: weekStart,
      source,
      deal_count: deals.length,
      deals,
      deals_text: text,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "chain,store_id" },
  );

  if (saveError) console.error("Kunde inte spara store_deals:", saveError.message);

  await touch;

  return json({
    success: true,
    store,
    storeName: displayName,
    storeId: effectiveStoreId,
    source,
    deals,
    text,
    weekStart,
    cached: false,
  });
}



