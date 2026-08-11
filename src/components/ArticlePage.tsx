import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export interface ArticleSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface ArticleFaq {
  q: string;
  a: string;
}

interface ArticlePageProps {
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  intro: string;
  breadcrumbLabel: string;
  sections: ArticleSection[];
  faq: ArticleFaq[];
  updated: string;
  relatedLinks?: { to: string; label: string }[];
}

const ArticlePage = ({
  path,
  title,
  metaTitle,
  metaDescription,
  metaKeywords,
  intro,
  breadcrumbLabel,
  sections,
  faq,
  updated,
  relatedLinks,
}: ArticlePageProps) => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: metaDescription,
      inLanguage: "sv-SE",
      dateModified: updated,
      author: { "@type": "Organization", name: "VeckansMatFynd" },
      publisher: { "@type": "Organization", name: "VeckansMatFynd" },
      mainEntityOfPage: { "@type": "WebPage", "@id": path },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: "/" },
        { "@type": "ListItem", position: 2, name: breadcrumbLabel, item: path },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Seo title={metaTitle} description={metaDescription} path={path} keywords={metaKeywords} jsonLd={jsonLd} />
      <div className="hero-mesh" aria-hidden="true" />

      <nav className="relative z-10 container max-w-3xl mx-auto px-5 pt-5 flex items-center justify-between">
        <Link to="/" className="font-display text-lg font-bold tracking-tight">
          <span className="text-foreground">Veckans</span>
          <span className="hero-text-gradient">MatFynd</span>
        </Link>
        <Link to="/">
          <Button size="sm" className="font-display font-bold">Skapa recept</Button>
        </Link>
      </nav>

      <main className="relative z-10 flex-1 container max-w-3xl mx-auto px-5 py-10 md:py-14">
        <ol className="flex items-center gap-1 text-xs text-muted-foreground/70 font-body mb-5">
          <li><Link to="/" className="hover:text-primary">Start</Link></li>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <li className="text-foreground/70">{breadcrumbLabel}</li>
        </ol>

        <article className="space-y-8">
          <header className="space-y-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight tracking-tight">
              {title}
            </h1>
            <div className="hero-strip max-w-xs" aria-hidden="true" />
            <p className="font-body text-lg text-muted-foreground leading-relaxed">{intro}</p>
          </header>

          {sections.map((s) => (
            <section key={s.heading} className="space-y-3">
              <h2 className="font-display text-xl font-bold text-foreground">{s.heading}</h2>
              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                {s.body}
              </p>
              {s.bullets && (
                <ul className="space-y-2">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2 text-sm font-body text-muted-foreground leading-relaxed"
                    >
                      <span className="text-primary font-bold shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 text-center space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Få veckomenyn gratis varje vecka
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              5 recept · 4 portioner · under 500 kr · baserat på veckans erbjudanden.
            </p>
            <Link to="/">
              <Button size="lg" className="font-display font-bold">Anmäl dig gratis</Button>
            </Link>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground">Vanliga frågor</h2>
            <dl className="space-y-4">
              {faq.map((f) => (
                <div key={f.q} className="rounded-xl border bg-card p-4">
                  <dt className="font-display font-bold text-sm text-foreground">{f.q}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground font-body leading-relaxed">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {relatedLinks && relatedLinks.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-foreground">Läs mer</h2>
              <div className="flex flex-wrap gap-3">
                {relatedLinks.map((rl) => (
                  <Link
                    key={rl.to}
                    to={rl.to}
                    className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-display font-bold text-foreground/70 hover:border-primary/60 transition-colors"
                  >
                    {rl.label} →
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="text-xs text-muted-foreground/60 font-body">
            Uppdaterad {new Date(updated).toLocaleDateString("sv-SE", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default ArticlePage;