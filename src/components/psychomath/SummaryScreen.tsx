import { Check, RotateCcw, X, Home, Wrench } from "lucide-react";
import type { MissedQuestion } from "@/lib/psychomath/types";

interface Props {
  answered: number;
  correct: number;
  totalTime: number;
  missed: MissedQuestion[];
  onRestart: () => void;
  onHome: () => void;
  onFixRound?: (() => void) | undefined;
}

export function SummaryScreen({ answered, correct, totalTime, missed, onRestart, onHome, onFixRound }: Props) {

  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  return (
    <div className="flex flex-col gap-4 py-2">
      <h2 className="text-center text-lg font-bold">סיכום הסבב</h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "דיוק", value: `${accuracy}%` },
          { label: "נכונות", value: `${correct}/${answered}` },
          {
            label: "זמן ממוצע",
            value: answered ? `${(totalTime / answered / 1000).toFixed(1)}s` : "—",
          },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl glass border border-border p-3 text-center">
            <div className="text-gradient font-mono text-2xl font-bold">{c.value}</div>
            <div className="text-[11px] text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      {missed.length > 0 && onFixRound && (
        <button
          onClick={onFixRound}
          className="animate-pop flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          <Wrench className="h-4 w-4" /> סבב תיקון על {missed.length} הטעויות
        </button>
      )}

      {missed.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <X className="h-4 w-4 text-destructive" /> שאלות שטעית בהן
          </h3>
          {missed.map((m, i) => (

            <div key={i} className="rounded-2xl glass border border-border p-3 text-sm">
              <div className="mb-1 whitespace-pre-line font-medium">{m.question.text}</div>
              <div className="text-xs text-muted-foreground">
                תשובתך: {m.givenAnswer || "—"} · התשובה הנכונה: {m.question.answer}
              </div>
              <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                {m.question.explanation}
              </p>
            </div>
          ))}
        </div>
      )}

      {missed.length === 0 && answered > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--brand-lime)] bg-[color-mix(in_oklch,var(--brand-lime)_12%,var(--card))] p-4 text-sm font-semibold">
          <Check className="h-4 w-4 text-[var(--brand-lime)]" /> סבב מושלם, בלי טעויות!
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" /> סבב נוסף
        </button>
        <button
          onClick={onHome}
          className="flex items-center justify-center gap-2 rounded-xl glass border border-border py-3 transition-colors hover:bg-accent"
        >
          <Home className="h-4 w-4" /> למסך הבית
        </button>
      </div>
    </div>
  );
}
