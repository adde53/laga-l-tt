import { Link, useParams } from "react-router-dom";
import { Loader2, CalendarDays, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DealsGrid from "@/components/DealsGrid";
import { CHAIN_LABEL, isoWeek, useStoreDeals } from "@/hooks/use-store-deals";
import { trackClickCreateMenu } from "@/lib/analytics";

/** /billig-veckomeny/vecka-34 – veckans fynd + väg till meny och handlingslista. */
const BilligVeckomenyVecka = () => {
  const { week: weekParam } = useParams();
  const requested = Number(String(weekParam ?? "").replace(/\D/g, ""));
  const { rows, loading } = useStoreDeals();
  const currentWeek = isoWeek(rows[0]?.week_start);
  const week = requested || currentWeek;
  /** Bara innevarande vecka har riktig data – övriga veckor ska inte indexeras. */
  const hasData = rows.length > 0 && week === currentWeek;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`Billig veckomeny vecka ${week} – 5 middagar på veckans matfynd`}
        description={`Billig veckomeny för vecka ${week}: fem middagar för fyra personer byggda på veckans erbjudanden, med recept och handlingslista.`}
        path={`/billig-veckomeny/vecka-${week}`}
        keywords={`billig veckomeny vecka ${week}, veckomeny vecka ${week}, billig veckomatsedel, veckans matfynd`}
        noindex={!hasData}
      />
      <SiteHeader />

      <main className="relative z-10 container max-w-5xl mx-auto px-5 py-10 space-y-10">
        <header className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-primary" aria-hidden="true" />
            Billig veckomeny – vecka {week}
          </h1>
          <p className="font-body text-muted-foreground max-w-2xl">
            Så här bygger du en billig veckomeny för vecka {week}: utgå från butikernas
            aktuella fynd nedan, välj antal middagar och budget, och få recept plus
            handlingslista direkt.
          </p>
          <Link
            to="/#recipe-form"
            onClick={() => trackClickCreateMenu(`week_${week}`)}
            className="btn-hero-primary inline-flex"
          >
            Skapa min veckomeny
          </Link>
        </header>

        {loading && <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />}

        {!loading && !hasData && (
          <p className="font-body text-muted-foreground">
            Vi visar bara fynd för innevarande vecka.{" "}
            <Link to={`/billig-veckomeny/vecka-${currentWeek}`} className="text-primary hover:underline">
              Gå till vecka {currentWeek}
            </Link>
            .
          </p>
        )}

        {hasData &&
          rows.slice(0, 4).map((r) => (
            <section key={`${r.chain}-${r.store_name}`} className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Fynd hos {r.store_name}
                </h2>
                <Link
                  to={`/${r.chain}-erbjudanden`}
                  className="text-sm font-body font-semibold text-primary hover:underline shrink-0"
                >
                  Alla {CHAIN_LABEL[r.chain] ?? r.chain}-erbjudanden
                </Link>
              </div>
              <DealsGrid deals={r.deals} chain={r.chain} initial={6} />
            </section>
          ))}

        <nav className="flex flex-wrap gap-4 text-sm font-body pt-4 border-t border-border">
          <Link to="/veckans-matfynd" className="text-primary font-semibold hover:underline">
            Veckans matfynd
          </Link>
          <Link to="/veckomeny" className="text-primary font-semibold hover:underline">
            Om veckomeny
          </Link>
          <Link to="/billiga-recept" className="text-primary font-semibold hover:underline">
            Billiga recept
          </Link>
          <Link
            to={`/billig-veckomeny/vecka-${currentWeek}`}
            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
          >
            Denna vecka <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
};

export default BilligVeckomenyVecka;
