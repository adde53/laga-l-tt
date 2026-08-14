import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, LogIn, LogOut, Settings } from "lucide-react";

/** Flikarna som ska ligga på samma plats oavsett vilken sida man är på. */
const NAV_TABS = [
  { to: "/veckomeny", label: "Veckomeny" },
  { to: "/billig-veckomatsedel", label: "Veckomatsedel" },
  { to: "/billiga-recept", label: "Billiga recept" },
];

/**
 * Sidhuvudet – identiskt på alla sidor.
 *
 * Tidigare hade varje sida sin egen topp med olika containerbredd, logotyp och
 * navigering, vilket gjorde att hela huvudet hoppade när man bytte sida.
 * Bredden är därför låst till max-w-6xl här även om innehållet under är
 * smalare.
 */
const SiteHeader = () => {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(!!data && data.length > 0);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isHome = pathname === "/";

  // Länken ser likadan ut överallt så att sidhuvudet inte ändrar form mellan
  // sidor. På startsidan finns formuläret redan – då scrollar vi dit istället
  // för att ladda om samma sida.
  const handleCreateRecipe = (e: React.MouseEvent) => {
    if (!isHome) return;
    const form = document.getElementById("recipe-form");
    if (!form) return;
    e.preventDefault();
    form.scrollIntoView({ behavior: "smooth" });
  };

  const linkClass =
    "font-display text-sm text-muted-foreground hover:text-foreground";

  return (
    <nav className="relative z-10 container max-w-6xl mx-auto px-4 pt-4 md:px-5 md:pt-5 flex items-center justify-between gap-2">
      <Link to="/" className="font-display text-xl font-bold tracking-tight shrink-0">
        <span className="text-foreground">Veckans</span>
        <span className="hero-text-gradient">MatFynd</span>
      </Link>

      <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
        {NAV_TABS.map((tab) => (
          <Link key={tab.to} to={tab.to} className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className={linkClass}
              aria-current={pathname === tab.to ? "page" : undefined}
            >
              {tab.label}
            </Button>
          </Link>
        ))}

        {user ? (
          <>
            <Link to="/saved">
              <Button variant="ghost" size="sm" className={`${linkClass} gap-1.5`}>
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Mina recept</span>
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className={`${linkClass} gap-1.5`}>
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={`${linkClass} gap-1.5`}
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logga ut</span>
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="ghost" size="sm" className={`${linkClass} gap-1.5`}>
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Logga in</span>
            </Button>
          </Link>
        )}

        <Link to="/" onClick={handleCreateRecipe}>
          <Button size="sm" className="font-display font-bold">
            Skapa recept
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default SiteHeader;



