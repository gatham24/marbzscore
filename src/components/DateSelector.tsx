import { ChevronLeft, ChevronRight } from "lucide-react";

const days = ["Yesterday", "Today", "Tomorrow"];

export function DateSelector() {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {days.map((day) => (
        <button
          key={day}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            day === "Today"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          {day}
        </button>
      ))}
      <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
