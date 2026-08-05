import { ArrowLeft, Check, Lock, Play } from "lucide-react";
import {
  accuracyFor,
  categoryProgress,
  overallProgress,
  stagesFor,
} from "@/lib/psychomath/skillTree";
import {
  CATEGORY_KEYS,
  CATEGORY_META,
  type CategoryKey,
  type LevelMap,
  type StatsMap,
} from "@/lib/psychomath/types";

interface Props {
  levels: LevelMap;
  stats: StatsMap;
  onStartCategory: (cat: CategoryKey) => void;
  onBack: () => void;
}

export function PathScreen({ levels, stats, onStartCategory, onBack }: Props) {
  const total = overallProgress(levels);

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">מסלול המיומנויות</h2>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-primary transition-colors hover:opacity-80"
        >
          חזרה
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">התקדמות כוללת</span>
          <span className="font-bold">{total}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${total}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {CATEGORY_KEYS.map((cat) => {
          const meta = CATEGORY_META[cat];
          const level = levels[cat] ?? 1;
          const stages = stagesFor(level);
          const acc = accuracyFor(stats, cat);
          return (
            <div
              key={cat}
              style={{ "--tile": meta.accent } as React.CSSProperties}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--tile)_20%,transparent)] font-mono text-[var(--tile)]">
                    {meta.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--tile)]">{meta.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      רמה {level}/10 · {categoryProgress(level)}%
                      {acc !== null ? ` · דיוק ${acc}%` : ""}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onStartCategory(cat)}
                  className="flex items-center gap-1 rounded-lg bg-[color-mix(in_oklch,var(--tile)_20%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--tile)] transition-transform active:scale-95"
                >
                  <Play className="h-3.5 w-3.5" /> תרגול
                </button>
              </div>

              <div className="flex items-center gap-1">
                {stages.map((s, i) => (
                  <div key={s.index} className="flex flex-1 items-center gap-1">
                    <div
                      className={`flex h-8 flex-1 flex-col items-center justify-center rounded-lg border text-[10px] ${
                        s.state === "done"
                          ? "border-[var(--tile)] bg-[color-mix(in_oklch,var(--tile)_22%,var(--card))] text-[var(--tile)]"
                          : s.state === "active"
                            ? "border-[var(--tile)] text-foreground animate-pop"
                            : "border-border text-muted-foreground opacity-60"
                      }`}
                      title={`${s.name} · רמות ${s.minLevel}-${s.maxLevel}`}
                    >
                      {s.state === "done" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : s.state === "locked" ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <span className="font-semibold">{s.name}</span>
                      )}
                    </div>
                    {i < stages.length - 1 && (
                      <span
                        className={`h-0.5 w-2 rounded-full ${
                          s.state === "done" ? "bg-[var(--tile)]" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
