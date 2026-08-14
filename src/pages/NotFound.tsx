import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Seo from "@/components/Seo";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: sidan finns inte:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Seo
        title="Sidan hittades inte – VeckansMatFynd"
        description="Sidan du letade efter finns inte."
        path={location.pathname}
        noindex
      />
      <div className="hero-mesh" aria-hidden="true" />
      <SiteHeader />

      <main className="flex-1 relative z-10 container max-w-lg mx-auto px-5 py-20">
        <div className="rounded-2xl border bg-card p-8 text-center space-y-4 shadow-md">
          <p className="text-5xl">🍳</p>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Sidan hittades inte
          </h1>
          <p className="font-body text-muted-foreground">
            Länken kan vara gammal eller felstavad. Men veckans matfynd finns
            kvar där de ska.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/">
              <Button className="font-display font-bold">Till startsidan</Button>
            </Link>
            <Link to="/billig-veckomatsedel">
              <Button variant="outline" className="font-display font-bold">
                Se veckomatsedeln
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default NotFound;

