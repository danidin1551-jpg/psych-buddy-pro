import { Flame } from "lucide-react";
import { intensityFor } from "@/lib/psychomath/feedback";

interface Props {
  streak: number;
  broke: boolean;
}

const TIER = {
  soft: { color: "var(--primary)", label: "רצף" },
  medium: { color: "var(--accent-violet)", label: "רצף יפה" },
  high: { color: "var(--accent-amber)", label: "בוער" },
  peak: { color: "var(--accent-emerald)", label: "על אש" },
} as const;

export function ComboMeter({ streak, broke }: Props) {
  const tier = TIER[intensityFor(streak)];
  const fill = Math.min(100, ((streak % 10 || (streak ? 10 : 0)) / 10) * 100);

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
        broke ? "animate-shake border-destructive" : "border-border"
      }`}
      style={{ borderColor: streak > 0 && !broke ? tier.color : undefined }}
    >
      <Flame
        className={`h-4 w-4 shrink-0 ${streak >= 5 ? "animate-flame" : ""}`}
        style={{ color: streak > 0 ? tier.color : "var(--muted-foreground)" }}
      />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width,background-color] duration-300"
          style={{ width: `${broke ? 0 : fill}%`, backgroundColor: tier.color }}
        />
      </div>
      <span className="min-w-[3.5rem] text-left font-mono text-xs" style={{ color: streak > 0 ? tier.color : undefined }}>
        {streak > 0 ? `${tier.label} ${streak}` : "רצף 0"}
      </span>
    </div>
  );
}
