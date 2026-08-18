import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import type { Deal } from "@/hooks/use-store-deals";
import { trackViewOffer } from "@/lib/analytics";

interface Props {
  deals: Deal[];
  chain: string;
  initial?: number;
}

/** Fyndkort, billigast först – bara fält som faktiskt finns i datan visas. */
const DealsGrid = ({ deals, chain, initial = 9 }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(
    () =>
      [...deals]
        .filter((d) => d.name && d.price)
        .sort((a, b) => (a.priceValue ?? 9999) - (b.priceValue ?? 9999)),
    [deals],
  );

  const shown = expanded ? sorted.slice(0, 48) : sorted.slice(0, initial);

  if (sorted.length === 0) return null;

  return (
    <>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {shown.map((d, i) => (
          <li
            key={`${d.name}-${i}`}
            onMouseEnter={() => trackViewOffer(chain, d.name)}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-display font-bold text-sm text-foreground leading-snug">{d.name}</p>
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
            {d.condition && <p className="text-[11px] text-muted-foreground/60">{d.condition}</p>}
          </li>
        ))}
      </ul>

      {sorted.length > initial && (
        <div className="text-center mt-4">
          <Button variant="outline" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Visa mindre" : `Visa fler fynd (${sorted.length - initial})`}
          </Button>
        </div>
      )}
    </>
  );
};

export default DealsGrid;
