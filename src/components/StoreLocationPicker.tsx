import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Check, X } from "lucide-react";

export interface StoreLocation {
  id: string;
  name: string;
  town?: string;
}

interface StoreLocationPickerProps {
  /** Kedjans nyckel, t.ex. "ica" eller "willys". */
  chain: string;
  /** Vald butik, om någon. */
  value: StoreLocation | null;
  onChange: (store: StoreLocation | null) => void;
}

/**
 * Låter användaren välja sin lokala butik inom en kedja.
 *
 * Kedjorna beter sig olika:
 *  - Willys/Hemköp levererar hela butikslistan på en gång -> filtrera lokalt.
 *  - ICA kräver en sökterm -> anropa API:t när användaren skrivit något.
 *  - Lidl m.fl. har rikstäckande erbjudanden -> ingen väljare visas.
 */
const StoreLocationPicker = ({ chain, value, onChange }: StoreLocationPickerProps) => {
  const [query, setQuery] = useState("");
  const [allStores, setAllStores] = useState<StoreLocation[]>([]);
  const [results, setResults] = useState<StoreLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchable, setSearchable] = useState(false);
  const [requiresQuery, setRequiresQuery] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  // Håller koll på senaste anropet så att långsamma svar inte skriver över nyare.
  const requestIdRef = useRef(0);

  const callApi = async (body: Record<string, unknown>) => {
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-store-deals`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      },
    );
    return resp.json();
  };

  // Hämta butikslistan (eller ta reda på att kedjan kräver sökning)
  useEffect(() => {
    if (chain === "none") return;

    let cancelled = false;
    setAllStores([]);
    setResults([]);
    setQuery("");
    setSearchable(false);
    setRequiresQuery(false);

    (async () => {
      setIsLoading(true);
      try {
        const data = await callApi({ store: chain, action: "listStores" });
        if (cancelled) return;

        setSearchable(Boolean(data?.searchable));
        setRequiresQuery(Boolean(data?.requiresQuery));
        setAllStores(Array.isArray(data?.stores) ? data.stores : []);
      } catch {
        if (!cancelled) setSearchable(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chain]);

  // ICA: sök mot API:t när användaren skriver (debouncat)
  useEffect(() => {
    if (!requiresQuery) return;

    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }

    const id = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await callApi({ store: chain, action: "listStores", query: term });
        if (id !== requestIdRef.current) return; // ett nyare anrop har hunnit ikapp
        setResults(Array.isArray(data?.stores) ? data.stores : []);
      } catch {
        if (id === requestIdRef.current) setResults([]);
      } finally {
        if (id === requestIdRef.current) setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, requiresQuery, chain]);

  // Willys/Hemköp: filtrera den redan hämtade listan lokalt
  const localMatches = useMemo(() => {
    if (requiresQuery) return results;

    const term = query.trim().toLowerCase();
    const source = allStores;
    if (!term) return source.slice(0, 8);

    return source
      .filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.town ?? "").toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [query, allStores, results, requiresQuery]);

  // Stäng listan vid klick utanför
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (chain === "none" || !searchable) return null;

  return (
    <div className="space-y-2 animate-fade-in-up" ref={containerRef}>
      <label className="section-label">
        📍 Din butik{" "}
        <span className="text-muted-foreground font-body text-sm font-normal">
          (för exakta lokala priser)
        </span>
      </label>

      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>
              {value.name}
              {value.town ? (
                <span className="text-muted-foreground"> · {value.town}</span>
              ) : null}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Byt butik"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
            className="input-field w-full"
            placeholder={
              requiresQuery ? "Sök på ort eller butiksnamn…" : "Filtrera på ort eller butik…"
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />

          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-primary absolute right-3 top-1/2 -translate-y-1/2" />
          )}

          {isOpen && (localMatches.length > 0 || (query.trim() && !isLoading)) && (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
              {localMatches.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  Inga butiker hittades
                </li>
              ) : (
                localMatches.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(s);
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <Check className="w-3.5 h-3.5 opacity-0 shrink-0" />
                      <span>
                        {s.name}
                        {s.town ? (
                          <span className="text-muted-foreground"> · {s.town}</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreLocationPicker;

