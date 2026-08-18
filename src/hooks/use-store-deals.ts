import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Deal {
  name: string;
  brand?: string;
  price?: string;
  priceValue?: number;
  comparePrice?: string;
  condition?: string;
  validTo?: string;
  category?: string;
}

export interface DealRow {
  chain: string;
  store_name: string;
  deal_count: number;
  deals: Deal[];
  week_start: string;
  fetched_at: string;
}

export const CHAIN_LABEL: Record<string, string> = {
  ica: "ICA",
  willys: "Willys",
  hemkop: "Hemköp",
  lidl: "Lidl",
  coop: "Coop",
  citygross: "City Gross",
};

/** Veckans sparade erbjudanden – publik läsning, sorterat på flest fynd. */
export function useStoreDeals(chain?: string) {
  const [rows, setRows] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      let q = supabase
        .from("store_deals" as never)
        .select("chain, store_name, deal_count, deals, week_start, fetched_at")
        .order("deal_count", { ascending: false });
      if (chain) q = q.eq("chain", chain);
      const { data } = await q;
      if (!alive) return;
      setRows(((data as unknown as DealRow[]) ?? []));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [chain]);

  return { rows, loading };
}

/** ISO-veckonummer för datumsträngen (YYYY-MM-DD). */
export function isoWeek(dateStr?: string): number {
  const d = dateStr ? new Date(dateStr) : new Date();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const fday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fday + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
}
