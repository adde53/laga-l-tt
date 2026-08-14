/**
 * Adapters för att hämta riktiga erbjudanden direkt från de svenska matkedjornas
 * egna datakällor.
 *
 * Varje adapter returnerar en normaliserad `Deal[]` så att resten av systemet
 * (AI-prompten, UI:t) inte behöver bry sig om vilken kedja datan kom ifrån.
 *
 * Verifierade källor:
 *  - ICA      : server-renderad JSON i `window.__INITIAL_DATA__` på butikens erbjudandesida
 *  - Willys   : Axfood publika kampanj-API (/search/campaigns/offline)
 *  - Hemköp   : samma Axfood-API på hemkop.se
 *  - Lidl     : /p/api/gridboxes/SE/sv
 *  - Coop     : ingen öppen endpoint hittad -> Firecrawl-fallback
 *  - City Gross / Netto: -> Firecrawl-fallback
 */

export interface Deal {
  /** Produktnamn, t.ex. "Blåbär 125g" */
  name: string;
  /** Varumärke/leverantör om känt */
  brand?: string;
  /** Erbjudandepriset som text, t.ex. "19,90/st" eller "3 för 50:-" */
  price?: string;
  /** Numeriskt pris i kronor när det går att utläsa */
  priceValue?: number;
  /** Jämförpris, t.ex. "159:20 kr/kg" */
  comparePrice?: string;
  /** Villkor, t.ex. "Max 5 köp" eller "Vid köp av 3" */
  condition?: string;
  /** Sista giltighetsdag, ISO-datum (YYYY-MM-DD) */
  validTo?: string;
  /** Varugrupp, t.ex. "Mejeri" */
  category?: string;
}

export interface StoreResult {
  store: string;
  storeName: string;
  storeId?: string;
  source: "native" | "firecrawl";
  deals: Deal[];
  /** Formaterad text som skickas vidare till AI-modellen */
  text: string;
}

/** En valbar butik inom en kedja. */
export interface StoreRef {
  /** Butiks-ID (Axfood) eller URL-slug (ICA) som identifierar butiken. */
  id: string;
  name: string;
  town?: string;
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const REQUEST_TIMEOUT_MS = 20_000;

async function httpGet(url: string, accept = "application/json"): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { "User-Agent": UA, Accept: accept, "Accept-Language": "sv-SE,sv;q=0.9" },
      signal: controller.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* Hjälpfunktioner                                                      */
/* ------------------------------------------------------------------ */

/**
 * Plockar ut ett balanserat JSON-värde (array eller objekt) som följer efter
 * `"key":` i en råtext. Klarar strängar, escapes och nästlade strukturer.
 *
 * Detta är betydligt robustare än att försöka JSON-parsa hela den inbäddade
 * state-blobben, som ofta innehåller JS-specifika värden (`undefined`,
 * `new Map([...])`) som inte är giltig JSON.
 */
export function extractJsonValue<T = unknown>(source: string, key: string): T | null {
  const needle = `"${key}":`;
  let searchFrom = 0;

  while (true) {
    const keyIdx = source.indexOf(needle, searchFrom);
    if (keyIdx === -1) return null;

    let i = keyIdx + needle.length;
    while (i < source.length && /\s/.test(source[i])) i++;

    const open = source[i];
    if (open !== "[" && open !== "{") {
      searchFrom = keyIdx + needle.length;
      continue;
    }
    const close = open === "[" ? "]" : "}";

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let j = i; j < source.length; j++) {
      const ch = source[j];

      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        if (inString) escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) {
          const slice = source.slice(i, j + 1);
          try {
            return JSON.parse(sanitizeJsonLiteral(slice)) as T;
          } catch {
            searchFrom = keyIdx + needle.length;
            break;
          }
        }
      }
    }

    if (searchFrom <= keyIdx) return null;
  }
}

/**
 * Ersätter JS-specifika literaler som inte är giltig JSON. Sidornas inbäddade
 * state är serialiserad av ramverket och innehåller t.ex. `"usesLeft":undefined`.
 * Vi matchar bara literaler som står som ett komplett värde (följt av `,`, `}`
 * eller `]`) för att inte råka röra innehåll inuti strängar.
 */
