import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface RecipeResultProps {
  content: string;
  craving?: string;
  budget?: string;
  mode?: string;
  cuisines?: string[];
  selectedDays?: string[];
  store?: string;
}

interface DayRecipe {
  title: string;
  content: string;
}

const parseDayRecipes = (content: string): DayRecipe[] => {
  const dayPatterns = /^(#{1,3})\s*(.*(Måndag|Tisdag|Onsdag|Torsdag|Fredag|Lördag|Söndag).*)/gim;
  const matches: { index: number; title: string; level: number }[] = [];

  let match;
  while ((match = dayPatterns.exec(content)) !== null) {
    matches.push({ index: match.index, title: match[2].replace(/[*_#]/g, "").trim(), level: match[1].length });
  }

  if (matches.length === 0) return [];

  const recipes: DayRecipe[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.indexOf("## 🛒 Inköpslista") !== -1 ? content.indexOf("## 🛒 Inköpslista") : content.length;
    const dayContent = content.slice(start, end).trim();
    if (dayContent.length > 20) {
      recipes.push({ title: matches[i].title, content: dayContent });
    }
  }
  return recipes;
};

const markdownToHtml = (text: string): string => {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="font-display text-base font-semibold text-primary mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-lg font-bold text-foreground mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display text-xl font-bold text-foreground mt-5 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-foreground/85 leading-relaxed">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-foreground/85 leading-relaxed">$2</li>')
    .replace(/\n\n/g, '<br/><br/>');
};

const SaveButton = ({ onSave, saved, saving }: { onSave: () => void; saved: boolean; saving: boolean }) => (
  <button
    onClick={onSave}
    disabled={saving || saved}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display font-semibold transition-all shrink-0 ${
      saved
        ? "bg-secondary/15 text-secondary"
        : "bg-primary/10 text-primary hover:bg-primary/20"
    } disabled:opacity-60`}
  >
    {saved ? <><Check className="w-3.5 h-3.5" /> Sparat</> : <><Bookmark className="w-3.5 h-3.5" /> Spara</>}
  </button>
);

const RecipeResult = ({ content, craving, budget, mode, cuisines, selectedDays, store }: RecipeResultProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedAll, setSavedAll] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [savedDays, setSavedDays] = useState<Set<number>>(new Set());
  const [savingDay, setSavingDay] = useState<number | null>(null);

  const isWeekly = mode === "weekly";
  const dayRecipes = useMemo(() => isWeekly ? parseDayRecipes(content) : [], [content, isWeekly]);

  const filteredContent = useMemo(() => {
    const withoutShoppingList = content.replace(/##\s*🛒 Inköpslista[^\n]*\n[\s\S]*?(?=\n##|$)/, '');
    return markdownToHtml(withoutShoppingList);
  }, [content]);

  const saveRecipe = async (title: string, recipeContent: string) => {
    if (!user) {
      toast("Logga in för att spara recept! 🔑");
      navigate("/auth");
      return false;
    }
    const { error } = await supabase.from("saved_recipes").insert({
      user_id: user.id,
      title,
      content: recipeContent,
      mode: "single",
      craving: craving || null,
      budget: budget ? parseInt(budget) : null,
      cuisine: cuisines?.join(", ") || null,
      selected_days: selectedDays || null,
      store: store && store !== "none" ? store : null,
    });
    if (error) { toast.error("Kunde inte spara receptet 😢"); return false; }
    toast.success("Recept sparat! 📚");
    return true;
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    const title = content.match(/^#+\s*(.+)$/m)?.[1]?.replace(/[*_#]/g, "").trim() || "Sparat recept";
    const ok = await saveRecipe(title, content);
    if (ok) setSavedAll(true);
    setSavingAll(false);
  };

  const handleSaveDay = async (index: number, recipe: DayRecipe) => {
    setSavingDay(index);
    const ok = await saveRecipe(recipe.title, recipe.content);
    if (ok) setSavedDays(prev => new Set(prev).add(index));
    setSavingDay(null);
  };

  // For single recipes or non-parseable weekly menus, show as before
  if (!isWeekly || dayRecipes.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <div className="card-warm p-5 md:p-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-2xl">🍽️</span> Ditt recept
            </h2>
            <SaveButton onSave={handleSaveAll} saved={savedAll} saving={savingAll} />
          </div>
          <div className="text-sm leading-relaxed font-body text-foreground/85" dangerouslySetInnerHTML={{ __html: filteredContent }} />
        </div>
      </div>
    );
  }

  // Weekly menu: show each day as a separate card with its own save button
  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">📅</span> Din veckomeny
        </h2>
        <SaveButton onSave={handleSaveAll} saved={savedAll} saving={savingAll} />
      </div>

      {dayRecipes.map((recipe, i) => (
        <div key={i} className="card-warm p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-bold text-foreground">{recipe.title}</h3>
            <SaveButton
              onSave={() => handleSaveDay(i, recipe)}
              saved={savedDays.has(i)}
              saving={savingDay === i}
            />
          </div>
          <div className="text-sm leading-relaxed font-body text-foreground/85" dangerouslySetInnerHTML={{ __html: markdownToHtml(recipe.content) }} />
        </div>
      ))}
    </div>
  );
};

export default RecipeResult;
