import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CHAINS,
  currentWeekStart,
  fetchDealsForStore,
  normalizeStoreId,
} from "../_shared/storeRegistry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-cron-secret",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/**
 * Hur länge en körning får hålla på innan den lämnar över till nästa. Cron-
 * jobbet kör upprepade gånger under måndagsmorgonen, så en körning som inte
 * hinner klart plockas upp av nästa.
 */
const DEADLINE_MS = 45_000;

/** Antal butiker som hämtas parallellt. Håll nere för att vara snäll mot kedjorna. */
const CONCURRENCY = 5;

/** Max antal butiker per körning, som skyddsnät. */
const MAX_PER_RUN = 400;

interface StoreTarget {
  chain: string;
  store_id: string;
  name: string;
}

/**
 * Butiker som ska uppdateras: rikstäckande kedjor, kedjornas standardbutiker
 * och alla butiker som en användare faktiskt efterfrågat på senaste tiden.
 */
async function collectTargets(
  supabase: SupabaseClient,
  weekStart: string,
  activeDays: number,
): Promise<StoreTarget[]> {
  const targets = new Map<string, StoreTarget>();
  const add = (t: StoreTarget) => targets.set(`${t.chain}:${t.store_id}`, t);

  const hasFirecrawl = Boolean(Deno.env.get("FIRECRAWL_API_KEY"));

  // En kedja utan egen datakälla går inte att hämta utan Firecrawl. Att ta med
  // den ändå skulle göra att jobbet aldrig blir klart och försöker om i all
  // oändlighet under måndagsmorgonen.
  const isFetchable = (chain: string) => Boolean(CHAINS[chain]?.native) || hasFirecrawl;

  // Rikstäckande kedjor + varje kedjas standardbutik ska alltid vara färska.
  for (const [chain, config] of Object.entries(CHAINS)) {
    if (!isFetchable(chain)) continue;

    if (config.national) {
      add({ chain, store_id: "", name: config.name });
    } else if (config.defaultStoreId) {
      add({ chain, store_id: config.defaultStoreId, name: config.name });
    }
  }

  // Butiker som används på riktigt.
  const since = new Date(Date.now() - activeDays * 24 * 60 * 60 * 1000).toISOString();
  const { data: active, error } = await supabase
    .from("store_locations")
    .select("chain, store_id, name")
    .gte("last_requested_at", since)
    .limit(2000);

  if (error) throw new Error(`Kunde inte läsa store_locations: ${error.message}`);

  for (const row of active ?? []) {
    if (CHAINS[row.chain] && isFetchable(row.chain)) add(row as StoreTarget);
  }

  // Filtrera bort butiker som redan har innevarande veckas erbjudanden.
  const { data: fresh, error: freshError } = await supabase
    .from("store_deals")
    .select("chain, store_id")
    .eq("week_start", weekStart);

  if (freshError) throw new Error(`Kunde inte läsa store_deals: ${freshError.message}`);

  for (const row of fresh ?? []) {
    targets.delete(`${row.chain}:${row.store_id}`);
  }

  return [...targets.values()];
}

/** Hämtar och sparar erbjudandena för en butik. */
async function refreshStore(
  supabase: SupabaseClient,
  target: StoreTarget,
  weekStart: string,
): Promise<{ ok: boolean; count: number; error?: string }> {
  const storeId = normalizeStoreId(target.chain, target.store_id);

  try {
    const { deals, source, text, errors } = await fetchDealsForStore(target.chain, storeId);

    if (deals.length === 0) {
      return { ok: false, count: 0, error: errors.join("; ") || "inga erbjudanden" };
    }

    // Skriver över föregående veckas rad för butiken.
    const { error } = await supabase.from("store_deals").upsert(
      {
        chain: target.chain,
        store_id: storeId,
        store_name: target.name || CHAINS[target.chain].name,
        week_start: weekStart,
        source,
        deal_count: deals.length,
        deals,
        deals_text: text,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "chain,store_id" },
    );

    if (error) return { ok: false, count: 0, error: error.message };
    return { ok: true, count: deals.length };
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Kör uppgifter med begränsad parallellitet och respekterar deadline. */
async function runPool<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency: number,
  deadline: number,
): Promise<number> {
  let index = 0;
  let processed = 0;

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length && Date.now() < deadline) {
      const item = items[index++];
      await worker(item);
      processed++;
    }
  });

  await Promise.all(runners);
  return processed;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();
  const deadline = startedAt + DEADLINE_MS;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: settings } = await supabase
      .from("store_deals_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!settings) return json({ error: "Inställningar saknas" }, 500);

    // Cron-jobbet autentiserar sig med en delad hemlighet.
    const secret = req.headers.get("x-cron-secret");
    if (!secret || secret !== settings.cron_secret) {
      return json({ error: "Unauthorized" }, 401);
    }

    if (!settings.enabled) return json({ skipped: "disabled" });

    const body = await req.json().catch(() => ({}));
    const weekStart: string = body.weekStart ?? currentWeekStart();
    const force: boolean = body.force === true;

    // Med `force` hämtas allt på nytt även om veckans data redan finns.
    if (force) {
      await supabase.from("store_deals").delete().neq("chain", "");
    }

    const targets = (await collectTargets(supabase, weekStart, settings.active_days ?? 60))
      .slice(0, MAX_PER_RUN);

    if (targets.length === 0) {
      await supabase
        .from("store_deals_settings")
        .update({ last_run_at: new Date().toISOString() })
        .eq("id", 1);

      return json({ success: true, weekStart, upToDate: true, refreshed: 0, remaining: 0 });
    }

    let refreshed = 0;
    let dealsSaved = 0;
    const failures: Array<{ store: string; error: string }> = [];

    await runPool(
      targets,
      async (target) => {
        const result = await refreshStore(supabase, target, weekStart);
        if (result.ok) {
          refreshed++;
          dealsSaved += result.count;
        } else {
          failures.push({
            store: `${target.chain}/${target.store_id}`,
            error: result.error ?? "okänt fel",
          });
        }
      },
      CONCURRENCY,
      deadline,
    );

    await supabase
      .from("store_deals_settings")
      .update({ last_run_at: new Date().toISOString() })
      .eq("id", 1);

    const remaining = targets.length - refreshed - failures.length;

    console.log(
      `Veckouppdatering ${weekStart}: ${refreshed} butiker, ${dealsSaved} erbjudanden, ` +
        `${failures.length} fel, ${remaining} kvar (${Date.now() - startedAt} ms)`,
    );

    return json({
      success: true,
      weekStart,
      refreshed,
      dealsSaved,
      remaining,
      failures: failures.slice(0, 20),
      durationMs: Date.now() - startedAt,
    });
  } catch (e) {
    console.error("refresh-store-deals misslyckades:", e);
    return json({ error: e instanceof Error ? e.message : "Något gick fel" }, 500);
  }
});


