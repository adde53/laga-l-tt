import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
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

const SavedRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  return (
    <div className="page-shell min-h-screen">
      <div className="container max-w-xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">
            📚 Sparade recept
          </h1>
        </div>

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
        ) : (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="card-warm p-4 cursor-pointer transition-all"
                onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm">{recipe.mode === "weekly" ? "📅" : "🍽️"}</span>
                      <h3 className="font-display font-semibold text-foreground text-sm truncate">
                        {recipe.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground font-body">
                      {recipe.budget && <span>💰 {recipe.budget} kr</span>}
                      {recipe.craving && <span>🤤 {recipe.craving}</span>}
                      {recipe.cuisine && <span>🌍 {recipe.cuisine}</span>}
                      {recipe.store && <span>🏪 {recipe.store}</span>}
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
                  <div className="mt-3 pt-3 border-t border-border">
                    <div
                      className="text-sm leading-relaxed font-body text-foreground/85 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: recipe.content
                          .replace(/^### (.+)$/gm, '<h3 class="font-display text-base font-semibold text-primary mt-3 mb-1">$1</h3>')
                          .replace(/^## (.+)$/gm, '<h2 class="font-display text-lg font-bold text-foreground mt-4 mb-2">$1</h2>')
                          .replace(/^# (.+)$/gm, '<h1 class="font-display text-xl font-bold text-foreground mt-4 mb-2">$1</h1>')
                          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                          .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
                          .replace(/\n\n/g, "<br/><br/>"),
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRecipes;
