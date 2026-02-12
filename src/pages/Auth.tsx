import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Inloggad! 🎉");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Kolla din e-post för att verifiera kontot! 📧");
      }
    } catch (error: any) {
      toast.error(error.message || "Något gick fel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="font-display text-4xl font-bold text-foreground">🍳 Matbudgeten</h1>
          <p className="text-muted-foreground mt-2 font-body">
            {isLogin ? "Logga in för att spara dina recept" : "Skapa ett konto"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-card border border-border space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-2">
            <label className="font-display font-semibold text-foreground">E-post</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.se"
              required
              className="h-12 text-base rounded-lg border-2 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="font-display font-semibold text-foreground">Lösenord</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minst 6 tecken"
              required
              minLength={6}
              className="h-12 text-base rounded-lg border-2 focus:border-primary"
            />
          </div>
          <Button variant="hero" size="lg" className="w-full h-12" type="submit" disabled={loading}>
            {loading ? "⏳ Vänta..." : isLogin ? "Logga in" : "Skapa konto"}
          </Button>
          <p className="text-center text-sm text-muted-foreground font-body">
            {isLogin ? "Inget konto?" : "Har redan konto?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? "Skapa ett här" : "Logga in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
