const DAYS = [
  { value: "monday", label: "Mån" },
  { value: "tuesday", label: "Tis" },
  { value: "wednesday", label: "Ons" },
  { value: "thursday", label: "Tor" },
  { value: "friday", label: "Fre" },
  { value: "saturday", label: "Lör" },
  { value: "sunday", label: "Sön" },
];

interface DaySelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

const DaySelector = ({ selected, onChange }: DaySelectorProps) => {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const selectAll = () => {
    onChange(selected.length === DAYS.length ? [] : DAYS.map((d) => d.value));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {DAYS.map((d) => {
          const active = selected.includes(d.value);
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => toggle(d.value)}
              className={`flex-1 py-2 rounded-xl text-xs font-display font-bold transition-all duration-200 border-2 ${
                active
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/20"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={selectAll}
        className="text-xs font-display font-semibold text-primary/70 hover:text-primary transition-colors"
      >
        {selected.length === DAYS.length ? "Avmarkera alla" : "Välj hela veckan"}
      </button>
    </div>
  );
};

export default DaySelector;
