import ArticlePage from "@/components/ArticlePage";

const BilligaRecept = () => (
  <ArticlePage
    path="/billiga-recept"
    breadcrumbLabel="Billiga recept"
    title="Billiga recept – god vardagsmat för under 20 kr per portion"
    metaTitle="Billiga recept – vardagsmat under 20 kr per portion"
    metaDescription="Billiga recept som faktiskt smakar gott: så bygger du middagar för under 20 kr per portion med veckans erbjudanden, smarta basvaror och rätt teknik."
    updated="2026-02-17"
    intro="Billig mat blir tråkig när den bara handlar om att dra ner på råvaror. Blir den istället byggd runt några billiga basvaror och smaksättning som lyfter dem, hamnar du enkelt under 20 kronor per portion utan att maten känns snål."
    sections={[
      {
        heading: "Basvarorna som gör måltiden billig",
        body: "Nästan alla riktigt prisvärda middagar vilar på samma grund. Har du de här hemma är steget till en billig middag kort.",
        bullets: [
          "Torrvaror: pasta, ris, couscous, linser och torkade bönor.",
          "Rotfrukter: potatis, morötter, lök och vitkål håller länge och kostar lite.",
          "Ägg och kikärtor som snabb proteinkälla när kött är dyrt.",
          "Frysta grönsaker – lika näringsrika som färska och prisstabila året runt.",
          "Krossade tomater, buljong, senap och soja: billig smak i stora mängder.",
        ],
      },
      {
        heading: "Handla efter erbjudanden, inte efter recept",
        body: "Den enskilt största besparingen kommer av att välja protein efter vad som är nedsatt den veckan och sedan hitta receptet. VeckansMatFynd gör den ordningen automatiskt: vi läser veckans erbjudanden och föreslår recept som passar det som är billigt just nu.",
      },
      {
        heading: "Smak istället för dyra råvaror",
        body: "Bryn tomatpurén, rosta kryddorna torrt i pannan, salta i flera steg och avsluta med något syrligt – citron, vinäger eller inlagd rödlök. Tekniken kostar inget men är skillnaden mellan platt budgetmat och en middag du gärna lagar igen.",
      },
      {
        heading: "Minska svinnet – den osynliga besparingen",
        body: "Ungefär en femtedel av matbudgeten brukar försvinna i slängd mat. Planera två rätter som delar råvaror, laga en portion extra till lunchlådan och frys in det som blir kvar innan det hinner bli dåligt.",
      },
    ]}
    faq={[
      {
        q: "Vad räknas som ett billigt recept?",
        a: "Vi siktar på under cirka 20 kronor per portion, räknat på fyra portioner och med skafferivaror som salt, olja och kryddor redan hemma.",
      },
      {
        q: "Är billiga recept nyttiga?",
        a: "De kan absolut vara det. Bönor, linser, ägg, rotfrukter, kål och frysta grönsaker är både bland de billigaste och bland de mest näringsrika varorna i butiken.",
      },
      {
        q: "Hur hittar jag billiga recept snabbt?",
        a: "Skriv vad du är sugen på och din budget på startsidan – du får recept anpassade efter både plånboken och smaken på några sekunder.",
      },
      {
        q: "Kan jag laga billigt vegetariskt?",
        a: "Ja, vegetariska middagar på linser, bönor eller ägg är oftast de billigaste rätterna i en veckomeny.",
      },
    ]}
  />
);

export default BilligaRecept;