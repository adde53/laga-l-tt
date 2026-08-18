import { Link } from "react-router-dom";
import { Loader2, Flame, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DealsGrid from "@/components/DealsGrid";
import { CHAIN_LABEL, isoWeek, useStoreDeals } from "@/hooks/use-store-deals";

/** Samlingssida för alla butikers aktuella matfynd. */
const VeckansMatfynd = () => {
  const { rows, loading } = useStoreDeals();
  const week = isoWeek(rows[0]?.week_start);
  const hasData = rows.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`Veckans matfynd v.${week} – erbjudanden i ICA, Willys, Lidl & Hemköp`}
        description="Alla veckans bästa matfynd samlade: aktuella erbjudanden från ICA, Willys, Hemköp, Coop och Lidl – och en billig veckomeny byggd på fynden."
        path="/veckans-matfynd"
        keywords="veckans matfynd, veckans erbjudanden, matpriser, billig mat, erbjudanden mat"
        noindex={!hasData}
        jsonLd={
          hasData
            ? {
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: `Veckans matfynd vecka ${week}`,
                itemListElement: rows.slice(0, 10).map((r, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: `${CHAIN_LABEL[r.chain] ?? r.chain} – ${r.deal_count} erbjudanden`,
                })),
              }
            : undefined
        }
      />
      <SiteHeader />

      <main className="relative z-10 container max-w-5xl mx-auto px-5 py-10 space-y-10">
        <header className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2">
            <Flame className="w-7 h-7 text-primary" aria-hidden="true" />
            Veckans matfynd – vecka {week}
          </h1>
          <p className="font-body text-muted-foreground max-w-2xl">
            Här är veckans billigaste varor i svenska matbutiker, hämtade direkt från
            butikernas egna erbjudanden. Använd fynden till en billig veckomeny med
            handlingslista.
          </p>
          <Link to="/#recipe-form" className="btn-hero-primary inline-flex">
            Skapa veckomeny av fynden
          </Link>
        </header>

        {loading && <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />}

        {!loading && !hasData && (
          <p className="font-body text-muted-foreground">
            Veckans erbjudanden hämtas just nu. Titta in igen om en liten stund.
          </p>
        )}

        {rows.map((r) => (
          <section key={`${r.chain}-${r.store_name}`} className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {r.store_name} – {r.deal_count} erbjudanden
              </h2>
              <Link
                to={`/${r.chain}-erbjudanden`}
                className="text-sm font-body font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
              >
                Alla {CHAIN_LABEL[r.chain] ?? r.chain}-erbjudanden
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <DealsGrid deals={r.deals} chain={r.chain} initial={6} />
          </section>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
};

export default VeckansMatfynd;
