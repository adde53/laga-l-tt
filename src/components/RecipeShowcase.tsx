import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Sparkles, ChefHat, Coins } from "lucide-react";

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
}

const CUISINE_EMOJIS: Record<string, string> = {
  Italienskt: "🇮🇹",
  Indiskt: "🇮🇳",
  Asiatiskt: "🥢",
  Svenskt: "🇸🇪",
  Medelhavs: "🫒",
  Mexikanskt: "🌮",
};

const RecipeCard = ({ recipe, index }: { recipe: FeaturedRecipe; index: number }) => {
  const emoji = recipe.cuisine ? CUISINE_EMOJIS[recipe.cuisine] || "🍽️" : "🍽️";

  return (
    <div
      className="recipe-showcase-card group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* AI badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold bg-primary/15 text-primary border border-primary/20">
          <Sparkles className="w-2.5 h-2.5" />
          AI-recept
        </span>
      </div>

      {/* Cuisine tag */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-lg">{emoji}</span>
        {recipe.cuisine && (
          <span className="text-[11px] font-display font-semibold text-muted-foreground">{recipe.cuisine}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-sm font-bold text-foreground leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
        {recipe.title}
      </h3>

      {/* Description */}
      <p className="text-xs font-body text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {recipe.description}
      </p>

      {/* Meta badges */}
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

const RecipeShowcase = () => {
  const [recipes, setRecipes] = useState<FeaturedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from("featured_recipes" as any)
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
    <section className="relative z-10 container max-w-6xl mx-auto px-5 pb-8" aria-label="Dagens AI-recept">
      <div className="flex items-center gap-3 mb-5">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-bold text-foreground">
          Dagens AI-genererade recept
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {recipes.map((recipe, i) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={i} />
        ))}
      </div>
    </section>
  );
};

export default RecipeShowcase;
