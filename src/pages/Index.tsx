import RecipeForm from "@/components/RecipeForm"; // redesigned
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, LogIn, LogOut, ArrowDown } from "lucide-react";
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

  const scrollToForm = () => {
    document.getElementById("recipe-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="hero-mesh" aria-hidden="true" />

      {/* Nav */}
      <nav className="relative z-10 container max-w-6xl mx-auto px-5 pt-5 flex items-center justify-between">
        <span className="font-display text-xl font-bold tracking-tight">
          <span className="text-foreground">Veckans</span>
          <span className="hero-text-gradient">MatFynd</span>
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

      {/* Hero – full viewport */}
      <header className="relative z-10 container max-w-6xl mx-auto px-5 pt-12 pb-6 md:pt-20 md:pb-12 lg:pt-28 lg:pb-16">
        <div className="md:grid md:grid-cols-5 md:gap-10 lg:gap-16 md:items-center">
          {/* Left: text – 3 cols */}
          <div className="md:col-span-3 text-center md:text-left space-y-6 animate-fade-in-up">
            {/* Floating illustrations */}
            <div className="inline-flex items-center gap-5 select-none" aria-hidden="true">
              <PotIllustration size={56} className="text-primary hero-float" style={{ animationDelay: "0s" }} />
              <CarrotIllustration size={48} className="text-accent-foreground hero-float" style={{ animationDelay: "0.4s" }} />
              <PanIllustration size={52} className="text-secondary hero-float" style={{ animationDelay: "0.8s" }} />
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-foreground">Veckans</span>
              <br />
              <span className="hero-text-gradient">MatFynd</span>
            </h1>

            <div className="hero-strip max-w-xs mx-auto md:mx-0" aria-hidden="true" />

            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0 leading-relaxed">
              Berätta vad du är sugen på – få recept som passar plånboken.
              Vi hittar veckans bästa erbjudanden och skapar din meny&nbsp;automatiskt.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <button onClick={scrollToForm} className="btn-hero-primary">
                <ChefHatIllustration size={22} className="text-primary-foreground" />
                Skapa recept nu
              </button>
              <button onClick={scrollToForm} className="btn-hero-secondary">
                <ArrowDown className="w-4 h-4" />
                Se hur det funkar
              </button>
            </div>
          </div>

          {/* Right: feature bento grid – 2 cols on desktop */}
          <div className="md:col-span-2 hidden md:block">
            <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="bento-card bento-card-warm col-span-2">
                <ShoppingBagIllustration size={40} className="text-primary" />
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">Veckans erbjudanden</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Automatisk hämtning från ICA, Coop, Willys & fler</p>
                </div>
              </div>
              <div className="bento-card bento-card-mint">
                <MagicWandIllustration size={36} className="text-secondary" />
                <h3 className="font-display font-bold text-sm text-foreground">AI + riktiga recept</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Mix av webrecept och AI-genererade förslag</p>
              </div>
              <div className="bento-card bento-card-sunny">
                <CoinIllustration size={36} className="text-accent-foreground" />
                <h3 className="font-display font-bold text-sm text-foreground">Budgetanpassat</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ange din budget – vi anpassar recepten</p>
              </div>
              <div className="bento-card bento-card-peach col-span-2">
                <QuickTimeIllustration size={40} className="text-primary" />
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">Veckomeny på minuter</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Komplett veckoplanering med inköpslista</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature pills – mobile */}
      <section className="md:hidden relative z-10 container max-w-lg mx-auto px-5 pb-4" aria-label="Funktioner">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { icon: <ShoppingBagIllustration size={20} className="text-primary" />, label: "Erbjudanden" },
            { icon: <MagicWandIllustration size={20} className="text-secondary" />, label: "AI-recept" },
            { icon: <CoinIllustration size={20} className="text-accent-foreground" />, label: "Budget" },
            { icon: <QuickTimeIllustration size={20} className="text-primary" />, label: "Snabbt" },
          ].map((f, i) => (
            <div key={i} className="mobile-pill">
              {f.icon}
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Wavy divider */}
      <div className="relative z-10 -mb-1" aria-hidden="true">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0Z" fill="hsl(var(--card))" />
        </svg>
      </div>

      {/* Main form area */}
      <main id="recipe-form" className="relative z-10 bg-card">
        <div className="container max-w-6xl mx-auto px-5 py-10 md:py-14 lg:py-16">
          <div className="md:max-w-2xl md:mx-auto lg:max-w-3xl">
            <div className="form-card p-6 md:p-10 lg:p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="form-icon-badge">
                  <ChefHatIllustration size={24} className="text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Skapa ditt recept</h2>
                  <p className="text-sm text-muted-foreground">Välj dagar, budget och vad du är sugen på</p>
                </div>
              </div>
              <RecipeForm />
            </div>
          </div>
        </div>
      </main>

      {/* SEO content */}
      <section className="relative z-10 bg-card container max-w-5xl mx-auto px-5 pb-12" aria-label="Om VeckansMatFynd">
        <div className="space-y-8 text-sm font-body text-muted-foreground/70 leading-relaxed">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <h2 className="font-display text-lg font-bold hero-text-gradient whitespace-nowrap">
              Billiga recept som faktiskt smakar gott
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <ShoppingBagIllustration size={28} className="text-primary" />,
                title: "Spara pengar på maten",
                text: "VeckansMatFynd hjälper dig att planera veckans måltider baserat på aktuella erbjudanden från ICA, Coop, Willys, Hemköp och Lidl.",
              },
              {
                icon: <MagicWandIllustration size={28} className="text-secondary" />,
                title: "Riktiga recept & AI-genererade",
                text: "Vi blandar noggrant utvalda recept från populära svenska matsidor med AI-genererade recept anpassade efter din budget.",
              },
              {
                icon: <PotIllustration size={28} className="text-accent-foreground" />,
                title: "Perfekt för studenter & familjer",
                text: "Oavsett om du är student med tight budget eller en familj – VeckansMatFynd skapar recept anpassade efter din situation.",
              },
              {
                icon: <QuickTimeIllustration size={28} className="text-primary" />,
                title: "Veckomeny på minuter",
                text: "Välj vilka dagar du vill ha recept för, ange din budget och vilken mat du gillar. Klart på sekunder.",
              },
            ].map((item, i) => (
              <article key={i} className="seo-card">
                <div className="mb-2">{item.icon}</div>
                <h3 className="font-display text-sm font-bold text-foreground/70 mb-1">{item.title}</h3>
                <p className="text-xs leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-foreground/[0.03] border-t border-border">
        <div className="container max-w-5xl mx-auto px-5 py-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <PotIllustration size={20} className="text-primary opacity-50" />
            <CarrotIllustration size={18} className="text-accent-foreground opacity-40" />
            <PanIllustration size={20} className="text-secondary opacity-45" />
          </div>
          <p className="font-display text-sm font-bold text-foreground/60">
            Veckans<span className="hero-text-gradient">MatFynd</span> 2026
          </p>
          <p className="mt-1 text-xs text-muted-foreground/50 font-body">
            Billiga recept · Veckomeny · Budgetmat · Veckans erbjudanden
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
