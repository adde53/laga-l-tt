import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Clock, Sparkles, ChefHat, Coins, Users, Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeaturedRecipe {
  id: string;
  title: string;
  description: string;
  total_cost: number;
  cost_per_portion: number | null;
  cook_time_minutes: number;
  ingredient_count: number;
  cuisine: string | null;
  servings: number;
  content: string | null;
}

const CUISINE_EMOJIS: Record<string, string> = {
  Italienskt: "🇮🇹",
  Indiskt: "🇮🇳",
  Asiatiskt: "🥢",
  Svenskt: "🇸🇪",
  Medelhavs: "🫒",
  Mexikanskt: "🌮",
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

const RecipeCard = ({ recipe, index, onClick }: { recipe: FeaturedRecipe; index: number; onClick: () => void }) => {
  const emoji = recipe.cuisine ? CUISINE_EMOJIS[recipe.cuisine] || "🍽️" : "🍽️";

  return (
    <div
      className="recipe-showcase-card group animate-fade-in-up cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold bg-primary/15 text-primary border border-primary/20">
          <Sparkles className="w-2.5 h-2.5" />
          AI-recept
        </span>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-lg">{emoji}</span>
        {recipe.cuisine && (
          <span className="text-[11px] font-display font-semibold text-muted-foreground">{recipe.cuisine}</span>
        )}
      </div>

      <h3 className="font-display text-sm font-bold text-foreground leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
        {recipe.title}
      </h3>

      <p className="text-xs font-body text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {recipe.description}
      </p>

      <div className="mt-auto flex flex-wrap gap-1.5">
        <span className="showcase-badge showcase-badge-cost">
          <Coins className="w-3 h-3" />
          {recipe.total_cost} kr
        </span>
        {recipe.cost_per_portion && (
          <span className="showcase-badge showcase-badge-muted">
            {recipe.cost_per_portion} kr/port
          </span>
        )}
        <span className="showcase-badge showcase-badge-time">
          <Clock className="w-3 h-3" />
          {recipe.cook_time_minutes} min
        </span>
        <span className="showcase-badge showcase-badge-muted">
          <ChefHat className="w-3 h-3" />
          {recipe.ingredient_count} ingredienser
        </span>
      </div>
    </div>
  );
};

const RecipeDetailDialog = ({ recipe, open, onClose }: { recipe: FeaturedRecipe | null; open: boolean; onClose: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset saved state when recipe changes
  useEffect(() => {
    setSaved(false);
  }, [recipe?.id]);

  if (!recipe) return null;
  const emoji = recipe.cuisine ? CUISINE_EMOJIS[recipe.cuisine] || "🍽️" : "🍽️";

  const handleSave = async () => {
    if (!user) {
      toast("Logga in för att spara recept! 🔑");
      navigate("/auth?redirect=/");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("saved_recipes").insert({
      user_id: user.id,
      title: recipe.title,
      content: recipe.content || recipe.description,
      mode: "single",
      cuisine: recipe.cuisine || null,
    });
    if (error) {
      toast.error("Kunde inte spara receptet 😢");
    } else {
      toast.success("Recept sparat! 📚");
      setSaved(true);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{emoji}</span>
            {recipe.cuisine && (
              <span className="text-xs font-display font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {recipe.cuisine}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold bg-primary/15 text-primary border border-primary/20">
              <Sparkles className="w-2.5 h-2.5" />
              AI-recept
            </span>
          </div>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              {recipe.title}
            </DialogTitle>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display font-semibold transition-all shrink-0 ${
                saved
                  ? "bg-secondary/15 text-secondary"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              } disabled:opacity-60`}
            >
              {saved ? <><Check className="w-3.5 h-3.5" /> Sparat</> : <><Bookmark className="w-3.5 h-3.5" /> Spara</>}
            </button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <Coins className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-display font-bold text-foreground">{recipe.total_cost} kr</p>
            <p className="text-[11px] text-muted-foreground">Totalkostnad</p>
          </div>
          {recipe.cost_per_portion && (
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-display font-bold text-foreground">{recipe.cost_per_portion} kr</p>
              <p className="text-[11px] text-muted-foreground">Per portion</p>
            </div>
          )}
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-display font-bold text-foreground">{recipe.cook_time_minutes} min</p>
            <p className="text-[11px] text-muted-foreground">Tillagningstid</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <ChefHat className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-display font-bold text-foreground">{recipe.ingredient_count}</p>
            <p className="text-[11px] text-muted-foreground">Ingredienser</p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-3 mt-1 flex items-center justify-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-body text-muted-foreground">{recipe.servings} portioner</span>
        </div>

        {recipe.content ? (
          <div
            className="text-sm leading-relaxed font-body text-foreground/85 mt-3"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(recipe.content) }}
          />
        ) : (
          <p className="text-sm font-body text-muted-foreground leading-relaxed mt-3">
            {recipe.description}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

const RecipeShowcase = () => {
  const [recipes, setRecipes] = useState<FeaturedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<FeaturedRecipe | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from("featured_recipes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setRecipes(data as unknown as FeaturedRecipe[]);
      }
      setLoading(false);
    };
    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <section className="relative z-10 container max-w-6xl mx-auto px-5 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (recipes.length === 0) return null;

  return (
    <section className="relative z-10 container max-w-6xl mx-auto px-5 pb-8" aria-label="Receptinspiration">
      <div className="flex items-center gap-3 mb-5">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-bold text-foreground">
          Receptinspiration
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {recipes.map((recipe, i) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={i} onClick={() => setSelectedRecipe(recipe)} />
        ))}
      </div>

      <RecipeDetailDialog
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </section>
  );
};

export default RecipeShowcase;
