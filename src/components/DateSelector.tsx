import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateSelectorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isToday: boolean;
}

export function DateSelector({ label, onPrev, onNext, onToday, isToday }: DateSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <button
        onClick={onPrev}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={onToday}
        className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
          isToday
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        {label}
      </button>
      <button
        onClick={onNext}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
