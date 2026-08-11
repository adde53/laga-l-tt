import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import SiteFooter from "@/components/SiteFooter";
import { Loader2, MailX, CheckCircle, AlertCircle } from "lucide-react";

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/newsletter-unsubscribe`;

type State = "loading" | "confirm" | "done" | "already" | "invalid";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>(token ? "loading" : "invalid");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${FUNCTIONS_URL}?token=${encodeURIComponent(token)}`);
        const body = await res.json();
        if (!res.ok) return setState("invalid");
        setEmail(body.email ?? "");
        setState(body.status === "active" ? "confirm" : "already");
      } catch {
        setState("invalid");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await fetch(FUNCTIONS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setState(res.ok ? "done" : "invalid");
    } catch {
      setState("invalid");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Avprenumerera – VeckansMatFynd"
        description="Avsluta din prenumeration på VeckansMatFynds veckomeny."
        path="/avprenumerera"
        noindex
      />
      <div className="hero-mesh" aria-hidden="true" />

      <main className="flex-1 relative z-10 container max-w-lg mx-auto px-5 py-20">
        <div className="rounded-2xl border bg-card p-8 text-center space-y-4 shadow-md">
          {state === "loading" && (
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          )}

          {state === "confirm" && (
            <>
              <MailX className="w-12 h-12 text-primary mx-auto" />
              <h1 className="font-display text-2xl font-bold">Vill du avsluta veckomenyn?</h1>
              <p className="text-sm text-muted-foreground">
                {email ? `${email} ` : ""}får inga fler veckobrev från oss om du bekräftar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button onClick={confirm} disabled={busy}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Ja, avprenumerera
                </Button>
                <Link to="/">
                  <Button variant="outline" className="w-full sm:w-auto">Nej, behåll den</Button>
                </Link>
              </div>
            </>
          )}

          {state === "done" && (
            <>
              <CheckCircle className="w-12 h-12 text-secondary mx-auto" />
              <h1 className="font-display text-2xl font-bold">Du är avprenumererad</h1>
              <p className="text-sm text-muted-foreground">
                Tack för att du var med! Du kan alltid anmäla dig igen på startsidan.
              </p>
              <Link to="/"><Button variant="outline">Till startsidan</Button></Link>
            </>
          )}

          {state === "already" && (
            <>
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <h1 className="font-display text-2xl font-bold">Redan avprenumererad</h1>
              <p className="text-sm text-muted-foreground">Du får inga veckobrev från oss.</p>
              <Link to="/"><Button variant="outline">Till startsidan</Button></Link>
            </>
          )}

          {state === "invalid" && (
            <>
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h1 className="font-display text-2xl font-bold">Länken fungerar inte</h1>
              <p className="text-sm text-muted-foreground">
                Länken är ogiltig eller har gått ut. Använd länken längst ner i ditt senaste
                veckobrev.
              </p>
              <Link to="/"><Button variant="outline">Till startsidan</Button></Link>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Unsubscribe;