import RecipeForm from "@/components/RecipeForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, LogIn, LogOut, Sparkles, ShoppingCart, Utensils } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="page-shell">
      <div className="page-bg-blobs" />

      {/* Nav */}
      <nav className="container max-w-3xl mx-auto px-5 pt-5 flex justify-end gap-1" aria-label="Huvudnavigation">
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
          <div className="inline-flex items-center gap-3 text-5xl md:text-6xl select-none" aria-hidden="true">
            <span className="animate-bounce" style={{ animationDelay: "0s", animationDuration: "2.5s" }}>🥘</span>
            <span className="animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "2.5s" }}>🥦</span>
            <span className="animate-bounce" style={{ animationDelay: "0.6s", animationDuration: "2.5s" }}>🍳</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Mat<span className="text-primary">budgeten</span>
          </h1>
          <div className="hero-strip max-w-xs mx-auto" aria-hidden="true" />
          <p className="font-body text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Ladda upp ett reklamblad, berätta vad du är sugen på – få ett recept som passar plånboken.
          </p>
        </div>
      </header>

      {/* Feature highlights */}
      <section className="container max-w-xl mx-auto px-5 pt-4 pb-2" aria-label="Funktioner">
        <div className="grid grid-cols-3 gap-3">
          <div className="feature-chip">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span>Veckans erbjudanden</span>
          </div>
          <div className="feature-chip">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
            <span>AI + riktiga recept</span>
          </div>
          <div className="feature-chip">
            <Utensils className="w-4 h-4 text-secondary" />
            <span>Veckomeny</span>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="container max-w-xl mx-auto px-5 py-6 md:py-8">
        <RecipeForm />
      </main>

      {/* SEO content – visible but subtle, valuable for crawlers */}
      <section className="container max-w-2xl mx-auto px-5 pb-10" aria-label="Om Matbudgeten">
        <div className="space-y-6 text-sm font-body text-muted-foreground/70 leading-relaxed">
          <div className="h-px bg-border" />
          <h2 className="font-display text-lg font-semibold text-foreground/60 text-center">
            Billiga recept som faktiskt smakar gott
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed">
            <article>
              <h3 className="font-display text-sm font-semibold text-foreground/50 mb-1">Spara pengar på maten</h3>
              <p>
                Matbudgeten hjälper dig att planera veckans måltider baserat på aktuella erbjudanden från ICA, Coop, Willys, 
                Hemköp och Lidl. Ladda upp ett reklamblad och få recept som maximerar dina besparingar utan att tumma på smaken.
              </p>
            </article>
            <article>
              <h3 className="font-display text-sm font-semibold text-foreground/50 mb-1">Riktiga recept & AI-genererade</h3>
              <p>
                Vi blandar noggrant utvalda recept från populära svenska matsidor som ICA Recept, Köket.se och Arla 
                med AI-genererade recept anpassade efter din budget och dina önskemål.
              </p>
            </article>
            <article>
              <h3 className="font-display text-sm font-semibold text-foreground/50 mb-1">Perfekt för studenter & familjer</h3>
              <p>
                Oavsett om du är student med tight budget eller en familj som vill äta gott utan att det kostar skjortan – 
                Matbudgeten skapar recept och veckomenyer anpassade efter just din situation.
              </p>
            </article>
            <article>
              <h3 className="font-display text-sm font-semibold text-foreground/50 mb-1">Skapa veckomeny på minuter</h3>
              <p>
                Välj vilka dagar du vill ha recept för, ange din totala matbudget och vilken typ av mat du gillar. 
                Matbudgeten genererar en komplett veckomeny med inköpslista på bara några sekunder.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-muted-foreground text-xs font-body tracking-wide">
        <p>Matbudgeten 2026 · Gjord med ❤️ och hunger</p>
        <p className="mt-1 text-muted-foreground/50">
          Billiga recept · Veckomeny · Budgetmat · Veckans erbjudanden
        </p>
      </footer>
    </div>
  );
};

export default Index;
