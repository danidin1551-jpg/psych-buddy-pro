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
    <div className="glass rounded-3xl border border-border p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${today ? "animate-flame" : ""}`}
          style={{ background: "var(--gradient-trio)" }}
        >
          <Flame className="h-6 w-6 text-background" />
        </span>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight">
            <span className={`font-mono ${value >= 3 ? "text-gradient" : ""}`}>{value}</span>{" "}
            <span className="text-sm font-normal text-muted-foreground">ימים ברצף</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {today ? "תרגלת היום — כל הכבוד" : "עוד לא תרגלת היום"} · שיא: {data.best}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-1">
        {week.map((d) => (
          <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
            <span
              className="h-2.5 w-full rounded-full"
              style={
                d.done
                  ? { background: "var(--gradient-trio)" }
                  : { background: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)" }
              }
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
