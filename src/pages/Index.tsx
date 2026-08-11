import RecipeForm from "@/components/RecipeForm";
import RecipeShowcase from "@/components/RecipeShowcase";
import Seo from "@/components/Seo";
import SiteFooter from "@/components/SiteFooter";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { BookOpen, LogIn, LogOut, Mail, CheckCircle, Utensils, Settings } from "lucide-react";
import { toast } from "sonner";
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
  const [nlEmail, setNlEmail] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlDone, setNlDone] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .then(({ data }) => {
          setIsAdmin(!!data && data.length > 0);
        });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const scrollToForm = () => {
    document.getElementById("recipe-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nlEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Ange en giltig e-postadress");
      return;
    }
    setNlLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers" as any)
        .insert({ email: trimmed } as any);
      if (error) {
        if (error.code === "23505") {
          toast.info("Du prenumererar redan! 🎉");
          setNlDone(true);
        } else throw error;
      } else {
        setNlDone(true);
        toast.success("Välkommen! Du får ditt första veckobrev nästa måndag 🎉");
      }
    } catch (err) {
      toast.error("Något gick fel, försök igen");
    } finally {
      setNlLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Seo
        title="VeckansMatFynd – billig veckomatsedel & veckomeny under 500 kr"
        description="Gratis billig veckomatsedel varje vecka: 5 middagar för 4 personer under 500 kr. Billig mat baserad på erbjudanden i ICA, Coop, Willys, Hemköp och Lidl. Perfekt för barnfamiljer."
        path="/"
        keywords="billig veckomatsedel, veckomatsedel, billig mat, veckomeny, billiga recept, billig veckomatsedel barnfamilj, billig middag, veckomeny familj, billig mat recept, budgetrecept, veckans erbjudanden, matbudget"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "VeckansMatFynd",
            url: "https://www.veckansmatfynd.se",
            inLanguage: "sv-SE",
            description:
              "Billig veckomatsedel och billiga recept baserade på veckans erbjudanden i svenska matbutiker. Gratis veckomeny för barnfamiljer och studenter.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://www.veckansmatfynd.se/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "VeckansMatFynd",
            url: "https://www.veckansmatfynd.se",
            logo: "https://www.veckansmatfynd.se/favicon.ico",
            sameAs: [],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              availableLanguage: "Swedish",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Vad kostar VeckansMatFynd?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Tjänsten är helt gratis. Du får en billig veckomatsedel via e-post och kan avprenumerera med ett klick.",
                },
              },
              {
                "@type": "Question",
                name: "Hur mycket kostar veckans meny?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Vi bygger fem middagar för fyra personer för under 500 kronor totalt, baserat på veckans erbjudanden i ICA, Coop, Willys, Hemköp och Lidl.",
                },
              },
              {
                "@type": "Question",
                name: "Vilka butiker används?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Erbjudanden hämtas från ICA, Coop, Willys, Hemköp och Lidl – Sveriges största matbutikskedjor.",
                },
              },
              {
                "@type": "Question",
                name: "Fungerar det för barnfamiljer?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Ja! Vår billiga veckomatsedel är perfekt för barnfamiljer. Du kan ange 'barnvänligt' som preferens för att få recept som barn gillar.",
                },
              },
              {
                "@type": "Question",
                name: "Vad är en billig veckomatsedel?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "En billig veckomatsedel är en planerad meny för en hel veckas middagar, byggd för att hålla nere matkostnaderna genom att utgå från veckans erbjudanden och billiga basvaror.",
                },
              },
              {
                "@type": "Question",
                name: "Kan jag anpassa min veckomatsedel?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Ja. Välj antal dagar, budget, preferenser som vegetariskt, barnvänligt eller glutenfritt – och du får en anpassad billig veckomatsedel på sekunder.",
                },
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "Så skapar du en billig veckomatsedel",
            description: "Skapa en billig veckomatsedel med VeckansMatFynd på under en minut.",
            step: [
              {
                "@type": "HowToStep",
                name: "Välj dagar och budget",
                text: "Ange vilka dagar du vill ha recept för och din veckobudget för mat.",
              },
              {
                "@type": "HowToStep",
                name: "Ange preferenser",
                text: "Välj matpreferenser som barnvänligt, vegetariskt, snabbt eller specifika ingredienser.",
              },
              {
                "@type": "HowToStep",
                name: "Få din veckomatsedel",
                text: "Få en komplett billig veckomatsedel med recept och inköpslista baserad på veckans erbjudanden.",
              },
            ],
          },
        ]}
      />
      {/* Animated gradient mesh background */}
      <div className="hero-mesh" aria-hidden="true" />

      {/* Nav */}
      <nav className="relative z-10 container max-w-6xl mx-auto px-4 pt-4 md:px-5 md:pt-5 flex items-center justify-between gap-2">
        <span className="font-display text-xl font-bold tracking-tight">
          <span className="text-foreground">Veckans</span>
          <span className="hero-text-gradient">MatFynd</span>
        </span>
        <div className="flex gap-0.5 md:gap-1 shrink-0">
          <Link to="/veckomeny" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="font-display text-sm text-muted-foreground hover:text-foreground">
              Veckomeny
            </Button>
          </Link>
          <Link to="/billig-veckomatsedel" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="font-display text-sm text-muted-foreground hover:text-foreground">
              Veckomatsedel
            </Button>
          </Link>
          <Link to="/billiga-recept" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="font-display text-sm text-muted-foreground hover:text-foreground">
              Billiga recept
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/saved">
                <Button variant="ghost" size="sm" className="font-display text-sm gap-1.5 text-muted-foreground hover:text-foreground">
                  <BookOpen className="w-4 h-4" /> Mina recept
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="font-display text-sm gap-1.5 text-muted-foreground hover:text-foreground">
                    <Settings className="w-4 h-4" /> Admin
                  </Button>
                </Link>
              )}
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

            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 text-secondary-foreground px-3 py-1 text-xs font-body font-semibold">
              🇸🇪 Veckans erbjudanden · ICA · Coop · Willys · Hemköp · Lidl
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              <span className="text-foreground">Fem middagar.</span>
              <br />
              <span className="hero-text-gradient">Under 500 kronor.</span>
            </h1>

            <div className="hero-strip max-w-xs mx-auto md:mx-0" aria-hidden="true" />

            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0 leading-relaxed">
              VeckansMatFynd läser veckans erbjudanden i svenska matbutiker och bygger
              en balanserad veckomeny för fyra personer – med inköpslista. Skickas
              gratis till din e-post varje vecka.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <button onClick={scrollToForm} className="btn-hero-primary">
                <ChefHatIllustration size={22} className="text-primary-foreground" />
                Skapa recept nu
              </button>
              {user ? (
                <Link to="/saved" className="btn-hero-secondary">
                  <BookOpen className="w-4 h-4" />
                  Mina sparade recept
                </Link>
              ) : (
                <Link to="/auth" className="btn-hero-secondary">
                  <LogIn className="w-4 h-4" />
                  Logga in för att spara
                </Link>
              )}
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

      {/* ══ Recipe Showcase ══ */}
      <RecipeShowcase />

      {/* ═══════════════════════════════════════════ */}
      {/* 📬 NEWSLETTER SIGNUP – prominent placement */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 container max-w-2xl mx-auto px-5 pb-6">
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 md:p-6 shadow-md">
          {nlDone ? (
            <div className="text-center py-4 space-y-2 animate-fade-in-up">
              <CheckCircle className="w-10 h-10 text-primary mx-auto" />
              <p className="font-display font-bold text-foreground">Du är med! 🎉</p>
              <p className="text-sm text-muted-foreground">Varje måndag får du 5 budgetrecept baserade på veckans erbjudanden.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-base md:text-lg font-bold text-foreground">
                    📬 Gratis veckomeny – varje måndag
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    5 recept · 4 portioner · under 500 kr · protein, grönsaker & kolhydrater
                  </p>
                </div>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="din@epost.se"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  required
                  className="flex-1"
                  disabled={nlLoading}
                />
                <Button type="submit" disabled={nlLoading} size="lg" className="shrink-0 font-display font-bold">
                  {nlLoading ? "Skickar..." : "Prenumerera gratis"}
                </Button>
              </form>
              <p className="text-[11px] text-muted-foreground/60 text-center">
                Ingen spam – bara recept baserade på veckans erbjudanden. Avsluta när du vill.
              </p>
            </div>
          )}
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
              Billig veckomatsedel & recept som smakar gott
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <ShoppingBagIllustration size={28} className="text-primary" />,
                title: "Billig veckomatsedel varje vecka",
                text: "Få en komplett billig veckomatsedel baserad på veckans erbjudanden från ICA, Coop, Willys, Hemköp och Lidl. Perfekt för barnfamiljer som vill spara på maten.",
              },
              {
                icon: <MagicWandIllustration size={28} className="text-secondary" />,
                title: "Billiga recept & AI-genererade",
                text: "Billiga recept från populära svenska matsidor kombinerade med AI-genererade förslag. Alltid under 20 kr per portion, alltid goda.",
              },
              {
                icon: <PotIllustration size={28} className="text-accent-foreground" />,
                title: "Billig mat för alla",
                text: "Oavsett om du är student med tight budget eller en barnfamilj – vi skapar billig mat anpassad efter din situation och plånbok.",
              },
              {
                icon: <QuickTimeIllustration size={28} className="text-primary" />,
                title: "Veckomeny på minuter",
                text: "Välj dagar, budget och matpreferenser. Få en komplett veckomeny med inköpslista och billiga recept på sekunder.",
              },
            ].map((item, i) => (
              <article key={i} className="seo-card">
                <div className="mb-2">{item.icon}</div>
                <h3 className="font-display text-sm font-bold text-foreground/70 mb-1">{item.title}</h3>
                <p className="text-xs leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>

          {/* Extra SEO text block */}
          <div className="max-w-3xl mx-auto space-y-4 text-xs text-muted-foreground/60">
            <h3 className="font-display text-sm font-bold text-foreground/60">Billig veckomatsedel för barnfamilj</h3>
            <p>
              En billig veckomatsedel sparar barnfamiljer tusenlappar varje månad. Istället för att handla planlöst och dyrt
              bygger VeckansMatFynd din veckomatsedel runt veckans lägsta priser. Fem middagar, fyra portioner, under 500 kronor –
              med inköpslista. Billig mat behöver inte vara tråkig: vi varierar mellan kött, kyckling, fisk och vegetariskt
              så att hela familjen äter gott varje dag.
            </p>
            <h3 className="font-display text-sm font-bold text-foreground/60">Billig mat med veckans erbjudanden</h3>
            <p>
              Hemligheten bakom riktigt billig mat är att handla efter vad som är billigt – inte efter en önskelista.
              VeckansMatFynd läser automatiskt veckans erbjudanden och bygger billiga recept runt de råvarorna.
              Resultatet: en veckomeny som kostar en bråkdel av vad planlös mathandling kostar.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/billig-veckomatsedel" className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-display font-bold text-foreground/70 hover:border-primary/60 transition-colors">
              Billig veckomatsedel →
            </Link>
            <Link to="/veckomeny" className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-display font-bold text-foreground/70 hover:border-primary/60 transition-colors">
              Veckomeny under 500 kr →
            </Link>
            <Link to="/billiga-recept" className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-display font-bold text-foreground/70 hover:border-primary/60 transition-colors">
              Billiga recept per portion →
            </Link>
            <Link to="/billig-mat" className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-display font-bold text-foreground/70 hover:border-primary/60 transition-colors">
              Billig mat – guide →
            </Link>
            <Link to="/matlada-budget" className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-display font-bold text-foreground/70 hover:border-primary/60 transition-colors">
              Matlådor på budget →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
