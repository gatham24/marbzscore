export function LiveIndicator({ size = "sm" }: { size?: "sm" | "md" }) {
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <div className="flex items-center gap-1">
      <span className={`${dotSize} rounded-full bg-live animate-live-pulse`} />
      {size === "md" && (
        <span className="text-xs font-bold uppercase tracking-wider text-live">Live</span>
      )}
    </div>
  );
}
