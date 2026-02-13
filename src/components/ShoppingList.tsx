import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Home } from "lucide-react";

interface ShoppingListProps {
  content: string;
}

const parseSection = (content: string, heading: string): string[] => {
  const regex = new RegExp(`##\\s*${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n##|$)`);
  const match = content.match(regex);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter((l) => l.length > 0);
};

const CheckableList = ({ items, label, icon }: { items: string[]; label: string; icon: React.ReactNode }) => {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
        {icon} {label}
        <span className="text-xs font-body font-normal text-muted-foreground ml-auto">
          {checked.size}/{items.length}
        </span>
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5 py-0.5">
            <Checkbox
              checked={checked.has(i)}
              onCheckedChange={() => toggle(i)}
              id={`item-${label}-${i}`}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor={`item-${label}-${i}`}
              className={`text-sm font-body cursor-pointer select-none transition-colors ${
                checked.has(i) ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {item}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ShoppingList = ({ content }: ShoppingListProps) => {
  const shoppingItems = useMemo(() => parseSection(content, "🛒 Inköpslista"), [content]);
  const homeItems = useMemo(() => parseSection(content, "🏠 Har du troligen hemma\\?"), [content]);

  if (shoppingItems.length === 0 && homeItems.length === 0) return null;

  return (
    <div className="animate-fade-in-up mt-4">
      <div className="card-warm p-5 md:p-7 space-y-5">
        <CheckableList
          items={shoppingItems}
          label="Inköpslista"
          icon={<ShoppingCart className="w-4 h-4 text-primary" />}
        />
        {homeItems.length > 0 && shoppingItems.length > 0 && (
          <div className="border-t border-border" />
        )}
        <CheckableList
          items={homeItems}
          label="Har du troligen hemma?"
          icon={<Home className="w-4 h-4 text-muted-foreground" />}
        />
      </div>
    </div>
  );
};

export default ShoppingList;
