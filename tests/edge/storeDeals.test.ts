/**
 * Integrationstest för erbjudandeflödet.
 *
 * De riktiga edge-funktionerna startas som separata processer och pekas mot en
 * PostgREST-emulator vars schema läses ur migrationsfilen. Ett felstavat
 * kolumnnamn i en funktion får därför testet att fallera.
 *
 * Butikernas API:er anropas på riktigt, så testet avslöjar även om någon kedja
 * har ändrat sin sajt.
 *
 *   deno test --allow-all tests/edge/storeDeals.test.ts
 */
import { assert, assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { parseSchema, startMockPostgrest } from "./mockPostgrest.ts";

const ROOT = new URL("../../", import.meta.url).pathname;
const MIGRATION = `${ROOT}supabase/migrations/20260814093000_store_deals_weekly_cache.sql`;

const schema = parseSchema(await Deno.readTextFile(MIGRATION));

const CRON_SECRET = "test-cron-secret";
const MOCK_PORT = 54999;
const FN_PORT = 8000;

type Row = Record<string, unknown>;

/** Väntar tills en port svarar. */
async function waitForPort(port: number, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const conn = await Deno.connect({ hostname: "127.0.0.1", port });
      conn.close();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error(`Port ${port} svarade inte inom ${timeoutMs} ms`);
}

/** Startar mock-databasen och en edge-funktion, kör testet och städar upp. */
async function withFunction(
  fnName: string,
  seed: Record<string, Row[]>,
  run: (ctx: {
    call: (body: unknown, headers?: Record<string, string>) => Promise<Response>;
    db: ReturnType<typeof startMockPostgrest>["db"];
  }) => Promise<void>,
) {
  const mock = startMockPostgrest(schema, seed);

  const child = new Deno.Command("deno", {
    args: ["run", "--allow-net", "--allow-env", `supabase/functions/${fnName}/index.ts`],
    cwd: ROOT,
    env: {
      ...Deno.env.toObject(),
      SUPABASE_URL: `http://localhost:${MOCK_PORT}`,
      SUPABASE_SERVICE_ROLE_KEY: "service-role-test-key",
      FIRECRAWL_API_KEY: "",
    },
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  try {
    await waitForPort(FN_PORT);
    await run({
      call: (body, headers) =>
        fetch(`http://localhost:${FN_PORT}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(headers ?? {}) },
          body: JSON.stringify(body),
        }),
      db: mock.db,
    });
  } finally {
    try {
      child.kill("SIGKILL");
    } catch { /* redan död */ }
    await child.status;
    await child.stdout.cancel().catch(() => {});
    await child.stderr.cancel().catch(() => {});
    await mock.stop();
    await new Promise((r) => setTimeout(r, 300));
  }
}

const settingsSeed = (over: Row = {}): Record<string, Row[]> => ({
  store_deals_settings: [
    { id: 1, enabled: true, active_days: 60, cron_secret: CRON_SECRET, last_run_at: null, ...over },
  ],
  store_deals: [],
  store_locations: [],
});

/* ------------------------------------------------------------------ */

Deno.test("migrationen definierar de tabeller och kolumner koden använder", () => {
  assert(schema.store_deals, "store_deals saknas");
  assert(schema.store_locations, "store_locations saknas");
  assert(schema.store_deals_settings, "store_deals_settings saknas");

  assertEquals(schema.store_deals.primaryKey, ["chain", "store_id"]);
  assertEquals(schema.store_locations.primaryKey, ["chain", "store_id"]);

  const dealCols = ["chain", "store_id", "store_name", "week_start", "source",
    "deal_count", "deals", "deals_text", "fetched_at"];
  for (const col of dealCols) {
    assert(schema.store_deals.columns.has(col), `store_deals saknar kolumnen ${col}`);
  }

  for (const col of ["chain", "store_id", "name", "town", "last_requested_at"]) {
    assert(schema.store_locations.columns.has(col), `store_locations saknar kolumnen ${col}`);
  }

  for (const col of ["enabled", "active_days", "last_run_at", "cron_secret"]) {
    assert(schema.store_deals_settings.columns.has(col), `store_deals_settings saknar ${col}`);
  }
});

Deno.test("fetch-store-deals: hämtar live, sparar i databasen och registrerar butiken", async () => {
  await withFunction("fetch-store-deals", settingsSeed(), async ({ call, db }) => {
    const res = await call({ store: "willys", storeId: "2117", storeName: "Willys Test" });
    const data = await res.json();

    assertEquals(res.status, 200);
    assertEquals(data.success, true);
    assertEquals(data.cached, false);
    assertEquals(data.source, "native");
    assert(data.deals.length > 50, `förväntade många erbjudanden, fick ${data.deals.length}`);
    assert(data.text.includes("Erbjudanden"), "texten till AI:n saknar rubrik");

    const saved = db.tables.store_deals;
    assertEquals(saved.length, 1);
    assertEquals(saved[0].chain, "willys");
    assertEquals(saved[0].store_id, "2117");
    assertEquals(saved[0].deal_count, data.deals.length);
    assertEquals(saved[0].week_start, data.weekStart);

    const loc = db.tables.store_locations;
    assertEquals(loc.length, 1);
    assertEquals(loc[0].chain, "willys");
    assert(loc[0].last_requested_at, "last_requested_at ska sättas");
  });
});

Deno.test("fetch-store-deals: läser från databasen när veckans data redan finns", async () => {
  await withFunction("fetch-store-deals", settingsSeed(), async ({ call, db }) => {
    const first = await (await call({ store: "lidl" })).json();
    assertEquals(first.cached, false);

    const second = await (await call({ store: "lidl" })).json();
    assertEquals(second.cached, true, "andra anropet skulle komma från databasen");
    assertEquals(second.deals.length, first.deals.length);

    // Rikstäckande kedja lagras med tomt butiks-ID och bara en rad
    assertEquals(db.tables.store_deals.length, 1);
    assertEquals(db.tables.store_deals[0].store_id, "");
  });
});

Deno.test("fetch-store-deals: rikstäckande kedja ignorerar butiks-ID", async () => {
  await withFunction("fetch-store-deals", settingsSeed(), async ({ call, db }) => {
    const data = await (await call({ store: "lidl", storeId: "spelar-ingen-roll" })).json();
    assertEquals(data.storeId, "");
    assertEquals(db.tables.store_deals[0].store_id, "");
  });
});

Deno.test("fetch-store-deals: ogiltig butik ger 400", async () => {
  await withFunction("fetch-store-deals", settingsSeed(), async ({ call }) => {
    const res = await call({ store: "finns-inte" });
    assertEquals(res.status, 400);
    assert(Array.isArray((await res.json()).validStores));
  });
});

Deno.test("fetch-store-deals: ICA-sökning kräver sökterm och ger giltiga slugar", async () => {
  await withFunction("fetch-store-deals", settingsSeed(), async ({ call }) => {
    const without = await (await call({ store: "ica", action: "listStores" })).json();
    assertEquals(without.requiresQuery, true);
    assertEquals(without.stores.length, 0);

    const withQuery = await (await call({
      store: "ica",
      action: "listStores",
      query: "göteborg",
    })).json();

    assert(withQuery.stores.length > 0, "ICA-sökningen gav inga butiker");
    assert(
      /-\d+$/.test(String(withQuery.stores[0].id)),
      `butiks-ID ska sluta med butiksnummer, fick ${withQuery.stores[0].id}`,
    );
  });
});

Deno.test("refresh-store-deals: kräver korrekt cron-hemlighet", async () => {
  await withFunction("refresh-store-deals", settingsSeed(), async ({ call }) => {
    assertEquals((await call({}, {})).status, 401);
    assertEquals((await call({}, { "x-cron-secret": "fel" })).status, 401);
  });
});

Deno.test("refresh-store-deals: respekterar enabled=false", async () => {
  await withFunction("refresh-store-deals", settingsSeed({ enabled: false }), async ({ call }) => {
    const data = await (await call({}, { "x-cron-secret": CRON_SECRET })).json();
    assertEquals(data.skipped, "disabled");
  });
});

Deno.test("refresh-store-deals: hämtar veckans erbjudanden och är idempotent", async () => {
  const seed = settingsSeed();
  seed.store_locations = [
    {
      chain: "willys",
      store_id: "2843",
      name: "Willys Malmö",
      last_requested_at: new Date().toISOString(),
    },
  ];

  await withFunction("refresh-store-deals", seed, async ({ call, db }) => {
    const res = await call({}, { "x-cron-secret": CRON_SECRET });
    const data = await res.json();

    assertEquals(res.status, 200);
    assertEquals(data.success, true);
    assert(data.refreshed > 0, "inga butiker uppdaterades");

    const saved = db.tables.store_deals;
    assert(saved.length >= 2, `förväntade flera butiker, fick ${saved.length}`);

    const willysMalmo = saved.find((r) => r.chain === "willys" && r.store_id === "2843");
    assert(willysMalmo, "den aktiva butiken uppdaterades inte");
    assert((willysMalmo!.deal_count as number) > 0);
    assertEquals(willysMalmo!.week_start, data.weekStart);

    const fetchedAtBefore = willysMalmo!.fetched_at;

    const again = await (await call({}, { "x-cron-secret": CRON_SECRET })).json();
    assertEquals(again.upToDate, true, "andra körningen skulle inte göra om jobbet");
    assertEquals(again.refreshed, 0);

    // Butiken ska inte ha hämtats om
    const afterSecondRun = db.tables.store_deals.find(
      (r) => r.chain === "willys" && r.store_id === "2843",
    );
    assertEquals(
      afterSecondRun!.fetched_at,
      fetchedAtBefore,
      "en butik med färsk data skulle inte hämtas om",
    );

    assert(db.tables.store_deals_settings[0].last_run_at, "last_run_at sattes aldrig");
  });
});

Deno.test("refresh-store-deals: butiker som inte använts på länge hoppas över", async () => {
  const seed = settingsSeed({ active_days: 30 });
  const longAgo = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();

  seed.store_locations = [
    { chain: "willys", store_id: "2843", name: "Gammal butik", last_requested_at: longAgo },
  ];

  await withFunction("refresh-store-deals", seed, async ({ call, db }) => {
    await call({}, { "x-cron-secret": CRON_SECRET });

    const stale = db.tables.store_deals.find(
      (r) => r.chain === "willys" && r.store_id === "2843",
    );
    assertEquals(stale, undefined, "en butik som inte använts på 200 dagar skulle hoppas över");
  });
});


