import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrollar till toppen när man byter sida.
 *
 * React Router behåller scrollpositionen vid navigering, vilket gör att man
 * landar mitt i nästa sida om man klickade på en länk längre ned – det ser ut
 * som att sidan renderats fel.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // jsdom och äldre webbläsare saknar scrollTo – låt det tyst passera.
    if (typeof window.scrollTo !== "function") return;

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;


