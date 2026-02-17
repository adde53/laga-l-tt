import { useState } from "react";

const CUISINES = [
  { value: "husmanskost", label: "Husmanskost", emoji: "🇸🇪" },
  { value: "italian", label: "Italienskt", emoji: "🇮🇹" },
  { value: "asian", label: "Asiatiskt", emoji: "🍜" },
  { value: "mexican", label: "Mexikanskt", emoji: "🌮" },
  { value: "indian", label: "Indiskt", emoji: "🍛" },
  { value: "mediterranean", label: "Medelhavet", emoji: "🫒" },
  { value: "american", label: "Amerikanskt", emoji: "🍔" },
  { value: "thai", label: "Thailändskt", emoji: "🥘" },
  { value: "middle-eastern", label: "Mellanöstern", emoji: "🧆" },
];

interface CuisineSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

const CuisineSelector = ({ selected, onChange }: CuisineSelectorProps) => {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CUISINES.map((c) => {
        const active = selected.includes(c.value);
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => toggle(c.value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-display font-semibold transition-all duration-200 border-2 ${
              active
                ? "bg-primary/15 border-primary/40 text-primary scale-105"
                : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        );
      })}
    </div>
  );
};

export default CuisineSelector;
