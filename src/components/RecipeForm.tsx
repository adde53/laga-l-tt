import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PdfUploader from "./PdfUploader";
import RecipeResult from "./RecipeResult";
import ShoppingList from "./ShoppingList";
import CuisineSelector from "./CuisineSelector";
import DaySelector from "./DaySelector";
import { ChefHat, Sparkles, CalendarDays, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STORES = [
  { value: "none", label: "Ingen specifik butik" },
  { value: "ica", label: "ICA" },
  { value: "coop", label: "Coop" },
  { value: "willys", label: "Willys" },
  { value: "lidl", label: "Lidl" },
  { value: "hemkop", label: "Hemköp" },
  { value: "citygross", label: "City Gross" },
  { value: "netto", label: "Netto" },
];

const RecipeForm = () => {
  const [pdfText, setPdfText] = useState("");
  const [craving, setCraving] = useState("");
  const [budget, setBudget] = useState("100");
  const [store, setStore] = useState("none");
  const [mode, setMode] = useState<"single" | "weekly">("single");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
  const [portions, setPortions] = useState("4");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDeals, setIsFetchingDeals] = useState(false);
  const [dealsLoaded, setDealsLoaded] = useState(false);

  const handleFetchDeals = async () => {
    if (store === "none") {
      toast.error("Välj en butik först!");
      return;
    }
    setIsFetchingDeals(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-store-deals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ store }),
        }
      );
      const data = await resp.json();
      if (data.success && data.text) {
        setPdfText((prev) => prev ? prev + "\n\n---\n\n" + data.text : data.text);
        setDealsLoaded(true);
        toast.success("Erbjudanden hämtade! 🎉");
      } else {
        toast.error(data.error || "Kunde inte hämta erbjudanden");
      }
    } catch {
      toast.error("Något gick fel vid hämtning av erbjudanden");
    } finally {
      setIsFetchingDeals(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ pdfText, craving, budget, mode, store, cuisines, selectedDays, portions }),
        }
      );

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Något gick fel!");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setResult(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setResult(
        `❌ ${e instanceof Error ? e.message : "Något gick fel, försök igen!"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PDF Upload */}
      <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <label className="section-label">
          📰 Reklamblad <span className="text-muted-foreground font-body text-sm font-normal">(valfritt)</span>
        </label>
        <PdfUploader onTextExtracted={setPdfText} />
      </div>

      {/* Craving */}
      <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <label className="section-label">🤤 Vad är du sugen på?</label>
        <Input
          placeholder="Krämig pasta, kycklinggryta, vegetariskt..."
          value={craving}
          onChange={(e) => setCraving(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Budget + Store row */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
        <div className="space-y-2">
          <label className="section-label">💰 Budget</label>
          <Input
            type="number"
            placeholder="100 kr"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="input-field"
            min="20"
          />
        </div>
        <div className="space-y-2">
          <label className="section-label">👥 Portioner</label>
          <Input
            type="number"
            placeholder="4"
            value={portions}
            onChange={(e) => setPortions(e.target.value)}
            className="input-field"
            min="1"
            max="20"
          />
        </div>
        <div className="space-y-2">
          <label className="section-label">🏪 Butik</label>
          <Select value={store} onValueChange={(v) => { setStore(v); setDealsLoaded(false); }}>
            <SelectTrigger className="input-field w-full">
              <SelectValue placeholder="Välj butik" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {STORES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fetch deals button */}
      {store !== "none" && (
        <div className="animate-fade-in-up" style={{ animationDelay: "0.17s" }}>
          <button
            onClick={handleFetchDeals}
            disabled={isFetchingDeals || dealsLoaded}
            className={`w-full h-10 rounded-xl text-sm font-display font-semibold flex items-center justify-center gap-2 transition-all ${
              dealsLoaded
                ? "bg-secondary/15 text-secondary"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isFetchingDeals ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Hämtar erbjudanden...</>
            ) : dealsLoaded ? (
              <>✅ Erbjudanden hämtade</>
            ) : (
              <><Download className="w-4 h-4" /> Hämta {STORES.find(s => s.value === store)?.label}-erbjudanden automatiskt</>
            )}
          </button>
        </div>
      )}

      {/* Cuisine inspiration */}
      <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <label className="section-label">🌍 Matinspiration <span className="text-muted-foreground font-body text-sm font-normal">(valfritt)</span></label>
        <CuisineSelector selected={cuisines} onChange={setCuisines} />
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
        <button
          className={`pill-toggle ${mode === "single" ? "pill-toggle-active" : "pill-toggle-inactive"}`}
          onClick={() => setMode("single")}
          type="button"
        >
          <ChefHat className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Ett recept
        </button>
        <button
          className={`pill-toggle ${mode === "weekly" ? "pill-toggle-active" : "pill-toggle-inactive"}`}
          onClick={() => setMode("weekly")}
          type="button"
        >
          <CalendarDays className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Veckomeny
        </button>
      </div>

      {/* Day selector for weekly mode */}
      {mode === "weekly" && (
        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.28s" }}>
          <label className="section-label">📅 Vilka dagar?</label>
          <DaySelector selected={selectedDays} onChange={setSelectedDays} />
        </div>
      )}

      {/* Generate */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
        <button
          className="btn-generate w-full h-14 rounded-xl text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="animate-spin inline-block">🍳</span> Lagar mat...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {mode === "weekly" ? "Skapa veckomeny!" : "Ge mig ett recept!"}
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <>
          <RecipeResult content={result} craving={craving} budget={budget} mode={mode} cuisines={cuisines} selectedDays={selectedDays} store={store} />
          {!isLoading && <ShoppingList content={result} />}
        </>
      )}
    </div>
  );
};

export default RecipeForm;
