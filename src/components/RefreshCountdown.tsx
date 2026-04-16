import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

const INTERVAL = 30;

export function RefreshCountdown({ onRefresh, hasLive }: { onRefresh: () => void; hasLive: boolean }) {
  const [countdown, setCountdown] = useState(INTERVAL);

  useEffect(() => {
    if (!hasLive) return;
    setCountdown(INTERVAL);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onRefresh();
          return INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasLive, onRefresh]);

  if (!hasLive) return null;

  const progress = ((INTERVAL - countdown) / INTERVAL) * 100;

  return (
    <button
      onClick={() => { onRefresh(); setCountdown(INTERVAL); }}
      className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
    >
      <div className="relative h-4 w-4">
        <svg className="h-4 w-4 -rotate-90" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
          <circle
            cx="10" cy="10" r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${progress * 0.503} 50.3`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
      </div>
      <span>{countdown}s</span>
      <RefreshCw className="h-3 w-3" />
    </button>
  );
}
