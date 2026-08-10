import { comboIntensity, intensityFor } from "@/lib/psychomath/feedback";
import { AuroraOrb } from "./AuroraOrb";

interface Props {
  streak: number;
  broke: boolean;
}

const TIER = {
  soft: { color: "var(--brand-cyan)", label: "רצף" },
  medium: { color: "var(--brand-violet)", label: "רצף יפה" },
  high: { color: "var(--brand-lime)", label: "בוער" },
  peak: { color: "var(--brand-coral)", label: "על אש" },
} as const;

/** מד הקומבו משולב בכדור האורורה — האורורה עצמה היא המחוון */
export function ComboMeter({ streak, broke }: Props) {
  const tier = TIER[intensityFor(streak)];
  const fill = Math.min(100, ((streak % 10 || (streak ? 10 : 0)) / 10) * 100);

  return (
    <div
      className={`glass relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 ${
        broke ? "animate-shake border-destructive" : "border-border"
      }`}
    >
      {!broke && <AuroraOrb intensity={comboIntensity(streak)} className="opacity-70" />}

      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
        <span
          className="absolute inset-0 rounded-full transition-opacity duration-500"
          style={{
            background: "var(--gradient-trio)",
            opacity: streak > 0 && !broke ? 0.45 + Math.min(0.55, streak / 20) : 0.18,
          }}
        />
        <span className="relative font-mono text-xs font-bold text-foreground">{streak}</span>
      </span>

      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${broke ? 0 : fill}%`,
            background:
              streak > 0
                ? `linear-gradient(90deg, ${tier.color}, var(--brand-lime))`
                : "var(--brand-cyan)",
          }}
        />
      </div>

      <span className="relative min-w-[4.5rem] text-left text-xs font-semibold text-foreground">
        {streak > 0 ? tier.label : "מתחילים"}
      </span>
    </div>
  );
}
