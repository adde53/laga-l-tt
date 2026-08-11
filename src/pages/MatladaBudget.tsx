import ArticlePage from "@/components/ArticlePage";

const MatladaBudget = () => (
  <ArticlePage
    path="/matlada-budget"
    breadcrumbLabel="Matlådor på budget"
    title="Matlådor på budget – en förmiddag, en veckas luncher"
    metaTitle="Matlådor på budget – billiga luncher för hela veckan"
    metaDescription="Laga matlådor på budget: fem billiga luncher från en och samma matlagning, med rätter som håller sig i kylen och kostar under 20 kr per portion."
    updated="2026-02-17"
    intro="Lunch ute kostar snabbt över tusen kronor i månaden. Med en matlagningsomgång i veckan landar samma luncher på en bråkdel – förutsatt att du väljer rätter som faktiskt är lika goda dag tre som dag ett."
    sections={[
      {
        heading: "Rätter som håller sig i kylen",
        body: "Allt tål inte att stå tre dagar. Satsa på mat där smakerna mognar istället för att falla ihop.",
        bullets: [
          "Grytor, chili, curry och köttfärssåser blir ofta bättre dag två.",
          "Rotfruktsgratänger och ugnsbakade lådor värms upp utan att bli torra.",
          "Kalla bowls med linser, bulgur eller pasta – förvara dressingen separat.",
          "Koka ris och pasta al dente, den fortsätter mjukna i lådan.",
        ],
      },
      {
        heading: "Räkna hem kostnaden",
        body: "Fem matlådor för under 100 kronor totalt är fullt möjligt när du bygger på linser, bönor, ägg, kyckling på erbjudande eller köttfärs som du drar ut med rotfrukter. Det stora sparandet ligger i att laga fem portioner av samma sak istället för fem olika rätter.",
      },
      {
        heading: "Så gör du en matlådesöndag effektiv",
        body: "Sätt ugnen på först, koka basen medan något står inne, och gör en enda stor sats som du varierar med olika tillbehör. Två timmar i köket räcker för hela veckans luncher.",
      },
      {
        heading: "Variation utan extra kostnad",
        body: "Samma bas kan bli tre olika luncher med hjälp av topping: inlagd rödlök, en klick yoghurtsås, rostade frön eller färska örter. Billigt, snabbt och gör att veckan inte smakar likadant fem dagar i rad.",
      },
    ]}
    faq={[
      {
        q: "Hur länge håller en matlåda i kylen?",
        a: "Tre till fyra dagar i kylskåp om maten kylts ner snabbt. Frys in de lådor du äter senare i veckan.",
      },
      {
        q: "Vad kostar en hemlagad matlåda?",
        a: "Runt 15–25 kronor per portion när du utgår från säsongsgrönsaker och protein på erbjudande.",
      },
      {
        q: "Kan jag få matlådeförslag automatiskt?",
        a: "Ja. Skriv att du vill ha matlådor i receptformuläret på startsidan, och du får rätter som är gjorda för att värmas upp.",
      },
      {
        q: "Fungerar matlådor med veckomenyn?",
        a: "Bra ihop faktiskt – laga dubbel portion av veckomenyns middagar och du har lunchen klar utan extra matlagning.",
      },
    ]}
  />
);

export default MatladaBudget;