import { Link } from "react-router-dom";
import {
  PotIllustration,
  CarrotIllustration,
  PanIllustration,
} from "@/components/illustrations/FoodIllustrations";

const SiteFooter = () => (
  <footer className="relative z-10 bg-foreground/[0.03] border-t border-border">
    <div className="container max-w-5xl mx-auto px-5 py-10">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <PotIllustration size={20} className="text-primary opacity-60" />
            <CarrotIllustration size={18} className="text-accent-foreground opacity-50" />
            <PanIllustration size={20} className="text-secondary opacity-55" />
          </div>
          <p className="font-display text-sm font-bold text-foreground/70">
            Veckans<span className="hero-text-gradient">MatFynd</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60 font-body max-w-xs">
            Veckomeny för 4 personer under 500 kr – byggd på veckans erbjudanden i
            svenska matbutiker.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-xs font-body text-muted-foreground/70 mx-auto md:mx-0">
          <Link to="/" className="hover:text-primary transition-colors">Start</Link>
          <Link to="/veckomeny" className="hover:text-primary transition-colors">Veckomeny</Link>
          <Link to="/billiga-recept" className="hover:text-primary transition-colors">Billiga recept</Link>
          <Link to="/matlada-budget" className="hover:text-primary transition-colors">Matlådor på budget</Link>
          <Link to="/saved" className="hover:text-primary transition-colors">Mina recept</Link>
          <Link to="/avprenumerera" className="hover:text-primary transition-colors">Avprenumerera</Link>
        </nav>
      </div>

      <p className="mt-8 pt-5 border-t border-border text-center text-[11px] text-muted-foreground/50 font-body">
        © {new Date().getFullYear()} VeckansMatFynd · Billiga recept · Veckomeny · Budgetmat
      </p>
    </div>
  </footer>
);

export default SiteFooter;