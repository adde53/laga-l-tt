import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Flame, Tag } from "lucide-react";

interface Deal {
  name: string;
  brand?: string;
  price?: string;
  priceValue?: number;
  comparePrice?: string;
  condition?: string;
  validTo?: string;
  category?: string;
}

interface DealRow {
  chain: string;
  store_name: string;
  deal_count: number;
  deals: Deal[];
  week_start: string;
  fetched_at: string;
}

const CHAIN_LABEL: Record<string, string> = {
  ica: "ICA",
  willys: "Willys",
  hemkop: "Hemköp",
  lidl: "Lidl",
  coop: "Coop",
  citygross: "City Gross",
};

const VISIBLE = 9;

/** Veckans bästa matfynd – riktiga erbjudanden direkt från butikernas data. */
const WeeklyDeals = () => {
  const [rows, setRows] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChain, setActiveChain] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("store_deals" as any)
        .select("chain, store_name, deal_count, deals, week_start, fetched_at")
        .order("deal_count", { ascending: false });
      const list = ((data as any[]) ?? []) as DealRow[];
      setRows(list);
      setActiveChain(list[0]?.chain ?? null);
      setLoading(false);
    })();
  }, []);

  const active = rows.find((r) => r.chain === activeChain);

  /** Billigast först – det är fynden användaren är här för. */
  const deals = useMemo(() => {
    const all = (active?.deals ?? []).filter((d) => d.name && d.price);
    return [...all].sort((a, b) => (a.priceValue ?? 9999) - (b.priceValue ?? 9999));
  }, [active]);

  const shown = expanded ? deals.slice(0, 36) : deals.slice(0, VISIBLE);

  const scrollToForm = () =>
    document.getElementById("recipe-form")?.scrollIntoView({ behavior: "smooth" });

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
            Hämtat direkt från butikernas egna erbjudanden · gäller v.{" "}
            {getWeek(active?.week_start)} 
          </p>
        </div>
        <Button onClick={scrollToForm} className="font-display font-bold shrink-0">
          Gör en veckomeny av fynden
        </Button>
      </div>

      {/* Butiksväljare */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3" role="tablist">
        {rows.map((r) => (
          <button
            key={r.chain}
            role="tab"
            aria-selected={r.chain === activeChain}
            onClick={() => {
              setActiveChain(r.chain);
              setExpanded(false);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-body font-semibold border-2 transition-colors ${
              r.chain === activeChain
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {CHAIN_LABEL[r.chain] ?? r.chain}
            <span className="ml-2 text-xs opacity-70">{r.deal_count}</span>
          </button>
        ))}
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {shown.map((d, i) => (
          <li
            key={`${d.name}-${i}`}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-display font-bold text-sm text-foreground leading-snug">
                {d.name}
              </p>
              <span className="shrink-0 rounded-lg bg-primary/10 text-primary px-2 py-1 text-xs font-bold">
                {d.price}
              </span>
            </div>
            {d.brand && <p className="text-xs text-muted-foreground">{d.brand}</p>}
            {d.comparePrice && (
              <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                <Tag className="w-3 h-3" aria-hidden="true" />
                {d.comparePrice}
              </p>
            )}
            {d.condition && (
              <p className="text-[11px] text-muted-foreground/60">{d.condition}</p>
            )}
          </li>
        ))}
      </ul>

      {deals.length > VISIBLE && (
        <div className="text-center mt-4">
          <Button variant="outline" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Visa mindre" : `Visa fler fynd (${deals.length - VISIBLE})`}
          </Button>
        </div>
      )}
    </section>
  );
};

/** ISO-veckonummer för datumsträngen (YYYY-MM-DD). */
function getWeek(dateStr?: string): number {
  const d = dateStr ? new Date(dateStr) : new Date();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const fday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fday + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
}

export default WeeklyDeals;
