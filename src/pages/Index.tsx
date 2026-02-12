import heroFood from "@/assets/hero-food.jpg";
import RecipeForm from "@/components/RecipeForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, LogIn, LogOut } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Nav */}
      <nav className="container max-w-5xl mx-auto px-4 pt-4 flex justify-end gap-2">
        {user ? (
          <>
            <Link to="/saved">
              <Button variant="ghost" size="sm" className="font-display">
                <BookOpen className="w-4 h-4" /> Mina recept
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="font-display text-muted-foreground" onClick={signOut}>
              <LogOut className="w-4 h-4" /> Logga ut
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="font-display">
              <LogIn className="w-4 h-4" /> Logga in
            </Button>
          </Link>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container max-w-5xl mx-auto px-4 pt-4 pb-4 md:pt-8">
          <div className="text-center space-y-4 animate-fade-in-up">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
              🍳 Matbudgeten
            </h1>
            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Ladda upp ett reklamblad, berätta vad du är sugen på, och få ett
              gott recept som passar din plånbok!
            </p>
          </div>
          <div className="mt-6 max-w-3xl mx-auto">
            <img
              src={heroFood}
              alt="Färska ingredienser på ett bord"
              className="w-full rounded-2xl shadow-food"
              loading="eager"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        <RecipeForm />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-muted-foreground text-sm font-body">
        <p>Gjord med ❤️ och hunger • Matbudgeten 2026</p>
      </footer>
    </div>
  );
};

export default Index;
