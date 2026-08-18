import { Link } from "react-router-dom";
import { Loader2, ArrowRight, ShoppingCart } from "lucide-react";
import Seo from "@/components/Seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DealsGrid from "@/components/DealsGrid";
import { CHAIN_LABEL, isoWeek, useStoreDeals } from "@/hooks/use-store-deals";
import { trackClickCreateMenu } from "@/lib/analytics";

interface Props {
  chain: string;
}

/** SEO-sida per butikskedja: /ica-erbjudanden, /willys-erbjudanden … */
const StoreOffers = ({ chain }: Props) => {
  const { rows, loading } = useStoreDeals(chain);
  const label = CHAIN_LABEL[chain] ?? chain;
  const week = isoWeek(rows[0]?.week_start);
  const hasData = rows.length > 0;
  const total = rows.reduce((sum, r) => sum + r.deal_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${label}-erbjudanden vecka ${week} – veckans matfynd`}
        description={`Aktuella ${label}-erbjudanden vecka ${week}. Se veckans matfynd och skapa en billig veckomeny med handlingslista utifrån ${label}:s priser.`}
        path={`/${chain}-erbjudanden`}
        keywords={`${label} erbjudanden, ${label} veckans erbjudanden, ${label} matfynd, billig mat ${label}`}
        noindex={!hasData}
        jsonLd={
          hasData
            ? {
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: `${label}-erbjudanden vecka ${week}`,
                numberOfItems: total,
              }
            : undefined
        }
      />
      <SiteHeader />

      <main className="relative z-10 container max-w-5xl mx-auto px-5 py-10 space-y-10">
        <header className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary" aria-hidden="true" />
            {label}-erbjudanden vecka {week}
          </h1>
          <p className="font-body text-muted-foreground max-w-2xl">
            Veckans erbjudanden hos {label}, hämtade direkt från butikens egna priser.
            Vill du laga något av fynden? Skapa en billig veckomeny med recept och
            handlingslista på några sekunder.
          </p>
          <Link
            to="/#recipe-form"
            onClick={() => trackClickCreateMenu(`store_${chain}`)}
            className="btn-hero-primary inline-flex"
          >
            Skapa veckomeny från dessa erbjudanden
          </Link>
        </header>

        {loading && <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />}

        {!loading && !hasData && (
          <p className="font-body text-muted-foreground">
            Vi har inga sparade erbjudanden för {label} just nu. Se{" "}
            <Link to="/veckans-matfynd" className="text-primary hover:underline">
              veckans matfynd
            </Link>{" "}
            för övriga butiker.
          </p>
        )}

        {rows.map((r) => (
          <section key={`${r.chain}-${r.store_name}`} className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {r.store_name} – {r.deal_count} erbjudanden
            </h2>
            <DealsGrid deals={r.deals} chain={r.chain} initial={12} />
          </section>
        ))}

        <nav className="flex flex-wrap gap-4 text-sm font-body pt-4 border-t border-border">
          {Object.keys(CHAIN_LABEL)
            .filter((c) => c !== chain)
            .map((c) => (
              <Link
                key={c}
                to={`/${c}-erbjudanden`}
                className="text-primary font-semibold hover:underline"
              >
                {CHAIN_LABEL[c]}-erbjudanden
              </Link>
            ))}
          <Link
            to="/veckans-matfynd"
            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
          >
            Alla veckans matfynd <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
};

export default StoreOffers;
