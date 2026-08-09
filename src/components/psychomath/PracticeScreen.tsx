import { useEffect, useState } from "react";
import { ArrowLeft, Check, Delete, Flame, X } from "lucide-react";
import type { Question } from "@/lib/psychomath/types";
import { ComboMeter } from "./ComboMeter";

interface Props {
  question: Question;
  userInput: string;
  feedback: { isCorrect: boolean; elapsed: number; given: string } | null;
  streak: number;
  comboBroke?: boolean;
  progressLabel: string;
  remainingMs?: number | null;
  totalMs?: number | null;
  levelUp?: boolean;
  onKeypad: (key: string) => void;
  onSubmitNumeric: () => void;
  onNext: () => void;
  onBack: () => void;
}

const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "del"];

function formatSeconds(ms: number) {
  return (ms / 1000).toFixed(1);
}

function formatClock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${`${total % 60}`.padStart(2, "0")}`;
}


export function PracticeScreen({
  question,
  userInput,
  feedback,
  streak,
  progressLabel,
  remainingMs = null,
  totalMs = null,
  levelUp = false,
  onKeypad,
  onSubmitNumeric,
  onNext,
  onBack,
}: Props) {

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (feedback) return;
    setElapsed(0);
    const started = Date.now();
    const id = window.setInterval(() => setElapsed(Date.now() - started), 100);
    return () => window.clearInterval(id);
  }, [question.signature, feedback]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (feedback) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNext();
        }
        return;
      }
      if (/^[0-9]$/.test(e.key)) onKeypad(e.key);
      else if (e.key === "." || e.key === ",") onKeypad(".");
      else if (e.key === "-") onKeypad("-");
      else if (e.key === "Backspace") onKeypad("del");
      else if (e.key === "Enter") onSubmitNumeric();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedback, onKeypad, onNext, onSubmitNumeric]);

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate rounded-full bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
          {question.groupLabel}
        </span>
        <div className="flex items-center gap-3 text-xs">
          {streak > 1 && (
            <span className="flex items-center gap-1 text-[var(--accent-amber)]">
              <Flame className="h-3.5 w-3.5" />
              {streak}
            </span>
          )}
          <span className="font-mono text-muted-foreground">
            {formatSeconds(feedback ? feedback.elapsed : elapsed)}s
          </span>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-primary transition-colors hover:opacity-80"
          >
            חזרה
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>

      {remainingMs !== null && (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{formatClock(remainingMs)}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--accent-violet)] transition-[width] duration-200"
              style={{ width: `${totalMs ? Math.max(0, (remainingMs / totalMs) * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">{progressLabel}</div>

      {levelUp && (
        <div className="animate-pop rounded-xl border border-[var(--accent-amber)] bg-[color-mix(in_oklch,var(--accent-amber)_14%,var(--card))] p-2 text-center text-xs font-semibold">
          עלית רמה בנושא הזה
        </div>
      )}

      <div
        key={question.signature + String(Boolean(feedback))}
        className={`relative flex min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-3xl border bg-card p-6 text-center shadow-xl sm:p-8 ${
          feedback
            ? feedback.isCorrect
              ? "animate-pop border-[var(--accent-emerald)]"
              : "animate-shake border-destructive"
            : "animate-fade-in border-border"
        }`}
      >
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
          {question.typeLabel}
        </div>
        <div className="text-xl font-bold leading-relaxed sm:text-2xl">
          {question.text.split("\n").map((line, i) => (
            <div key={i} dir="auto" className="min-h-[0.6em]">
              {line}
            </div>
          ))}
        </div>

      </div>

      {feedback ? (
        <div
          className={`animate-fade-in rounded-2xl border p-4 ${
            feedback.isCorrect

              ? "border-[var(--accent-emerald)] bg-[color-mix(in_oklch,var(--accent-emerald)_12%,var(--card))]"
              : "border-destructive bg-[color-mix(in_oklch,var(--destructive)_12%,var(--card))]"
          }`}
        >
          <div className="mb-2 flex items-center gap-2 font-bold">
            {feedback.isCorrect ? (
              <>
                <Check className="h-5 w-5 text-[var(--accent-emerald)]" /> נכון! ({formatSeconds(feedback.elapsed)} שניות)
              </>
            ) : (
              <>
                <X className="h-5 w-5 text-destructive" /> לא נכון · התשובה: {question.answer}
              </>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {question.explanation.split("\n").map((line, i) => (
              <p key={i} dir="auto">
                {line}
              </p>
            ))}
          </div>

          <button
            onClick={onNext}
            className="mt-4 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            שאלה הבאה
          </button>
        </div>
      ) : (
        <>
          <div
            dir="ltr"
            className="flex min-h-[64px] w-full items-center justify-center rounded-2xl border border-border bg-muted py-4 text-center font-mono text-3xl font-bold tracking-widest"
          >
            {userInput || "\u00A0"}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button
                key={k}
                onClick={() => onKeypad(k)}
                className="flex h-14 items-center justify-center rounded-xl border border-border bg-card font-mono text-xl transition-colors hover:bg-accent active:scale-95"
                aria-label={k === "del" ? "מחיקה" : k}
              >
                {k === "del" ? <Delete className="h-5 w-5" /> : k}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onKeypad("-")}
              className="h-12 rounded-xl border border-border bg-card font-mono text-xl transition-colors hover:bg-accent"
            >
              ±
            </button>
            <button
              onClick={onSubmitNumeric}
              disabled={userInput.trim() === "" || userInput.trim() === "-"}
              className="col-span-2 h-12 rounded-xl bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              בדיקה
            </button>
          </div>
        </>
      )}
    </div>
  );
}
