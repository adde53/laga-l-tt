import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ShoppingListProps {
  content: string;
}

interface ShoppingItem {
  text: string;
  price: number | null;
  isCustom?: boolean;
}

const parsePrice = (text: string): number | null => {
  // Match patterns like "15 kr", "~20kr", "ca 30 kr", "(25 kr)"
  const match = text.match(/(?:ca\.?\s*|~)?(\d+(?:[,.]\d+)?)\s*kr/i);
  return match ? parseFloat(match[1].replace(",", ".")) : null;
};

const parseShoppingItems = (content: string): ShoppingItem[] => {
  const regex = /##\s*🛒 Inköpslista[^\n]*\n([\s\S]*?)(?=\n##|$)/;
  const match = content.match(regex);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter((l) => l.length > 0)
    .map((text) => ({ text, price: parsePrice(text) }));
};

const ShoppingList = ({ content }: ShoppingListProps) => {
  const initialItems = useMemo(() => parseShoppingItems(content), [content]);
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [newItem, setNewItem] = useState("");

  // Sync when content changes
  useMemo(() => {
    setItems(initialItems);
    setRemoved(new Set());
    setChecked(new Set());
  }, [initialItems]);

  if (items.length === 0) return null;

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const removeItem = (i: number) => {
    setRemoved((prev) => new Set(prev).add(i));
  };

  const addCustomItem = () => {
    if (!newItem.trim()) return;
    setItems((prev) => [...prev, { text: newItem.trim(), price: parsePrice(newItem.trim()), isCustom: true }]);
    setNewItem("");
  };

  const activeItems = items.filter((_, i) => !removed.has(i));
  const activeIndices = items.map((_, i) => i).filter((i) => !removed.has(i));

  const totalEstimate = activeItems.reduce((sum, item, idx) => {
    if (checked.has(activeIndices[idx])) return sum; // already bought, don't count
    return sum + (item.price || 0);
  }, 0);

  const checkedTotal = activeItems.reduce((sum, item, idx) => {
    if (!checked.has(activeIndices[idx])) return sum;
    return sum + (item.price || 0);
  }, 0);

  return (
    <div className="animate-fade-in-up mt-4">
      <div className="card-warm p-5 md:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Handlingslista
          </h3>
          <span className="font-display text-sm font-semibold text-muted-foreground">
            {checked.size}/{activeItems.length} ✓
          </span>
        </div>

        <ul className="space-y-1">
          {items.map((item, i) => {
            if (removed.has(i)) return null;
            const isChecked = checked.has(i);
            return (
              <li key={i} className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-200 group ${
                isChecked ? "bg-secondary/8" : "hover:bg-muted/50"
              }`}>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggle(i)}
                  id={`shop-${i}`}
                  className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                />
                <label
                  htmlFor={`shop-${i}`}
                  className={`flex-1 text-sm font-body cursor-pointer select-none transition-all duration-200 ${
                    isChecked ? "line-through text-muted-foreground opacity-60" : "text-foreground"
                  }`}
                >
                  {item.text}
                </label>
                {item.price && (
                  <span className={`text-xs font-display font-semibold whitespace-nowrap ${
                    isChecked ? "text-muted-foreground/50 line-through" : "text-primary"
                  }`}>
                    {item.price} kr
                  </span>
                )}
                <button
                  onClick={() => removeItem(i)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 transition-all"
                  title="Ta bort"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Add custom item */}
        <div className="flex gap-2 pt-1">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
            placeholder="Lägg till vara, t.ex. Mjölk 20 kr"
            className="input-field h-10 text-sm flex-1"
          />
          <button
            onClick={addCustomItem}
            disabled={!newItem.trim()}
            className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {checked.size === activeItems.length && activeItems.length > 0 && (
          <div className="text-center pt-2 font-display font-bold text-secondary">
            🎉 Allt avprickat!
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
