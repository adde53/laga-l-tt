# Erbjudanden från butikerna

Erbjudandena hämtas **direkt från matkedjornas egna datakällor** och lagras i
databasen. Ett cron-jobb uppdaterar dem varje måndag; raden för en butik skrivs
över när den nya veckans erbjudanden hämtas.

## Så hänger delarna ihop

```
pg_cron (måndagar)  ->  refresh-store-deals  ->  store_deals-tabellen
                                                       ^      |
användaren  ->  fetch-store-deals  ---------------------+      v
                       |  (saknas veckans data: hämta live och spara)
                       +-> _shared/storeRegistry.ts -> _shared/stores.ts -> butikernas API:er
```

`fetch-store-deals` läser i första hand ur databasen. Saknas innevarande veckas
data — t.ex. för en butik ingen använt förut — hämtas den live och sparas, så
att nästa besökare får den direkt.

## Datakällor

| Kedja          | Källa                                                       | Butiksval    | Status   |
| -------------- | ----------------------------------------------------------- | ------------ | -------- |
| **ICA**        | `www.ica.se/erbjudanden/<slug>/` → `window.__INITIAL_DATA__`  | Sök via API  | Native   |
| **Willys**     | `www.willys.se/search/campaigns/offline?q=<butiksId>`         | Hela listan  | Native   |
| **Hemköp**     | `www.hemkop.se/search/campaigns/offline?q=<butiksId>`         | Hela listan  | Native   |
| **Lidl**       | `www.lidl.se/p/api/gridboxes/SE/sv`                           | Rikstäckande | Native   |
| **Coop**       | Firecrawl mot `coop.se/butiker-erbjudanden/`                  | –            | Fallback |
| **City Gross** | Firecrawl mot `citygross.se/erbjudanden`                      | –            | Fallback |

"Native" betyder att vi läser kedjans egen strukturerade data – ingen
AI-tolkning, ingen kostnad och exakta priser.

> **Netto** togs bort – kedjan finns inte längre i Sverige (uppköpt av Coop).

## Detaljer värda att känna till

**Hemköp har genuint färre erbjudanden än Willys** (ca 65 mot ca 220 per butik).
Det är inget fel i hämtningen utan skillnaden mellan en fullsortimentsbutik och
en lågpriskedja. Hemköps reklamblad använder dessutom breda produktnamn som
"Smörgåspålägg" med prisintervall, medan Willys anger enskilda artiklar.

Endpointen `/search/campaigns` (utan `/offline`) returnerar fler träffar men
**ignorerar butiksparametern** – samma svar oavsett butik. Använd `/offline`,
som är den butiksspecifika.

**ICA** kräver hela URL-slugen (`maxi-ica-stormarknad-nacka-1004282`) – enbart
butiksnumret ger 404. Slugen hämtas ur butikssöket
`www.ica.se/api/store/search?query=<ort>&take=30`. Utan `take` returneras bara 5
träffar.

ICA:s inbäddade state är **inte giltig JSON** – den innehåller JS-värden som
`"usesLeft":undefined`. Därför plockar `extractJsonValue()` ut ett balanserat
värde och sanerar det innan `JSON.parse`.

**Axfood** (Willys/Hemköp) delar API-kontrakt men har olika butiks-ID-serier
(Willys ~2xxx, Hemköp ~4xxx). Fel serie ger tomt svar, inte fel – därför
nollställs butiksvalet i UI:t när kedjan byts.

**Lidl** anger `storeEndDate` i epoch-**sekunder** medan Axfood använder
**millisekunder**; `toIsoDate()` hanterar båda. Gridbox-svaret innehåller även
ordinarie sortiment utan pris – de filtreras bort.

## Veckouppdateringen

Cron-jobbet `store-deals-weekly-refresh` kör var 15:e minut mellan 01:00 och
08:00 UTC på måndagar. Varje körning hämtar butiker som saknar innevarande
veckas data och hoppar över dem som redan är uppdaterade. När allt är klart blir
resterande körningar verkningslösa.

Det gör jobbet **självläkande** – en misslyckad körning tas om av nästa – och
okänsligt för sommar-/vintertid, utan att behöva hålla reda på var det slutade.

Vilka butiker som uppdateras:

- Rikstäckande kedjor (Lidl, Coop, City Gross)
- Varje kedjas standardbutik
- Butiker som en användare faktiskt efterfrågat de senaste `active_days`
  dagarna (standard 60)

Kedjor som varken har en egen datakälla eller Firecrawl konfigurerat hoppas
över, så att jobbet inte fastnar på något som ändå inte kan hämtas.

Butiker registreras i `store_locations` när någon använder dem, så en ny butik
kommer med i nästa veckas körning automatiskt.

### Köra manuellt

```bash
curl -X POST https://<projekt>.supabase.co/functions/v1/refresh-store-deals \
  -H "x-cron-secret: <hemlighet>" -H 'Content-Type: application/json' -d '{}'

# Tvinga om hämtning av allt, även det som redan är uppdaterat
... -d '{"force":true}'
```

Hemligheten finns i `store_deals_settings.cron_secret` och går bara att läsa med
service_role.

## API

**Hämta erbjudanden**

```json
{ "store": "ica", "storeId": "maxi-ica-stormarknad-nacka-1004282" }
```

`storeId` är valfritt – utan det används kedjans standardbutik
(`ICA_DEFAULT_STORE`, `WILLYS_DEFAULT_STORE`, `HEMKOP_DEFAULT_STORE`).
`refresh: true` går förbi databasen och hämtar om.

Svaret innehåller `deals` (strukturerat), `text` (markdown till AI-modellen),
`weekStart` och `cached`.

**Lista/sök butiker**

```json
{ "store": "willys", "action": "listStores" }
{ "store": "ica", "action": "listStores", "query": "malmö" }
```

`requiresQuery: true` betyder att kedjan kräver en sökterm, så att UI:t vet om
det ska visa ett sökfält eller en filtrerbar lista.

## Testa

```bash
# Adaptrarna mot skarp data hos kedjorna
deno run --allow-net supabase/functions/_shared/verify-stores.ts

# Vecko- och ID-logik
deno test --allow-all supabase/functions/_shared/storeRegistry.test.ts

# Hela flödet: edge-funktionerna mot en databasemulator vars schema
# läses ur migrationen (fångar felstavade kolumnnamn)
deno test --allow-all tests/edge/storeDeals.test.ts
```

Kör dem om något slutar fungera – kedjorna ändrar sina sajter då och då.

## Miljövariabler

| Variabel                    | Krävs | Beskrivning                    |
| --------------------------- | ----- | ------------------------------ |
| `SUPABASE_URL`              | Ja    | Sätts automatiskt av Supabase  |
| `SUPABASE_SERVICE_ROLE_KEY` | Ja    | Sätts automatiskt av Supabase  |
| `FIRECRAWL_API_KEY`         | Nej\* | Behövs för Coop och City Gross |
| `ICA_DEFAULT_STORE`         | Nej   | Standardbutik (slug)           |
| `WILLYS_DEFAULT_STORE`      | Nej   | Standardbutik (ID)             |
| `HEMKOP_DEFAULT_STORE`      | Nej   | Standardbutik (ID)             |

\* ICA, Willys, Hemköp och Lidl fungerar helt utan Firecrawl.

