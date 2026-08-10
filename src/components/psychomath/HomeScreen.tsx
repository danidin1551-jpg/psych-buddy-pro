import { BarChart3, Map, RotateCcw, Timer, Volume2, VolumeX } from "lucide-react";
import { CATEGORY_META, type ModeKey } from "@/lib/psychomath/types";
import { StreakCard } from "./StreakCard";
import { ReminderCard } from "./ReminderCard";
import { AuroraOrb } from "./AuroraOrb";
import type { ReminderPrefs } from "@/lib/psychomath/reminders";
import type { StreakData } from "@/lib/psychomath/streaks";
import { SHORT_SESSION_MINUTES, type SessionKind } from "@/hooks/usePsychoMath";

interface Props {
  onStart: (mode: ModeKey, kind: SessionKind, minutes?: number) => void;
  onShowStats: () => void;
  onShowPath: () => void;
  onReview: () => void;
  missedCount: number;
  bestStreak: number;
  dayStreak: StreakData;
  dayStreakValue: number;
  practicedToday: boolean;
  muted: boolean;
  onToggleMuted: () => void;
  reminder: ReminderPrefs;
  onReminderChange: (next: ReminderPrefs) => void;
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

export function HomeScreen({
  onStart,
  onShowStats,
  onShowPath,
  onReview,
  missedCount,
  bestStreak,
  dayStreak,
  dayStreakValue,
  practicedToday,
  muted,
  onToggleMuted,
  reminder,
  onReminderChange,
}: Props) {
  return (
    <div className="flex flex-col gap-6 py-2">
      <header className="pt-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient">PsychoMath</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          חישוב מנטלי לפסיכומטרי · מנה קצרה כל יום, הרמה מותאמת אלייך
        </p>
      </header>

      <StreakCard data={dayStreak} value={dayStreakValue} today={practicedToday} />

      <ReminderCard prefs={reminder} onChange={onReminderChange} practicedToday={practicedToday} />

      <section className="glass gradient-ring relative overflow-hidden rounded-3xl border border-border p-5">
        <AuroraOrb intensity={0.15} />
        <div className="relative mb-4 flex items-center gap-2">
          <Timer className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-bold">מנה קצרה — מתחילים עכשיו</h2>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          {SHORT_SESSION_MINUTES.map((m) => (
            <button
              key={m}
              onClick={() => onStart("mixed", "timed", m)}
              className="rounded-2xl bg-primary py-4 font-mono text-lg font-bold text-primary-foreground transition-transform hover:opacity-90 active:scale-[0.98]"
            >
              {m} דקות
            </button>
          ))}
        </div>
        <p className="relative mt-3 text-xs text-muted-foreground">
          סשן שאפשר להספיק בתור, בהפסקה או בנסיעה.
        </p>
      </section>

      <button
        onClick={onShowPath}
        className="glass flex items-center justify-between rounded-3xl border border-border p-5 text-right transition-colors hover:bg-accent"
      >
        <span className="flex flex-col items-start gap-1">
          <span className="text-sm font-bold">מסלול המיומנויות</span>
          <span className="text-xs text-muted-foreground">ראי בדיוק איפה את ולאן ממשיכים</span>
        </span>
        <Map className="h-5 w-5 text-foreground" />
      </button>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ORDER.map((key) => {
          const meta = CATEGORY_META[key];
          const isMixed = key === "mixed";
          return (
            <button
              key={key}
              onClick={() => onStart(key, "endless")}
              className={`glass group relative flex items-center justify-between gap-3 overflow-hidden rounded-3xl border border-border p-4 text-right transition-transform active:scale-[0.98] ${
                isMixed ? "gradient-ring sm:col-span-2" : ""
              }`}
            >
              <span className="relative flex flex-col items-start gap-1">
                <span className="text-base font-bold">{meta.name}</span>
                <span className="text-xs text-muted-foreground">{meta.description}</span>
              </span>
              <span
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold text-background"
                style={{ background: meta.gradient }}
                aria-hidden
              >
                {meta.icon}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onReview}
        disabled={missedCount === 0}
        className="glass flex items-center justify-center gap-2 rounded-2xl border border-border py-3.5 text-sm font-semibold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RotateCcw className="h-4 w-4" /> חזרה על טעויות ({missedCount})
      </button>

      <div className="glass flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          רצף שיא: <span className="font-mono text-foreground">{bestStreak}</span>
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleMuted}
            aria-label={muted ? "הפעלת צליל ורטט" : "השתקת צליל ורטט"}
            title={muted ? "הפעלת צליל ורטט" : "השתקת צליל ורטט"}
            className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onShowStats}
            className="flex items-center gap-2 font-semibold text-primary transition-opacity hover:opacity-80"
          >
            <BarChart3 className="h-4 w-4" /> מרכז נתונים
          </button>
        </div>
      </div>
    </div>
  );
}
