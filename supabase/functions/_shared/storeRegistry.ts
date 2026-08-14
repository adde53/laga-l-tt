/**
 * Butiksregister – en enda källa till sanning för vilka kedjor som stöds och
 * hur deras erbjudanden hämtas. Används av både `fetch-store-deals` (på
 * begäran) och `refresh-store-deals` (veckovis cron).
 */
import {
  Deal,
  StoreRef,
  fetchAxfoodDeals,
  fetchAxfoodStores,
  fetchDealsViaFirecrawl,
  fetchIcaDeals,
  fetchIcaStores,
  fetchLidlDeals,
  formatDealsAsText,
} from "./stores.ts";

export type DealSource = "native" | "firecrawl";

export interface ChainConfig {
  name: string;
  /** Hämtar erbjudanden direkt från kedjans egen datakälla. */
  native?: (storeId: string) => Promise<Deal[]>;
  /** Standardbutik när användaren inte valt någon. */
  defaultStoreId?: string;
  /** Sida som Firecrawl skrapar om ingen native-källa finns eller den fallerar. */
  fallbackUrl: string;
  /** Butikslista/sökning som kan exponeras i UI:t. */
  listStores?: (query: string) => Promise<StoreRef[]>;
  /** True om `listStores` kräver en sökterm (t.ex. ortsnamn). */
  storeSearchRequiresQuery?: boolean;
  /**
   * True om erbjudandena är rikstäckande och alltså inte skiljer sig mellan
   * butiker. Sådana kedjor lagras med tomt butiks-ID.
   */
  national?: boolean;
}

export const CHAINS: Record<string, ChainConfig> = {
  ica: {
    name: "ICA",
    // ICA:s erbjudanden är butiksspecifika. Slugen är den som syns i URL:en
    // på https://www.ica.se/erbjudanden/<slug>/
    defaultStoreId: Deno.env.get("ICA_DEFAULT_STORE") ?? "maxi-ica-stormarknad-nacka-1004282",
    native: (storeId) => fetchIcaDeals(storeId),
    listStores: (query) => fetchIcaStores(query),
    storeSearchRequiresQuery: true,
    fallbackUrl: "https://www.ica.se/erbjudanden/",
  },
  willys: {
    name: "Willys",
    defaultStoreId: Deno.env.get("WILLYS_DEFAULT_STORE") ?? "2117",
    native: (storeId) => fetchAxfoodDeals("www.willys.se", storeId),
    listStores: () => fetchAxfoodStores("www.willys.se"),
    fallbackUrl: "https://www.willys.se/erbjudanden",
  },
  hemkop: {
    name: "Hemköp",
    defaultStoreId: Deno.env.get("HEMKOP_DEFAULT_STORE") ?? "4660",
    native: (storeId) => fetchAxfoodDeals("www.hemkop.se", storeId),
    listStores: () => fetchAxfoodStores("www.hemkop.se"),
    fallbackUrl: "https://www.hemkop.se/erbjudanden",
  },
  lidl: {
    name: "Lidl",
    // Lidl har rikstäckande erbjudanden – ingen butiksväljare behövs.
    national: true,
    native: () => fetchLidlDeals(),
    fallbackUrl: "https://www.lidl.se/c/veckans-erbjudanden/s10007373",
  },
  coop: {
    name: "Coop",
    // Ingen öppen endpoint hittad – Firecrawl får rendera sidan.
    national: true,
    fallbackUrl: "https://www.coop.se/butiker-erbjudanden/",
  },
  citygross: {
    name: "City Gross",
    national: true,
    fallbackUrl: "https://www.citygross.se/erbjudanden",
  },
};

export const CHAIN_KEYS = Object.keys(CHAINS);

export interface FetchedDeals {
  deals: Deal[];
  source: DealSource;
  text: string;
  errors: string[];
}

/**
 * Hämtar erbjudanden för en butik. Kedjans egen datakälla används i första
 * hand; Firecrawl är fallback (och enda källa för Coop/City Gross).
 */
export async function fetchDealsForStore(
  chain: string,
  storeId: string,
): Promise<FetchedDeals> {
  const config = CHAINS[chain];
  if (!config) throw new Error(`Okänd kedja: ${chain}`);

  const errors: string[] = [];
  let deals: Deal[] = [];
  let source: DealSource = "native";

  if (config.native) {
    try {
      deals = await config.native(storeId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`${chain}/${storeId}: native-hämtning misslyckades – ${msg}`);
      errors.push(`native: ${msg}`);
    }
  }

  if (deals.length === 0) {
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (apiKey) {
      try {
        deals = await fetchDealsViaFirecrawl(config.fallbackUrl, apiKey);
        source = "firecrawl";
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`${chain}/${storeId}: Firecrawl misslyckades – ${msg}`);
        errors.push(`firecrawl: ${msg}`);
      }
    } else {
      errors.push("firecrawl: FIRECRAWL_API_KEY saknas");
    }
  }

  return { deals, source, text: formatDealsAsText(config.name, deals), errors };
}

/**
 * Normaliserar butiks-ID. Rikstäckande kedjor lagras med tom sträng så att de
 * bara får en rad i databasen.
 */
export function normalizeStoreId(chain: string, storeId?: string | null): string {
  const config = CHAINS[chain];
  if (!config) return "";
  if (config.national) return "";
  return storeId?.trim() || config.defaultStoreId || "";
}

/**
 * Måndagen i innevarande vecka enligt svensk tid – erbjudandena byts på
 * måndagar. Beräknas via Intl så att resultatet blir rätt oavsett vilken
 * tidszon servern kör i (Deno Deploy kör i UTC).
 */
export function currentWeekStart(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Stockholm",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  const weekdays: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  const weekday = weekdays[get("weekday")] ?? 1;
  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;

  // Räkna baklänges i UTC – datumdelarna är redan svensk kalenderdag, så det
  // här flyttar bara kalenderdatumet utan att tidszoner blandar sig i.
  const asUtc = Date.UTC(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
  );
  const monday = new Date(asUtc - daysSinceMonday * 24 * 60 * 60 * 1000);

  return monday.toISOString().slice(0, 10);
}


