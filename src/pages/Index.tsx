import RecipeForm from "@/components/RecipeForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, LogIn, LogOut } from "lucide-react";
import {
  PotIllustration,
  CarrotIllustration,
  PanIllustration,
  ShoppingBagIllustration,
  MagicWandIllustration,
  CoinIllustration,
  QuickTimeIllustration,
  ChefHatIllustration,
} from "@/components/illustrations/FoodIllustrations";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="page-shell">
      <div className="page-bg-blobs" />

      {/* Nav */}
      <nav className="container max-w-5xl mx-auto px-5 pt-5 flex items-center justify-between" aria-label="Huvudnavigation">
        <span className="font-display text-lg font-bold text-foreground tracking-tight">
          Veckans<span className="text-primary">MatFynd</span>
        </span>
        <div className="flex gap-1">
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
        </div>
      </nav>

      {/* Hero */}
      <header className="container max-w-5xl mx-auto px-5 pt-10 pb-4 md:pt-16 md:pb-8">
        <div className="md:grid md:grid-cols-2 md:gap-12 md:items-center">
          {/* Left: text */}
          <div className="text-center md:text-left space-y-5 animate-fade-in-up">
            <div className="inline-flex items-center gap-4 select-none" aria-hidden="true">
              <PotIllustration size={52} className="text-primary hero-float" style={{ animationDelay: "0s" }} />
              <CarrotIllustration size={44} className="text-accent-foreground hero-float" style={{ animationDelay: "0.4s" }} />
              <PanIllustration size={48} className="text-secondary hero-float" style={{ animationDelay: "0.8s" }} />
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
              Veckans<span className="text-primary">MatFynd</span>
            </h1>
            <div className="hero-strip max-w-xs mx-auto md:mx-0" aria-hidden="true" />
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-md mx-auto md:mx-0 leading-relaxed">
              Berätta vad du är sugen på – få recept som passar plånboken.
              Vi hittar veckans bästa erbjudanden och skapar din meny automatiskt.
            </p>
          </div>

          {/* Right: feature cards – desktop */}
          <div className="hidden md:grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="feature-card-desktop">
              <ShoppingBagIllustration size={36} className="text-primary" />
              <h3 className="font-display font-bold text-sm text-foreground">Veckans erbjudanden</h3>
              <p className="text-xs text-muted-foreground">Automatisk hämtning från ICA, Coop, Willys & fler</p>
            </div>
            <div className="feature-card-desktop">
              <MagicWandIllustration size={36} className="text-accent-foreground" />
              <h3 className="font-display font-bold text-sm text-foreground">AI + riktiga recept</h3>
              <p className="text-xs text-muted-foreground">Mix av webrecept och AI-genererade förslag</p>
            </div>
            <div className="feature-card-desktop">
              <CoinIllustration size={36} className="text-secondary" />
              <h3 className="font-display font-bold text-sm text-foreground">Budgetanpassat</h3>
              <p className="text-xs text-muted-foreground">Ange din budget – vi anpassar recepten</p>
            </div>
            <div className="feature-card-desktop">
              <QuickTimeIllustration size={36} className="text-primary" />
              <h3 className="font-display font-bold text-sm text-foreground">Veckomeny på minuter</h3>
              <p className="text-xs text-muted-foreground">Komplett veckoplanering med inköpslista</p>
            </div>
          </div>
        </div>
      </header>

      {/* Feature chips – mobile */}
      <section className="md:hidden container max-w-xl mx-auto px-5 pt-2 pb-2" aria-label="Funktioner">
        <div className="grid grid-cols-3 gap-3">
          <div className="feature-chip">
            <ShoppingBagIllustration size={24} className="text-primary" />
            <span>Erbjudanden</span>
          </div>
          <div className="feature-chip">
            <MagicWandIllustration size={24} className="text-accent-foreground" />
            <span>AI + riktiga recept</span>
          </div>
          <div className="feature-chip">
            <PotIllustration size={24} className="text-secondary" />
            <span>Veckomeny</span>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="container max-w-5xl mx-auto px-5 py-6 md:py-10">
        <div className="md:max-w-2xl md:mx-auto lg:max-w-3xl">
          <div className="card-warm p-5 md:p-8 lg:p-10">
            <div className="flex items-center gap-2.5 mb-6">
              <ChefHatIllustration size={28} className="text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">Skapa ditt recept</h2>
            </div>
            <RecipeForm />
          </div>
        </div>
      </main>

      {/* SEO content */}
      <section className="container max-w-4xl mx-auto px-5 pb-10" aria-label="Om VeckansMatFynd">
        <div className="space-y-6 text-sm font-body text-muted-foreground/70 leading-relaxed">
          <div className="h-px bg-border" />
          <h2 className="font-display text-lg font-semibold text-foreground/60 text-center">
            Billiga recept som faktiskt smakar gott
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs leading-relaxed">
            <article>
              <h3 className="font-display text-sm font-semibold text-foreground/50 mb-1">Spara pengar på maten</h3>
              <p>
                VeckansMatFynd hjälper dig att planera veckans måltider baserat på aktuella erbjudanden från ICA, Coop, Willys,
                Hemköp och Lidl. Få recept som maximerar dina besparingar utan att tumma på smaken.
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
                VeckansMatFynd skapar recept anpassade efter just din situation.
              </p>
            </article>
            <article>
              <h3 className="font-display text-sm font-semibold text-foreground/50 mb-1">Skapa veckomeny på minuter</h3>
              <p>
                Välj vilka dagar du vill ha recept för, ange din totala matbudget och vilken typ av mat du gillar.
                VeckansMatFynd genererar en komplett veckomeny med inköpslista på bara några sekunder.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-muted-foreground text-xs font-body tracking-wide">
        <div className="flex items-center justify-center gap-3 mb-2">
          <PotIllustration size={16} className="text-primary opacity-40" />
          <CarrotIllustration size={14} className="text-accent-foreground opacity-30" />
          <PanIllustration size={16} className="text-secondary opacity-35" />
        </div>
        <p>VeckansMatFynd 2026 · Gjord med kärlek och hunger</p>
        <p className="mt-1 text-muted-foreground/50">
          Billiga recept · Veckomeny · Budgetmat · Veckans erbjudanden
        </p>
      </footer>
    </div>
  );
};

export default Index;
