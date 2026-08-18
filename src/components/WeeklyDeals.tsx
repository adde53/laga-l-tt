import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Flame, ArrowRight } from "lucide-react";
import DealsGrid from "@/components/DealsGrid";
import { CHAIN_LABEL, isoWeek, useStoreDeals } from "@/hooks/use-store-deals";
import { trackClickCreateMenu } from "@/lib/analytics";

/** Veckans bästa matfynd – riktiga erbjudanden direkt från butikernas data. */
const WeeklyDeals = () => {
  const { rows, loading } = useStoreDeals();
  const [activeChain, setActiveChain] = useState<string | null>(null);

  const active = rows.find((r) => r.chain === (activeChain ?? rows[0]?.chain));

  const scrollToForm = () => {
    trackClickCreateMenu("deals_section");
    document.getElementById("recipe-form")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="relative z-10 container max-w-5xl mx-auto px-5 py-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      </section>
    );
  }

  if (rows.length === 0) return null;

  return (
    <section
      id="veckans-matfynd"
      className="relative z-10 container max-w-5xl mx-auto px-5 py-8 md:py-12"
      aria-label="Veckans bästa matfynd"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" aria-hidden="true" />
            Veckans bästa matfynd
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Hämtat direkt från butikernas egna erbjudanden · gäller v.{isoWeek(active?.week_start)}
          </p>
        </div>
        <Button onClick={scrollToForm} className="font-display font-bold shrink-0">
          Gör en veckomeny av fynden
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3" role="tablist">
        {rows.map((r) => (
          <button
            key={`${r.chain}-${r.store_name}`}
            role="tab"
            aria-selected={r.chain === active?.chain}
            onClick={() => setActiveChain(r.chain)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-body font-semibold border-2 transition-colors ${
              r.chain === active?.chain
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {CHAIN_LABEL[r.chain] ?? r.chain}
            <span className="ml-2 text-xs opacity-70">{r.deal_count}</span>
          </button>
        ))}
      </div>

      {active && <DealsGrid deals={active.deals} chain={active.chain} />}

      <div className="mt-5 flex flex-wrap gap-3 text-sm font-body">
        <Link
          to="/veckans-matfynd"
          className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
        >
          Alla veckans matfynd <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        {active && (
          <Link
            to={`/${active.chain === "hemkop" ? "hemkop" : active.chain}-erbjudanden`}
            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
          >
            {CHAIN_LABEL[active.chain] ?? active.chain}-erbjudanden{" "}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
};

export default WeeklyDeals;
