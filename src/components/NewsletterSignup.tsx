import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, CheckCircle, Utensils } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Ange en giltig e-postadress");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: trimmed });

      if (error) {
        if (error.code === "23505") {
          toast.info("Du prenumererar redan! 🎉");
          setSubscribed(true);
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        toast.success("Välkommen! Du får ditt första veckobrev nästa måndag 🎉");
      }
    } catch {
      toast.error("Något gick fel, försök igen");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="text-center py-6 space-y-2 animate-fade-in-up">
        <CheckCircle className="w-10 h-10 text-primary mx-auto" />
        <p className="font-display font-bold text-foreground">Du är med! 🎉</p>
        <p className="text-sm text-muted-foreground">
          Varje måndag får du 5 budgetrecept baserade på veckans erbjudanden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="form-icon-badge">
          <Mail className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Gratis veckomeny – varje måndag
          </h3>
          <p className="text-sm text-muted-foreground">
            5 recept · 4 portioner · under 500 kr · baserat på veckans erbjudanden
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium">
          <Utensils className="w-3 h-3" /> Balanserat: protein, grönsaker & kolhydrater
        </span>
        <span className="inline-flex items-center gap-1 bg-secondary/10 text-secondary-foreground rounded-full px-2.5 py-1 font-medium">
          📬 Skickas automatiskt varje måndag
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="din@epost.se"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="shrink-0">
          {loading ? "Skickar..." : "Prenumerera"}
        </Button>
      </form>

      <p className="text-[11px] text-muted-foreground/60">
        Ingen spam – bara recept. Avsluta när du vill.
      </p>
    </div>
  );
};

export default NewsletterSignup;
