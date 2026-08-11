import ArticlePage from "@/components/ArticlePage";

const Veckomeny = () => (
  <ArticlePage
    path="/veckomeny"
    breadcrumbLabel="Veckomeny"
    title="Veckomeny för 4 personer – under 500 kr i veckan"
    metaTitle="Veckomeny under 500 kr – 5 middagar för 4 personer"
    metaDescription="Gratis veckomeny för familjen: 5 middagar, 4 portioner, under 500 kr totalt. Byggd på veckans erbjudanden i svenska matbutiker – med inköpslista."
    updated="2026-02-17"
    intro="En veckomeny sparar både pengar och tid: du handlar en gång, slänger mindre mat och slipper frågan 'vad ska vi äta?'. Så här bygger vi en balanserad meny för fyra personen på under 500 kronor – och hur du får den skickad till dig varje vecka."
    sections={[
      {
        heading: "Så räknar vi hem 500 kronor",
        body: "Budgeten håller när menyn utgår från vad som är billigt just den veckan, inte från en färdig önskelista. Vi utgår från veckans erbjudanden i ICA, Coop, Willys, Hemköp och Lidl och bygger recepten runt de råvarorna.",
        bullets: [
          "Två av veckans middagar delar samma proteinkälla – större pack kostar mindre per kilo.",
          "Billiga bulkvaror som pasta, ris, potatis, linser och ägg bär upp portionerna.",
          "Grönsaker väljs efter säsong, frysta grönsaker används när färska är dyra.",
          "Kryddor och basvaror räknas som skafferi och belastar inte veckobudgeten.",
        ],
      },
      {
        heading: "En balanserad vecka, inte bara en billig vecka",
        body: "Varje middag innehåller en proteinkälla, grönsaker och kolhydrater, och veckan varieras mellan kött, fisk, kyckling och vegetariskt. Det gör menyn både näringsmässigt rimlig och tillräckligt varierad för att hålla i mer än en vecka.",
      },
      {
        heading: "Veckans rytm: enkelt på fredagen, festligare på helgen",
        body: "Menyn följer hur vardagen faktiskt ser ut. Måndag till torsdag är snabba middagar på 20–30 minuter, fredagen är extra enkel, och helgen får de recept som är värda lite mer tid vid spisen.",
      },
      {
        heading: "Inköpslista och matlådor",
        body: "Till varje veckomeny hör en samlad inköpslista, så att du handlar en gång istället för fem. Laga en portion extra av de rätter som håller sig bra i kylen och du har lunchlådor på köpet.",
      },
    ]}
    faq={[
      {
        q: "Vad kostar veckomenyn?",
        a: "Ingenting. Du får veckomenyn gratis via e-post och kan avprenumerera med ett klick i varje mejl.",
      },
      {
        q: "Går det att anpassa menyn?",
        a: "Ja. På startsidan kan du välja vilka dagar du vill ha recept för, ange din budget och vad du är sugen på – vegetariskt, snabbt, barnvänligt eller något annat.",
      },
      {
        q: "Räcker 500 kr verkligen till fyra personer?",
        a: "Det gäller fem middagar för fyra personer och förutsätter att du har basvaror som salt, olja och kryddor hemma. Priserna varierar mellan butiker och veckor.",
      },
      {
        q: "När skickas veckomenyn?",
        a: "En gång i veckan, inför veckans handling, så att du kan planera inköpen innan du går till butiken.",
      },
    ]}
  />
);

export default Veckomeny;