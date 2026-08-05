import { Flame } from "lucide-react";
import { lastSevenDays, type StreakData } from "@/lib/psychomath/streaks";

interface Props {
  data: StreakData;
  value: number;
  today: boolean;
}

export function StreakCard({ data, value, today }: Props) {
  const week = lastSevenDays(data);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--accent-amber)_18%,transparent)] ${
              today ? "animate-flame" : ""
            }`}
          >
            <Flame className="h-6 w-6 text-[var(--accent-amber)]" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight">
              {value} <span className="text-sm font-normal text-muted-foreground">ימים ברצף</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {today ? "תרגלת היום — כל הכבוד" : "עוד לא תרגלת היום"} · שיא: {data.best}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-1">
        {week.map((d) => (
          <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`h-2.5 w-full rounded-full ${
                d.done
                  ? "bg-[var(--accent-amber)]"
                  : "bg-[color-mix(in_oklch,var(--muted-foreground)_25%,transparent)]"
              }`}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
