import { SVGProps } from "react";

type IllustrationProps = SVGProps<SVGSVGElement> & { size?: number };

const defaults = (size = 32) => ({
  width: size,
  height: size,
  viewBox: "0 0 48 48",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
});

/** A steaming pot with a ladle */
export const PotIllustration = ({ size = 32, className, ...props }: IllustrationProps) => (
  <svg {...defaults(size)} className={className} {...props}>
    {/* Steam */}
    <path d="M16 12C16 8 18 6 18 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5">
      <animate attributeName="d" values="M16 12C16 8 18 6 18 4;M16 12C14 8 16 6 16 4;M16 12C16 8 18 6 18 4" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M24 10C24 6 26 4 26 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4">
      <animate attributeName="d" values="M24 10C24 6 26 4 26 2;M24 10C22 6 24 4 24 2;M24 10C24 6 26 4 26 2" dur="2.5s" repeatCount="indefinite" />
    </path>
    <path d="M32 12C32 8 34 6 34 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3">
      <animate attributeName="d" values="M32 12C32 8 34 6 34 4;M32 10C30 6 32 4 32 2;M32 12C32 8 34 6 34 4" dur="3s" repeatCount="indefinite" />
    </path>
    {/* Pot body */}
    <rect x="8" y="16" width="32" height="22" rx="4" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />
    {/* Lid rim */}
    <path d="M6 16H42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Handles */}
    <path d="M8 26H4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M40 26H44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Lid knob */}
    <circle cx="24" cy="14" r="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/** A carrot with leaves */
export const CarrotIllustration = ({ size = 32, className, ...props }: IllustrationProps) => (
  <svg {...defaults(size)} className={className} {...props}>
    {/* Leaves */}
    <path d="M24 8C20 4 16 6 18 10" stroke="hsl(140, 50%, 40%)" strokeWidth="2" strokeLinecap="round" fill="hsl(140, 50%, 40%)" fillOpacity="0.2" />
    <path d="M24 8C28 4 32 6 30 10" stroke="hsl(140, 50%, 40%)" strokeWidth="2" strokeLinecap="round" fill="hsl(140, 50%, 40%)" fillOpacity="0.2" />
    <path d="M24 6V12" stroke="hsl(140, 50%, 40%)" strokeWidth="2" strokeLinecap="round" />
    {/* Carrot body */}
    <path d="M18 12C18 12 16 28 24 44C32 28 30 12 30 12Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Lines on carrot */}
    <path d="M20 20H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M21 26H27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <path d="M22 32H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
  </svg>
);

/** A pan with handle */
export const PanIllustration = ({ size = 32, className, ...props }: IllustrationProps) => (
  <svg {...defaults(size)} className={className} {...props}>
    {/* Pan body */}
    <ellipse cx="22" cy="28" rx="16" ry="10" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.08" />
    {/* Handle */}
    <path d="M38 28H46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* Food dots */}
    <circle cx="16" cy="26" r="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
    <circle cx="24" cy="24" r="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
    <circle cx="20" cy="30" r="1.5" fill="currentColor" fillOpacity="0.25" />
    <circle cx="28" cy="28" r="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
    {/* Steam wisps */}
    <path d="M18 18C18 14 20 13 20 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25">
      <animate attributeName="opacity" values="0.25;0.1;0.25" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M26 16C26 12 28 11 28 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2">
      <animate attributeName="opacity" values="0.2;0.08;0.2" dur="2.8s" repeatCount="indefinite" />
    </path>
  </svg>
);

/** Shopping bag with items peeking out */
export const ShoppingBagIllustration = ({ size = 32, className, ...props }: IllustrationProps) => (
  <svg {...defaults(size)} className={className} {...props}>
    {/* Bag body */}
    <path d="M10 18L8 42C8 44 10 46 12 46H36C38 46 40 44 40 42L38 18Z" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.08" strokeLinejoin="round" />
    {/* Handles */}
    <path d="M16 18C16 10 20 6 24 6C28 6 32 10 32 18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Baguette sticking out */}
    <rect x="20" y="8" width="4" height="14" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" transform="rotate(-8 22 15)" />
    {/* Leaf sticking out */}
    <path d="M30 14C33 10 36 12 34 16" stroke="hsl(140, 50%, 40%)" strokeWidth="2" strokeLinecap="round" fill="hsl(140, 50%, 40%)" fillOpacity="0.2" />
  </svg>
);

/** A sparkle/magic wand for AI */
export const MagicWandIllustration = ({ size = 32, className, ...props }: IllustrationProps) => (
  <svg {...defaults(size)} className={className} {...props}>
    {/* Wand */}
    <path d="M8 40L32 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Wand tip */}
    <path d="M32 16L36 12L40 16L36 20Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {/* Sparkles */}
    <circle cx="38" cy="8" r="1.5" fill="currentColor" fillOpacity="0.6">
      <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="44" cy="14" r="1" fill="currentColor" fillOpacity="0.4">
      <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="42" cy="6" r="0.8" fill="currentColor" fillOpacity="0.3">
      <animate attributeName="r" values="0.8;1.5;0.8" dur="1.8s" repeatCount="indefinite" />
    </circle>
    {/* Star sparkle */}
    <path d="M30 6L31 9L34 10L31 11L30 14L29 11L26 10L29 9Z" fill="currentColor" fillOpacity="0.5">
      <animate attributeName="fillOpacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
    </path>
  </svg>
);

/** Coins / budget illustration */
export const CoinIllustration = ({ size = 32, className, ...props }: IllustrationProps) => (
  <svg {...defaults(size)} className={className} {...props}>
    {/* Back coin */}
    <ellipse cx="28" cy="30" rx="12" ry="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.06" />
    <ellipse cx="28" cy="26" rx="12" ry="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
    {/* Front coin */}
    <ellipse cx="20" cy="24" rx="14" ry="9" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.08" />
    <ellipse cx="20" cy="20" rx="14" ry="9" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.12" />
    {/* kr symbol */}
    <text x="15" y="24" fontSize="10" fontWeight="bold" fill="currentColor" fillOpacity="0.4" fontFamily="Fredoka, sans-serif">kr</text>
    {/* Down arrow */}
    <path d="M38 10L38 18M34 14L38 18L42 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
  </svg>
);

/** Clock with food illustration */
export const QuickTimeIllustration = ({ size = 32, className, ...props }: IllustrationProps) => (
  <svg {...defaults(size)} className={className} {...props}>
    {/* Clock face */}
    <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.06" />
    {/* Clock hands */}
    <path d="M24 14V24L30 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Tick marks */}
    <path d="M24 10V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <path d="M34 24H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <path d="M24 36V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <path d="M12 24H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    {/* Speed lines */}
    <path d="M42 16L46 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <path d="M43 22L47 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
    <path d="M42 28L46 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
  </svg>
);

/** Chef hat illustration */
export const ChefHatIllustration = ({ size = 32, className, ...props }: IllustrationProps) => (
  <svg {...defaults(size)} className={className} {...props}>
    {/* Hat puff */}
    <path d="M12 20C8 20 6 16 8 12C10 8 14 6 18 8C20 4 28 4 30 8C34 6 38 8 40 12C42 16 40 20 36 20Z" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" strokeLinejoin="round" />
    {/* Hat band */}
    <rect x="12" y="20" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.06" />
    {/* Band stripe */}
    <path d="M14 28H34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <path d="M14 32H34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
  </svg>
);
