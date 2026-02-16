import RecipeForm from "@/components/RecipeForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, LogIn, LogOut } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="page-shell">
      <div className="page-bg-blobs" />

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
      <header className="container max-w-3xl mx-auto px-5 pt-8 pb-2 md:pt-12">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 text-5xl md:text-6xl select-none">
            <span className="animate-bounce" style={{ animationDelay: "0s", animationDuration: "2.5s" }}>🥘</span>
            <span className="animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "2.5s" }}>🥦</span>
            <span className="animate-bounce" style={{ animationDelay: "0.6s", animationDuration: "2.5s" }}>🍳</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Mat<span className="text-primary">budgeten</span>
          </h1>
          <div className="hero-strip max-w-xs mx-auto" />
          <p className="font-body text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Ladda upp ett reklamblad, berätta vad du är sugen på – få ett recept som passar plånboken.
          </p>
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
