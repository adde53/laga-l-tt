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

const RecipeResult = ({ content, craving, budget, mode, cuisines, selectedDays, store }: RecipeResultProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const htmlContent = useMemo(() => {
    return content
      .replace(/^### (.+)$/gm, '<h3 class="font-display text-base font-semibold text-primary mt-4 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="font-display text-lg font-bold text-foreground mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="font-display text-xl font-bold text-foreground mt-5 mb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-foreground/85 leading-relaxed">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-foreground/85 leading-relaxed">$2</li>')
      .replace(/\n\n/g, '<br/><br/>');
  }, [content]);

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
      cuisine: cuisines?.join(", ") || null,
      selected_days: selectedDays || null,
      store: store && store !== "none" ? store : null,
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
      <div className="card-warm p-5 md:p-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">🍽️</span> Ditt recept
          </h2>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display font-semibold transition-all ${
              saved
                ? "bg-secondary/15 text-secondary"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            } disabled:opacity-60`}
          >
            {saved ? (
              <><Check className="w-3.5 h-3.5" /> Sparat</>
            ) : (
              <><Bookmark className="w-3.5 h-3.5" /> Spara</>
            )}
          </button>
        </div>
        <div
          className="text-sm leading-relaxed font-body text-foreground/85"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};

export default RecipeResult;
