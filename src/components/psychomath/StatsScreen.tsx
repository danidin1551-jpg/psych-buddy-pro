import { ArrowLeft, Trash2 } from "lucide-react";
import { CATEGORY_KEYS, CATEGORY_META, type StatsMap, type LevelMap } from "@/lib/psychomath/types";

interface Props {
  stats: StatsMap;
  levels: LevelMap;
  onBack: () => void;
  onReset: () => void;
}

export function StatsScreen({ stats, levels, onBack, onReset }: Props) {
  const totals = CATEGORY_KEYS.reduce(
    (acc, k) => {
      acc.attempts += stats[k].attempts;
      acc.correct += stats[k].correct;
      acc.time += stats[k].totalTime;
      return acc;
    },
    { attempts: 0, correct: 0, time: 0 },
  );
  const overall = totals.attempts ? Math.round((totals.correct / totals.attempts) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">מרכז נתונים וביצועים</h2>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-primary transition-colors hover:opacity-80"
        >
          חזרה
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "שאלות", value: totals.attempts },
          { label: "דיוק כולל", value: `${overall}%` },
          {
            label: "זמן ממוצע",
            value: totals.attempts ? `${(totals.time / totals.attempts / 1000).toFixed(1)}s` : "—",
          },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-3 text-center">
            <div className="text-xl font-bold">{card.value}</div>
            <div className="text-[11px] text-muted-foreground">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {CATEGORY_KEYS.map((key) => {
          const s = stats[key];
          const meta = CATEGORY_META[key];
          const acc = s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0;
          return (
            <div
              key={key}
              style={{ "--tile": meta.accent } as React.CSSProperties}
              className="rounded-2xl border border-border bg-card p-3"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--tile)]">{meta.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  דרגה {levels[key]} · {s.attempts} שאלות
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[var(--tile)] transition-all"
                  style={{ width: `${acc}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>דיוק {s.attempts ? `${acc}%` : "—"}</span>
                <span>
                  ממוצע{" "}
                  {s.attempts ? `${(s.totalTime / s.attempts / 1000).toFixed(1)}s` : "—"} · שיא{" "}
                  {s.bestTime ? `${(s.bestTime / 1000).toFixed(1)}s` : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 rounded-xl border border-destructive/40 py-3 text-sm text-destructive transition-colors hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" /> איפוס כל הנתונים
      </button>
    </div>
  );
}
