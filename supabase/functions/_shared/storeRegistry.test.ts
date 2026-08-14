/**
 * Tester för veckoberäkning och butiks-ID-normalisering.
 *
 *   deno test --allow-net --allow-env supabase/functions/_shared/storeRegistry.test.ts
 */
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { currentWeekStart, normalizeStoreId } from "./storeRegistry.ts";

Deno.test("currentWeekStart: måndag ger samma dag", () => {
  // 2026-08-10 är en måndag
  assertEquals(currentWeekStart(new Date("2026-08-10T12:00:00Z")), "2026-08-10");
});

Deno.test("currentWeekStart: mitt i veckan ger föregående måndag", () => {
  assertEquals(currentWeekStart(new Date("2026-08-14T09:00:00Z")), "2026-08-10");
});

Deno.test("currentWeekStart: söndag hör till veckan som började i måndags", () => {
  // 2026-08-16 är en söndag. 18:00 UTC = 20:00 svensk tid, alltså fortfarande söndag.
  assertEquals(currentWeekStart(new Date("2026-08-16T18:00:00Z")), "2026-08-10");
});

Deno.test("currentWeekStart: söndag 23:30 svensk tid är fortfarande gamla veckan", () => {
  // 21:30 UTC = 23:30 svensk sommartid på söndagen
  assertEquals(currentWeekStart(new Date("2026-08-16T21:30:00Z")), "2026-08-10");
});

Deno.test("currentWeekStart: söndag 22:30 UTC är redan måndag i Sverige", () => {
  // 22:30 UTC söndag = 00:30 måndag svensk sommartid -> ny vecka
  assertEquals(currentWeekStart(new Date("2026-08-16T22:30:00Z")), "2026-08-17");
});

Deno.test("currentWeekStart: fungerar över månadsskifte", () => {
  // 2026-09-02 är en onsdag, veckan började 2026-08-31
  assertEquals(currentWeekStart(new Date("2026-09-02T10:00:00Z")), "2026-08-31");
});

Deno.test("currentWeekStart: fungerar över årsskifte", () => {
  // 2027-01-01 är en fredag, veckan började 2026-12-28
  assertEquals(currentWeekStart(new Date("2027-01-01T10:00:00Z")), "2026-12-28");
});

Deno.test("currentWeekStart: vintertid (UTC+1)", () => {
  // Söndag 2026-01-11 kl 23:30 UTC = måndag 00:30 svensk vintertid
  assertEquals(currentWeekStart(new Date("2026-01-11T23:30:00Z")), "2026-01-12");
});

Deno.test("normalizeStoreId: rikstäckande kedjor får tomt ID", () => {
  assertEquals(normalizeStoreId("lidl", "nagot"), "");
  assertEquals(normalizeStoreId("coop", "1234"), "");
});

Deno.test("normalizeStoreId: butiksspecifika kedjor behåller sitt ID", () => {
  assertEquals(normalizeStoreId("willys", "2843"), "2843");
  assertEquals(
    normalizeStoreId("ica", "ica-nara-amiralsgatan-malmo-1004117"),
    "ica-nara-amiralsgatan-malmo-1004117",
  );
});

Deno.test("normalizeStoreId: faller tillbaka på standardbutik", () => {
  assertEquals(normalizeStoreId("willys", undefined), "2117");
  assertEquals(normalizeStoreId("willys", "   "), "2117");
  assertEquals(normalizeStoreId("hemkop", null), "4660");
});

Deno.test("normalizeStoreId: okänd kedja ger tomt ID", () => {
  assertEquals(normalizeStoreId("finns-inte", "123"), "");
});


