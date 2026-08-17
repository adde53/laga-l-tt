# Veckans Matfynd – kärnflöde, SEO och mätning

Fokus: göra befintlig kärna bättre — **aktuella matfynd → billig veckomeny → recept → handlingslista** — inte bygga nya sidoprojekt.

## Viktigt fynd först

Erbjudandena hämtas idag live per butik och cachas bara i webbläsaren. Tabellerna som backend-funktionerna försöker spara till (`store_deals`, `store_locations`, `store_deals_settings`) **finns inte i databasen**, så det går inte att visa riktiga matfynd på startsidan eller på butiks-/veckosidor förrän de skapas. Att lägga in dem är därför första steget — utan det blir Prio 2, 5 och 6 omöjliga utan påhittad data.

## Fas 1 – Datagrund + konvertering

1. **Databas för matfynd**
   - Skapa `store_locations`, `store_deals` (produkt, butik/kedja, pris, ordinarie pris, rabatt, giltighetsperiod, bild-URL, vecka) och `store_deals_settings`, med RLS: publik läsning, skrivning bara från backend-funktioner.
   - Koppla in befintliga funktioner (`fetch-store-deals`, `refresh-store-deals`) mot tabellerna och kör en första uppdatering så riktig data finns.

2. **Ny hero på startsidan**
   - Rubrik "Gör veckans mat billigare.", underrubrik om matfynd + billiga middagar.
   - En primär CTA "Skapa min veckomeny" + en sekundär "Se veckans matfynd". Övriga konkurrerande budskap tas bort.

3. **"🔥 Veckans bästa matfynd" högt upp**
   - Kort med produkt, butik, pris, ordinarie pris, besparing, giltighetsperiod och bild — bara fält som faktiskt finns i datan. Saknas pris visas ingen besparing.
   - Kortet länkar vidare till butikssida och "Vad kan jag laga med detta?".

4. **Tydligare budgetfunktion**
   - Formuläret får ett eget block: Budget / Antal personer / Antal middagar, med hjälptext "För 4 personer · 5 middagar · max 500 kr" och CTA "Skapa billig veckomeny".

5. **Bättre veckomenyresultat**
   - Dag för dag: receptnamn, portioner, ungefärlig kostnad, vilka veckans fynd som används, länk till receptet.
   - Total uppskattad kostnad för veckan, och besparing endast när ordinarie priser finns (annars markerat som uppskattat).
   - Handlingslistan får tydligare plats i slutet av flödet.

6. **Startsidans ordning**: hero → veckans matfynd → skapa veckomeny → exempelmeny → så fungerar det → populära recept → nyhetsbrev. Allt byggs mobilt först (stora CTA:er, läsbara priser, inga onödiga animationer).

## Fas 2 – SEO

- **Butikssidor** `/ica-erbjudanden`, `/coop-erbjudanden`, `/willys-erbjudanden`, `/hemkop-erbjudanden`, `/lidl-erbjudanden` — bara för kedjor som finns i datan. Visar aktuella fynd, relevanta recept och CTA "Skapa veckomeny från dessa erbjudanden".
- **Veckosidor** `/billig-veckomeny/vecka-34` med veckans fynd, recept, total kostnad, budget och handlingslista. Uppdateras automatiskt varje vecka. Sidor utan data blir noindex istället för tomma.
- **Återanvänd befintliga sidor**: `/veckomeny` och `/billiga-recept` behålls; `/veckans-matfynd` blir samlingssidan för fynd. Inga dubbletter av det som redan finns.
- **Intern länkning**: fynd → butik → recept → veckomeny → handlingslista, i båda riktningarna.
- **Teknisk SEO**: unika title/description per sida, en H1 per sida, självrefererande canonical, sitemap som genereras från riktiga rutter + aktuella veckor/butiker, robots.txt, Open Graph, strukturerad data (ItemList för fynd, Recipe för recept), alt-texter, bildstorlekar och lazy loading.

## Fas 3 – Retention

- Nyhetsbrevsblocket får budskapet "Få veckans billigaste middagar varje måndag" med tydlig CTA och bara e-post som fält (avprenumerering finns redan).
- Veckoutskicket bygger på veckans faktiska fynd och länkar till veckosidan.

## Fas 4 – Mätning

- Återanvänder befintlig Google Analytics (redan installerad, inget nytt system).
- Skickar events: `page_view`, `view_offer`, `click_create_menu`, `menu_created`, `view_recipe`, `add_to_shopping_list`, `newsletter_signup`, `return_visit` — så hela kedjan besökare → fynd → meny → recept → lista → prenumerant → återkommande går att följa.

## Utanför denna fas

Avancerade konton, sociala funktioner, kommentarer, gamification, betalvägg, nya AI-funktioner och massproducerat blogginnehåll.

## Teknisk kortfattat

- Ny migration för de tre saknade tabellerna med GRANT + RLS (publik SELECT, skrivning via service role).
- Frontend: nya komponenter `DealsHighlight`, `BudgetPlanner`, `WeekMenuResult`, sidmallar `StoreOffersPage` och `WeekMenuPage`; befintlig designidentitet (terracotta/mint/guld) behålls.
- Sitemap går från handredigerad fil till generator som läser rutter + veckor/butiker ur datan.
- Analytics läggs i en tunn `src/lib/analytics.ts` som wrappar `gtag`.

Förslag: jag börjar med Fas 1 (datagrund + startsida) och rapporterar innan Fas 2, så du kan se effekten tidigt.
