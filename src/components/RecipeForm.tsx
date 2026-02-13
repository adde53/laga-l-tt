import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PdfUploader from "./PdfUploader";
import RecipeResult from "./RecipeResult";
import ShoppingList from "./ShoppingList";
import { ChefHat, Sparkles, CalendarDays } from "lucide-react";

const RecipeForm = () => {
  const [pdfText, setPdfText] = useState("");
  const [craving, setCraving] = useState("");
  const [budget, setBudget] = useState("100");
  const [mode, setMode] = useState<"single" | "weekly">("single");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          body: JSON.stringify({ pdfText, craving, budget, mode }),
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
    <div className="space-y-8">
      {/* PDF Upload */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <label className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          📰 Reklamblad (valfritt)
        </label>
        <PdfUploader onTextExtracted={setPdfText} />
      </div>

      {/* Craving input */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <label className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          🤤 Vad är du sugen på?
        </label>
        <Input
          placeholder="T.ex. krämig pasta, kycklinggryta, vegetariskt..."
          value={craving}
          onChange={(e) => setCraving(e.target.value)}
          className="h-12 text-base rounded-lg border-2 focus:border-primary"
        />
      </div>

      {/* Budget */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <label className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          💰 Budget (kronor)
        </label>
        <Input
          type="number"
          placeholder="100"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="h-12 text-base rounded-lg border-2 focus:border-primary"
          min="20"
        />
      </div>

      {/* Mode toggle */}
      <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <Button
          variant={mode === "single" ? "hero" : "hero-outline"}
          size="lg"
          className="flex-1"
          onClick={() => setMode("single")}
          type="button"
        >
          <ChefHat className="w-5 h-5" />
          Ett recept
        </Button>
        <Button
          variant={mode === "weekly" ? "hero" : "hero-outline"}
          size="lg"
          className="flex-1"
          onClick={() => setMode("weekly")}
          type="button"
        >
          <CalendarDays className="w-5 h-5" />
          Veckomeny
        </Button>
      </div>

      {/* Generate button */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
        <Button
          variant="hero"
          size="lg"
          className="w-full h-14 text-xl"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="animate-spin">🍳</span> Lagar mat...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              {mode === "weekly" ? "Skapa veckomeny!" : "Ge mig ett recept!"}
            </>
          )}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <>
          <RecipeResult content={result} craving={craving} budget={budget} mode={mode} />
          {!isLoading && <ShoppingList content={result} />}
        </>
      )}
    </div>
  );
};

export default RecipeForm;
