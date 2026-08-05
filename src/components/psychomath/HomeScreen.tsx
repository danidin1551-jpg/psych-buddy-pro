import { BarChart3, RotateCcw, Sparkles, Flame } from "lucide-react";
import { CATEGORY_META, type ModeKey } from "@/lib/psychomath/types";

interface Props {
  onStart: (mode: ModeKey, kind: "endless" | "exam") => void;
  onShowStats: () => void;
  onReview: () => void;
  missedCount: number;
  bestStreak: number;
}

const ORDER: ModeKey[] = [
  "mixed",
  "algebra",
  "multiplication",
  "powers",
  "percentages",
  "wordProblems",
  "geometry",
  "probability",
];

export function HomeScreen({ onStart, onShowStats, onReview, missedCount, bestStreak }: Props) {
  return (
    <div className="flex flex-col gap-6 py-2">
      <header className="pt-2 text-center">
        <div className="mb-3 inline-flex items-center gap-2">
          <span className="text-2xl font-black tracking-wider text-primary">PsychoMath</span>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">
            v5
          </span>
        </div>
        <h1 className="mb-1 text-lg font-bold sm:text-xl">
          תרגול חישוב מנטלי ופתרון בעיות כמותי
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          בחרי נושא כדי להתחיל · הרמה מותאמת אוטומטית לביצועים שלך
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ORDER.map((key) => {
          const meta = CATEGORY_META[key];
          const isMixed = key === "mixed";
          return (
            <button
              key={key}
              onClick={() => onStart(key, "endless")}
              style={{ "--tile": meta.accent } as React.CSSProperties}
              className={`group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-right transition-all hover:border-[var(--tile)] active:scale-[0.98] ${
                isMixed ? "border-[var(--tile)] bg-[color-mix(in_oklch,var(--tile)_18%,var(--card))] sm:col-span-2" : ""
              }`}
            >
              <span className="flex flex-col items-start gap-1">
                <span className="text-base font-bold text-[var(--tile)]">{meta.name}</span>
                <span className="text-xs text-muted-foreground">{meta.description}</span>
              </span>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--tile)_20%,transparent)] font-mono text-xl text-[var(--tile)]">
                {meta.icon}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => onStart("mixed", "exam")}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" /> סימולציה מתוזמנת · 10 שאלות
        </button>
        <button
          onClick={onReview}
          disabled={missedCount === 0}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" /> חזרה על טעויות ({missedCount})
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Flame className="h-4 w-4 text-[var(--accent-amber)]" /> רצף שיא בסשן: {bestStreak}
        </span>
        <button
          onClick={onShowStats}
          className="flex items-center gap-2 text-primary transition-colors hover:opacity-80"
        >
          <BarChart3 className="h-4 w-4" /> מרכז נתונים
        </button>
      </div>
    </div>
  );
}
