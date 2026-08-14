/**
 * Verifieringsskript – kör de riktiga adaptrarna mot butikernas skarpa
 * datakällor och skriver ut resultatet.
 *
 *   deno run --allow-net supabase/functions/_shared/verify-stores.ts
 */
import {
  fetchAxfoodDeals,
  fetchAxfoodStores,
  fetchIcaDeals,
  fetchIcaStores,
  fetchLidlDeals,
  formatDealsAsText,
} from "./stores.ts";

async function check(label: string, fn: () => Promise<unknown[]>) {
  const started = Date.now();
  try {
    const rows = await fn();
    const ms = Date.now() - started;
    console.log(`\n✅ ${label}: ${rows.length} träffar (${ms} ms)`);
    console.log(JSON.stringify(rows.slice(0, 3), null, 2));
    return rows;
  } catch (e) {
    console.log(`\n❌ ${label}: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

const ica = await check("ICA (Maxi Nacka)", () =>
  fetchIcaDeals("maxi-ica-stormarknad-nacka-1004282"));
const willys = await check("Willys (2117)", () => fetchAxfoodDeals("www.willys.se", "2117"));
const hemkop = await check("Hemköp (4660)", () => fetchAxfoodDeals("www.hemkop.se", "4660"));
const lidl = await check("Lidl", () => fetchLidlDeals());
await check("Willys butikslista", () => fetchAxfoodStores("www.willys.se"));
await check("Hemköp butikslista", () => fetchAxfoodStores("www.hemkop.se"));
const icaStores = await check("ICA butikssök 'göteborg'", () => fetchIcaStores("göteborg"));

// Kontrollera att en butik från sökningen faktiskt går att hämta erbjudanden för
if (icaStores.length) {
  const first = icaStores[0] as { id: string; name: string };
  await check(`ICA erbjudanden för "${first.name}"`, () => fetchIcaDeals(first.id));
}

console.log("\n--- Exempel på AI-kontext (ICA) ---");
console.log(formatDealsAsText("ICA", ica.slice(0, 5) as never));

console.log("\n=== Sammanfattning ===");
for (const [name, rows] of [
  ["ICA", ica], ["Willys", willys], ["Hemköp", hemkop], ["Lidl", lidl],
] as const) {
  console.log(`${rows.length > 0 ? "OK  " : "FEL "} ${name.padEnd(8)} ${rows.length}`);
}



