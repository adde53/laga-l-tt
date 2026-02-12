import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface RecipeResultProps {
  content: string;
  craving?: string;
  budget?: string;
  mode?: string;
}

const RecipeResult = ({ content, craving, budget, mode }: RecipeResultProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const htmlContent = useMemo(() => {
    let html = content
      .replace(/^### (.+)$/gm, '<h3 class="font-display text-lg font-semibold text-primary mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="font-display text-xl font-bold text-foreground mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="font-display text-2xl font-bold text-foreground mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-foreground/90">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-foreground/90">$2</li>')
      .replace(/\n\n/g, '<br/><br/>');
    return html;
  }, [content]);

  // Extract a title from the first heading or first line
  const extractTitle = () => {
    const match = content.match(/^#+\s*(.+)$/m);
    if (match) return match[1].replace(/[*_#]/g, "").trim();
    const firstLine = content.split("\n")[0];
    return firstLine.replace(/[*_#]/g, "").trim().slice(0, 80) || "Sparat recept";
  };

  const handleSave = async () => {
    if (!user) {
      toast("Logga in för att spara recept! 🔑");
      navigate("/auth");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("saved_recipes").insert({
      user_id: user.id,
      title: extractTitle(),
      content,
      mode: mode || "single",
      craving: craving || null,
      budget: budget ? parseInt(budget) : null,
    });

    if (error) {
      toast.error("Kunde inte spara receptet 😢");
    } else {
      setSaved(true);
      toast.success("Recept sparat! 📚");
    }
    setSaving(false);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍽️</span>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Ditt recept
            </h2>
          </div>
          <Button
            variant={saved ? "secondary" : "hero"}
            size="sm"
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Sparat
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" /> Spara
              </>
            )}
          </Button>
        </div>
        <div
          className="prose prose-sm max-w-none text-foreground/90 leading-relaxed font-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};

export default RecipeResult;
