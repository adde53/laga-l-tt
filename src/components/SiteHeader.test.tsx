/**
 * Sidhuvudet ska se likadant ut på alla sidor.
 *
 * Tidigare hade varje sida sin egen topp – olika containerbredd, olika stor
 * logotyp och olika navigering – så hela huvudet hoppade när man klickade på en
 * flik. Testet renderar sidorna och jämför navigeringens markup.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";

// Supabase ska inte anropas i testet.
vi.mock("@/integrations/supabase/client", () => {
  // En kedja där varje metod returnerar sig själv och som går att await:a.
  const chain: Record<string, unknown> = {};
  for (const method of [
    "select", "eq", "neq", "order", "limit", "insert", "update", "delete",
    "upsert", "gte", "lte", "in", "is", "range", "filter", "match",
  ]) {
    chain[method] = () => chain;
  }
  chain.single = () => Promise.resolve({ data: null, error: null });
  chain.maybeSingle = () => Promise.resolve({ data: null, error: null });
  chain.then = (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
    Promise.resolve(resolve({ data: [], error: null }));

  return {
    supabase: {
      from: () => chain,
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      functions: { invoke: () => Promise.resolve({ data: null, error: null }) },
    },
  };
});

import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Veckomeny from "@/pages/Veckomeny";
import BilligaRecept from "@/pages/BilligaRecept";
import BilligVeckomatsedel from "@/pages/BilligVeckomatsedel";
import BilligMat from "@/pages/BilligMat";
import MatladaBudget from "@/pages/MatladaBudget";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const renderPage = (ui: ReactElement, route: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
};

const PAGES: Array<{ name: string; route: string; element: ReactElement }> = [
  { name: "Startsidan", route: "/", element: <Index /> },
  { name: "Veckomeny", route: "/veckomeny", element: <Veckomeny /> },
  { name: "Billiga recept", route: "/billiga-recept", element: <BilligaRecept /> },
  { name: "Veckomatsedel", route: "/billig-veckomatsedel", element: <BilligVeckomatsedel /> },
  { name: "Billig mat", route: "/billig-mat", element: <BilligMat /> },
  { name: "Matlåda budget", route: "/matlada-budget", element: <MatladaBudget /> },
  { name: "Logga in", route: "/auth", element: <Auth /> },
  { name: "404", route: "/finns-inte", element: <NotFound /> },
];

/** Plockar ut sidhuvudet och normaliserar bort det som får skilja sig. */
function headerMarkup(container: HTMLElement): string {
  const nav = container.querySelector("nav");
  if (!nav) throw new Error("Sidan saknar sidhuvud");
  return nav.outerHTML
    // aria-current sätts på den flik man står på och ska få skilja sig.
    .replace(/\s*aria-current="page"/g, "");
}

describe("Sidhuvudet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finns på alla sidor", () => {
    for (const page of PAGES) {
      const { container, unmount } = renderPage(page.element, page.route);
      expect(container.querySelector("nav"), `${page.name} saknar sidhuvud`).toBeTruthy();
      unmount();
    }
  });

  it("är identiskt på alla sidor", () => {
    const [first, ...rest] = PAGES;

    const { container: firstContainer, unmount: unmountFirst } = renderPage(
      first.element,
      first.route,
    );
    const expected = headerMarkup(firstContainer);
    unmountFirst();

    for (const page of rest) {
      const { container, unmount } = renderPage(page.element, page.route);
      expect(
        headerMarkup(container),
        `Sidhuvudet på "${page.name}" skiljer sig från "${first.name}"`,
      ).toBe(expected);
      unmount();
    }
  });

  it("har samma containerbredd överallt, så logotypen inte hoppar", () => {
    for (const page of PAGES) {
      const { container, unmount } = renderPage(page.element, page.route);
      const nav = container.querySelector("nav")!;
      expect(nav.className, `${page.name} har fel bredd på sidhuvudet`).toContain("max-w-6xl");
      unmount();
    }
  });

  it("visar samma navigeringsflikar överallt", () => {
    for (const page of PAGES) {
      const { unmount } = renderPage(page.element, page.route);
      for (const label of ["Veckomeny", "Veckomatsedel", "Billiga recept"]) {
        expect(
          screen.getAllByText(label).length,
          `Fliken "${label}" saknas på ${page.name}`,
        ).toBeGreaterThan(0);
      }
      unmount();
    }
  });

  it("har en klickbar logotyp som leder hem", () => {
    for (const page of PAGES) {
      const { container, unmount } = renderPage(page.element, page.route);
      const logoLink = container.querySelector("nav a[href='/']");
      expect(logoLink, `${page.name} saknar klickbar logotyp`).toBeTruthy();
      expect(logoLink!.textContent).toContain("Veckans");
      expect(logoLink!.textContent).toContain("MatFynd");
      unmount();
    }
  });

  it("använder samma varumärkesnamn överallt", () => {
    for (const page of PAGES) {
      const { container, unmount } = renderPage(page.element, page.route);
      // "Matbudgeten" var ett gammalt namn som låg kvar på inloggningssidan.
      expect(container.textContent, `${page.name} använder ett gammalt namn`).not.toContain(
        "Matbudgeten",
      );
      unmount();
    }
  });
});


