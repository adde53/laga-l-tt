import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface SavedRecipe {
  id: string;
  title: string;
  content: string;
  mode: string;
  craving: string | null;
  budget: number | null;
  cuisine: string | null;
  selected_days: string[] | null;
  store: string | null;
  created_at: string;
}

const extractCost = (content: string, budget: number | null): { total: number | null; perPortion: string | null; ingredientCount: number } => {
  // Try explicit total pattern first
  const totalMatch = content.match(/💰\s*(?:Total(?:kostnad)?|Totalt)[^:]*:\s*~?(\d+(?:[,.]\d+)?)\s*kr/i);
  const portionsMatch = content.match(/👥\s*(\d+)\s*portioner/i);
  
  if (totalMatch) {
    const total = parseFloat(totalMatch[1].replace(",", "."));
    const portions = portionsMatch ? parseInt(portionsMatch[1]) : null;
    const perPortion = portions ? String(Math.round(total / portions)) : null;
    return { total, perPortion, ingredientCount: 0 };
  }
  
  // Fallback: sum all inline prices like "(12 kr)", "(3 kr)"
  const priceMatches = content.matchAll(/\((\d+(?:[,.]\d+)?)\s*kr\)/gi);
  let sum = 0;
  let count = 0;
  for (const m of priceMatches) {
    sum += parseFloat(m[1].replace(",", "."));
    count++;
  }
  
  if (sum > 0) {
    const portions = portionsMatch ? parseInt(portionsMatch[1]) : null;
    const perPortion = portions ? String(Math.round(sum / portions)) : null;
    return { total: sum, perPortion, ingredientCount: count };
  }
  
  return { total: null, perPortion: null, ingredientCount: 0 };
};

const extractPortions = (content: string): string | null => {
  const m = content.match(/👥\s*(\d+)\s*portioner/i);
  return m ? m[1] : null;
};

const markdownToHtml = (text: string): string => {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-primary mt-4 mb-1.5">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-foreground mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-foreground mt-5 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-foreground/80 leading-relaxed text-sm">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-foreground/80 leading-relaxed text-sm">$2</li>')
    .replace(/\n\n/g, '<div class="h-2"></div>');
};

const SavedRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) fetchRecipes();
  }, [user]);

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("saved_recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Kunde inte hämta recept");
    } else {
      setRecipes(data || []);
    }
    setLoading(false);
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase.from("saved_recipes").delete().eq("id", id);
    if (error) {
      toast.error("Kunde inte ta bort receptet");
    } else {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Recept borttaget! 🗑️");
    }
  };

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    const q = searchQuery.toLowerCase();
    return recipes.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      r.craving?.toLowerCase().includes(q) ||
      r.cuisine?.toLowerCase().includes(q) ||
      r.store?.toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q)
    );
  }, [recipes, searchQuery]);

  return (
    <div className="page-shell min-h-screen">
      <div className="container max-w-xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">
            📚 Sparade recept
          </h1>
        </div>

        {/* Search */}
        {recipes.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök recept, ingrediens, kök..."
              className="input-field pl-9"
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-body">
            <span className="animate-spin inline-block text-2xl">🍳</span>
            <p className="mt-2 text-sm">Laddar recept...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 card-warm p-8">
            <span className="text-4xl">🍽️</span>
            <p className="mt-3 text-base font-display font-semibold text-foreground">
              Inga sparade recept ännu!
            </p>
            <p className="text-muted-foreground font-body text-sm mt-1">
              Generera ett recept och spara det.
            </p>
            <Link to="/">
              <button className="btn-generate mt-5 px-6 py-2.5 rounded-xl text-sm">
                Skapa recept
              </button>
            </Link>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-body">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">Inga recept matchade "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecipes.map((recipe) => {
              const cost = extractCost(recipe.content, recipe.budget);
              const portions = extractPortions(recipe.content);
              return (
                <div
                  key={recipe.id}
                  className="card-warm p-4 cursor-pointer transition-all"
                  onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{recipe.mode === "weekly" ? "📅" : "🍽️"}</span>
                        <h3 className="font-display font-semibold text-foreground text-sm truncate">
                          {recipe.title}
                        </h3>
                      </div>
                      {/* Price & info badges */}
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {cost.total != null && (
                          <span className="inline-flex items-center text-xs font-display font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-md">
                            💰 {cost.total} kr totalt
                          </span>
                        )}
                        {cost.perPortion && (
                          <span className="inline-flex items-center text-xs font-display font-semibold bg-secondary/10 text-secondary-foreground px-2 py-0.5 rounded-md">
                            🍽️ {cost.perPortion} kr/portion
                          </span>
                        )}
                        {portions && (
                          <span className="inline-flex items-center text-xs font-display bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                            👥 {portions} port.
                          </span>
                        )}
                        {recipe.cuisine && (
                          <span className="inline-flex items-center text-xs font-display bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                            🌍 {recipe.cuisine}
                          </span>
                        )}
                        {recipe.store && (
                          <span className="inline-flex items-center text-xs font-display bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                            🏪 {recipe.store}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground font-body">
                        <span>
                          {new Date(recipe.created_at).toLocaleDateString("sv-SE")}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRecipe(recipe.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {expandedId === recipe.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      {/* Summary badges */}
                      <div className="flex flex-wrap gap-2">
                        {cost.total && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                            💰 Totalt: {cost.total} kr
                          </span>
                        )}
                        {cost.perPortion && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-secondary/10 text-secondary px-2.5 py-1 rounded-lg">
                            🍽️ {cost.perPortion} kr/portion
                          </span>
                        )}
                        {portions && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
                            👥 {portions} portioner
                          </span>
                        )}
                        {recipe.store && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
                            🏪 {recipe.store}
                          </span>
                        )}
                      </div>
                      {/* Recipe content */}
                      <div
                        className="font-body text-foreground/85 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(recipe.content) }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRecipes;