function sanitizeJsonLiteral(input: string): string {
  return input.replace(/:\s*(undefined|NaN)\s*(?=[,}\]])/g, ": null");
}

/** Normaliserar ett datum till YYYY-MM-DD. */
function toIsoDate(input: unknown): string | undefined {
  if (input === null || input === undefined || input === "") return undefined;

  let d: Date;
  if (typeof input === "number") {
    // Vissa källor (Lidl) använder epoch i sekunder, andra (Axfood) i millisekunder.
    d = new Date(input < 1e11 ? input * 1000 : input);
  } else {
    d = new Date(String(input));
  }

  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

/** Städar bort dubbla mellanslag och trimmar. */
function clean(s: unknown): string | undefined {
  if (typeof s !== "string") return undefined;
  const t = s.replace(/\s+/g, " ").trim();
  return t.length ? t : undefined;
}

/* ------------------------------------------------------------------ */
/* ICA                                                                  */
/* ------------------------------------------------------------------ */

interface IcaOffer {
  id?: string;
  details?: {
    name?: string;
    brand?: string;
    mechanicInfo?: string;
    packageInformation?: string;
    customerInformation?: string;
  };
  category?: { articleGroupName?: string };
  comparisonPrice?: string;
  condition?: string;
  restriction?: string;
  validTo?: string;
}

/**
 * ICA renderar veckans erbjudanden server-side i `window.__INITIAL_DATA__`
 * på butikens erbjudandesida: https://www.ica.se/erbjudanden/<butiks-slug>/
 */
export async function fetchIcaDeals(storeSlug: string): Promise<Deal[]> {
  const url = `https://www.ica.se/erbjudanden/${encodeURIComponent(storeSlug)}/`;
  const res = await httpGet(url, "text/html");
  if (!res.ok) throw new Error(`ICA svarade ${res.status}`);

  const html = await res.text();

  // weeklyOffers = butikens ordinarie veckoerbjudanden (kräver ingen inloggning)
  const offers =
    extractJsonValue<IcaOffer[]>(html, "weeklyOffers") ??
    extractJsonValue<IcaOffer[]>(html, "offers") ??
    [];

  return offers
    .filter((o) => o?.details?.name)
    .map((o) => {
      const pkg = clean(o.details?.packageInformation);
      const extra = clean(o.details?.customerInformation);
      const name = [clean(o.details?.name), pkg].filter(Boolean).join(" ");

      return {
        name,
        brand: clean(o.details?.brand),
        price: clean(o.details?.mechanicInfo),
        priceValue: parsePrice(o.details?.mechanicInfo),
        comparePrice: clean(o.comparisonPrice),
        condition: clean(o.condition) ?? clean(o.restriction) ?? extra,
        validTo: toIsoDate(o.validTo),
        category: clean(o.category?.articleGroupName),
      } satisfies Deal;
    });
}

interface IcaStoreDocument {
  Name?: string;
  MarketingName?: string;
  Url?: string;
  VisitingCity?: string;
}

/**
 * ICA:s butikssök. Returnerar butikens "slug" (sista delen av URL:en), vilket
 * är exakt det som behövs för att bygga erbjudande-URL:en. ICA accepterar inte
 * enbart butiksnumret – hela slugen krävs.
 */
export async function fetchIcaStores(query: string, take = 30): Promise<StoreRef[]> {
  const url =
    `https://www.ica.se/api/store/search` +
    `?query=${encodeURIComponent(query)}&take=${take}`;

  const res = await httpGet(url);
  if (!res.ok) throw new Error(`ICA butikssök svarade ${res.status}`);

  const data = await res.json();
  const docs: IcaStoreDocument[] = data?.Documents ?? [];

  return docs
    .map((d): StoreRef | null => {
      // "https://www.ica.se/butiker/maxi/nacka/maxi-ica-stormarknad-nacka-1004282/"
      const slug = d.Url?.replace(/\/+$/, "").split("/").pop();
      if (!slug || !/-\d+$/.test(slug)) return null;

      return {
        id: slug,
        name: clean(d.MarketingName) ?? clean(d.Name) ?? slug,
        town: clean(d.VisitingCity),
      };
    })
    .filter((s): s is StoreRef => s !== null);
}

/* ------------------------------------------------------------------ */
/* Axfood (Willys + Hemköp)                                             */
/* ------------------------------------------------------------------ */
interface AxfoodPromotion {
  price?: number;
  rewardLabel?: string;
  cartLabel?: string;
  comparePrice?: string;
  conditionLabel?: string;
  redeemLimitLabel?: string;
  validUntil?: number;
  qualifyingCount?: number;
}

interface AxfoodProduct {
  name?: string;
  manufacturer?: string;
  potentialPromotions?: AxfoodPromotion[];
  productBasketType?: { code?: string };
}

/**
 * Axfoods publika kampanj-API. Samma kontrakt för Willys och Hemköp,
 * bara olika hostnamn och butiks-ID-serier.
 */
export async function fetchAxfoodDeals(
  host: "www.willys.se" | "www.hemkop.se",
  storeId: string,
  size = 300,
): Promise<Deal[]> {
  const url =
    `https://${host}/search/campaigns/offline` +
    `?q=${encodeURIComponent(storeId)}&type=PERSONAL_GENERAL&size=${size}`;

  const res = await httpGet(url);
  if (!res.ok) throw new Error(`${host} svarade ${res.status}`);

  const data = await res.json();
  const results: AxfoodProduct[] = data?.results ?? [];

  return results
    .filter((p) => p?.name)
    .map((p) => {
      const promo = p.potentialPromotions?.[0] ?? {};
      const unit = p.productBasketType?.code === "KG" ? "/kg" : undefined;

      return {
        name: clean(p.name)!,
        brand: clean(p.manufacturer),
        price: clean(promo.rewardLabel) ?? clean(promo.cartLabel),
        priceValue: typeof promo.price === "number" ? promo.price : undefined,
        comparePrice: clean(promo.comparePrice) ?? unit,
        condition: clean(promo.conditionLabel) ?? clean(promo.redeemLimitLabel),
        validTo: toIsoDate(promo.validUntil),
      } satisfies Deal;
    });
}

/** Hämtar Axfoods butikslista så att användaren kan välja rätt butik. */
export async function fetchAxfoodStores(
  host: "www.willys.se" | "www.hemkop.se",
): Promise<StoreRef[]> {
  const res = await httpGet(`https://${host}/axfood/rest/store`);
  if (!res.ok) throw new Error(`${host} butikslista svarade ${res.status}`);

  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter((s) => s?.storeId && s?.name)
    .map((s) => ({
      id: String(s.storeId),
      name: String(s.name),
      town: s?.address?.town ? String(s.address.town) : undefined,
    }));
}

/* ------------------------------------------------------------------ */
/* Lidl                                                                 */
/* ------------------------------------------------------------------ */

interface LidlGridbox {
  fullTitle?: string;
  title?: string;
  brand?: { name?: string };
  keyfacts?: { supplementalDescription?: string };
  category?: string;
  /** Epoch i sekunder */
  storeEndDate?: number;
  price?: {
    price?: number;
    currencySymbol?: string;
    basePrice?: { text?: string };
    packaging?: { text?: string };
  };
}

/** Lidls veckoerbjudanden ligger i deras gridbox-API. */
export async function fetchLidlDeals(): Promise<Deal[]> {
  const res = await httpGet("https://www.lidl.se/p/api/gridboxes/SE/sv");
  if (!res.ok) throw new Error(`Lidl svarade ${res.status}`);

  const items: LidlGridbox[] = await res.json();

  return (Array.isArray(items) ? items : [])
    // Gridboxen innehåller även ordinarie sortiment utan prisuppgift –
    // bara poster med ett faktiskt pris är erbjudanden vi kan räkna på.
    .filter((i) => (i?.fullTitle || i?.title) && typeof i?.price?.price === "number")
    .map((i) => {
      const pkg = clean(i.price?.packaging?.text);
      const base = clean(i.fullTitle) ?? clean(i.title)!;

      return {
        name: [base, pkg].filter(Boolean).join(" "),
        brand: clean(i.brand?.name),
        price: `${i.price!.price!.toFixed(2).replace(".", ",")} ${i.price?.currencySymbol ?? "kr"}`,
        priceValue: i.price!.price!,
        comparePrice: clean(i.price?.basePrice?.text),
        validTo: toIsoDate(i.storeEndDate),
        category: clean(i.category),
      } satisfies Deal;
    });
}

/* ------------------------------------------------------------------ */
/* Firecrawl-fallback (Coop, City Gross, Netto)                         */
/* ------------------------------------------------------------------ */

/**
 * För kedjor utan öppen datakälla faller vi tillbaka på Firecrawl och låter
 * dess strukturerade extraktion plocka ut erbjudandena ur den renderade sidan.
 */
export async function fetchDealsViaFirecrawl(url: string, apiKey: string): Promise<Deal[]> {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      formats: ["json"],
      onlyMainContent: true,
      waitFor: 5000,
      jsonOptions: {
        prompt:
          "Extrahera alla matvaruerbjudanden som visas på sidan. " +
          "För varje erbjudande: produktnamn, varumärke, pris (som det visas), " +
          "jämförpris, eventuellt villkor och sista giltighetsdag.",
        schema: {
          type: "object",
          properties: {
            deals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  brand: { type: "string" },
                  price: { type: "string" },
                  comparePrice: { type: "string" },
                  condition: { type: "string" },
                  validTo: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
          required: ["deals"],
        },
      },
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Firecrawl svarade ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  }

  const extracted = body?.data?.json?.deals ?? body?.json?.deals ?? [];

  return (Array.isArray(extracted) ? extracted : [])
    .filter((d: Record<string, unknown>) => typeof d?.name === "string" && d.name.trim())
    .map((d: Record<string, unknown>) => ({
      name: clean(d.name)!,
      brand: clean(d.brand),
      price: clean(d.price),
      priceValue: parsePrice(d.price),
      comparePrice: clean(d.comparePrice),
      condition: clean(d.condition),
      validTo: toIsoDate(d.validTo),
    } satisfies Deal));
}

/* ------------------------------------------------------------------ */
/* Prisparsning + textformatering                                       */
/* ------------------------------------------------------------------ */

/**
 * Plockar ut ett numeriskt kronbelopp ur svenska prisetiketter som
 * "19,90/st", "25 kr/st", "3 för 50:-" eller "159:20 kr/kg".
 */
export function parsePrice(label: unknown): number | undefined {
  if (typeof label !== "string") return undefined;

  // "3 för 50:-" -> styckpris
  const forMatch = label.match(/(\d+)\s*f(?:ö|o)r\s*(\d+(?:[.,:]\d+)?)/i);
  if (forMatch) {
    const qty = Number(forMatch[1]);
    const total = Number(forMatch[2].replace(/[,:]/, "."));
    if (qty > 0 && Number.isFinite(total)) return Math.round((total / qty) * 100) / 100;
  }

  // "19,90", "25", "159:20"
  const m = label.match(/(\d+(?:[.,:]\d{1,2})?)/);
  if (!m) return undefined;

  const n = Number(m[1].replace(/[,:]/, "."));
  return Number.isFinite(n) ? n : undefined;
}

/** Formaterar erbjudanden till kompakt markdown som AI-modellen får som kontext. */
export function formatDealsAsText(storeName: string, deals: Deal[]): string {
  if (!deals.length) return `## Erbjudanden – ${storeName}\n\n_Inga erbjudanden hittades._`;

  const lines = deals.map((d) => {
    const parts: string[] = [];
    parts.push(d.brand ? `${d.name} (${d.brand})` : d.name);
    if (d.price) parts.push(`**${d.price}**`);
    if (d.comparePrice) parts.push(`jfr ${d.comparePrice}`);
    if (d.condition) parts.push(d.condition);
    if (d.validTo) parts.push(`t.o.m. ${d.validTo}`);
    return `- ${parts.join(" – ")}`;
  });

  return `## Erbjudanden – ${storeName}\n\n${lines.join("\n")}`;
}










