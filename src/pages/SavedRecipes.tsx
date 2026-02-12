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

  // Simple markdown to text for preview
  const getPreview = (content: string) => {
    return content.replace(/[#*_\-]/g, "").slice(0, 120) + "...";
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">
            📚 Sparade recept
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground font-body">
            <span className="animate-spin inline-block text-2xl">🍳</span>
            <p className="mt-2">Laddar recept...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl shadow-card border border-border">
            <span className="text-4xl">🍽️</span>
            <p className="mt-4 text-lg font-display font-semibold text-foreground">
              Inga sparade recept ännu!
            </p>
            <p className="text-muted-foreground font-body mt-1">
              Generera ett recept och spara det.
            </p>
            <Link to="/">
              <Button variant="hero" className="mt-4">
                Skapa recept
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-card rounded-xl p-5 shadow-card border border-border cursor-pointer hover:shadow-food transition-shadow"
                onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{recipe.mode === "weekly" ? "📅" : "🍽️"}</span>
                      <h3 className="font-display font-semibold text-foreground truncate">
                        {recipe.title}
                      </h3>
                    </div>
                    <div className="flex gap-3 text-sm text-muted-foreground font-body">
                      {recipe.budget && <span>💰 {recipe.budget} kr</span>}
                      {recipe.craving && <span>🤤 {recipe.craving}</span>}
                      <span>
                        {new Date(recipe.created_at).toLocaleDateString("sv-SE")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRecipe(recipe.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {expandedId === recipe.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div
                      className="prose prose-sm max-w-none text-foreground/90 leading-relaxed font-body whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: recipe.content
                          .replace(/^### (.+)$/gm, '<h3 class="font-display text-lg font-semibold text-primary mt-4 mb-2">$1</h3>')
                          .replace(/^## (.+)$/gm, '<h2 class="font-display text-xl font-bold text-foreground mt-6 mb-3">$2</h2>')
                          .replace(/^# (.+)$/gm, '<h1 class="font-display text-2xl font-bold text-foreground mt-6 mb-3">$1</h1>')
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
