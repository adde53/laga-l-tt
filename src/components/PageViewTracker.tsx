import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/analytics";

const VISIT_KEY = "vmfLastVisit";

/**
 * Skickar page_view vid varje navigering (SPA-navigering ger inget eget
 * page_view i GA) och return_visit första gången en återkommande besökare
 * kommer tillbaka under sessionen.
 */
const PageViewTracker = () => {
  const { pathname, search } = useLocation();
  const returnLogged = useRef(false);

  useEffect(() => {
    track("page_view", { page_path: `${pathname}${search}` });
  }, [pathname, search]);

  useEffect(() => {
    if (returnLogged.current) return;
    returnLogged.current = true;
    try {
      const last = localStorage.getItem(VISIT_KEY);
      const now = Date.now();
      if (last && now - Number(last) > 30 * 60 * 1000) {
        track("return_visit", { days_since: Math.round((now - Number(last)) / 86400000) });
      }
      localStorage.setItem(VISIT_KEY, String(now));
    } catch {
      /* mätning får aldrig fälla appen */
    }
  }, []);

  return null;
};

export default PageViewTracker;
