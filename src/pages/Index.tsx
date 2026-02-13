import heroFood from "@/assets/hero-food.jpg";
import RecipeForm from "@/components/RecipeForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, LogIn, LogOut } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="page-shell">
      {/* Nav */}
      <nav className="container max-w-3xl mx-auto px-5 pt-5 flex justify-end gap-1">
        {user ? (
          <>
            <Link to="/saved">
              <Button variant="ghost" size="sm" className="font-display text-sm gap-1.5 text-muted-foreground hover:text-foreground">
                <BookOpen className="w-4 h-4" /> Mina recept
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="font-display text-sm gap-1.5 text-muted-foreground hover:text-foreground" onClick={signOut}>
              <LogOut className="w-4 h-4" /> Logga ut
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="font-display text-sm gap-1.5 text-muted-foreground hover:text-foreground">
              <LogIn className="w-4 h-4" /> Logga in
            </Button>
          </Link>
        )}
      </nav>

      {/* Hero */}
      <header className="container max-w-3xl mx-auto px-5 pt-6 pb-2 md:pt-10">
        <div className="text-center space-y-3 animate-fade-in-up">
          <p className="text-4xl md:text-5xl leading-none">🍳</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
            Matbudgeten
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Ladda upp ett reklamblad, berätta vad du är sugen på – få ett recept som passar plånboken.
          </p>
        </div>
        <div className="mt-6 max-w-2xl mx-auto">
          <img
            src={heroFood}
            alt="Färska ingredienser på ett bord"
            className="w-full rounded-2xl object-cover max-h-64 md:max-h-80"
            style={{ boxShadow: "0 8px 30px -8px hsl(14 80% 50% / 0.15)" }}
            loading="eager"
          />
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-xl mx-auto px-5 py-8 md:py-10">
        <RecipeForm />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-muted-foreground text-xs font-body tracking-wide">
        <p>Matbudgeten 2026 · Gjord med ❤️ och hunger</p>
      </footer>
    </div>
  );
};

export default Index;
