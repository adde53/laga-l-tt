/** Tunn wrapper runt Google Analytics (gtag) – tystnar om GA inte är laddat. */
type Params = Record<string, string | number | boolean | undefined>;

export function track(event: string, params: Params = {}): void {
  try {
    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof gtag === "function") gtag("event", event, params);
  } catch {
    /* mätning får aldrig fälla appen */
  }
}

export const trackViewOffer = (chain: string, name: string) =>
  track("view_offer", { chain, offer: name });
export const trackClickCreateMenu = (from: string) => track("click_create_menu", { from });
export const trackMenuCreated = (days: number, budget?: number) =>
  track("menu_created", { days, budget });
export const trackViewRecipe = (title: string) => track("view_recipe", { title });
export const trackAddToShoppingList = () => track("add_to_shopping_list");
export const trackNewsletterSignup = (source: string) =>
  track("newsletter_signup", { source });
