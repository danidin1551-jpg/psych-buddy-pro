import { useEffect, useState } from "react";
import { ArrowLeft, Check, Delete, X } from "lucide-react";
import type { Question } from "@/lib/psychomath/types";
import { timeTargetSeconds } from "@/lib/psychomath/pacing";
import { comboIntensity } from "@/lib/psychomath/feedback";
import { ComboMeter } from "./ComboMeter";
import { AuroraOrb } from "./AuroraOrb";


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

/* התשובות בכל הגנרטורים שלמות — אין מקש נקודה עשרונית */
const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "del"];

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
  comboBroke = false,
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
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

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
      else if (e.key === "-") onKeypad("-");
      else if (e.key === "Backspace") onKeypad("del");
      else if (e.key === "Enter") onSubmitNumeric();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedback, onKeypad, onNext, onSubmitNumeric]);

  const targetMs = timeTargetSeconds(question.typeLabel) * 1000;
  const isOverTarget = !feedback && elapsed > targetMs;

  /* גובה הכרטיס קבוע — מקטינים טקסט לשאלות ארוכות כדי להימנע מגלילה */
  const textLength = question.text.length;
  const questionTextSize =
    textLength > 190
      ? "text-sm sm:text-base"
      : textLength > 120
        ? "text-base sm:text-lg"
        : textLength > 70
          ? "text-lg sm:text-xl"
          : "text-xl sm:text-2xl";

  return (
    <div className="flex flex-col gap-4 py-2">

      <div className="flex items-center justify-between gap-2">
        <span className="glass truncate rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          {question.groupLabel}
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span
            className="font-mono text-sm tabular-nums transition-colors duration-1000"
            style={{
              color: isOverTarget ? "var(--brand-coral)" : "var(--muted-foreground)",
              transition: reducedMotion ? "none" : "color 1.5s ease",
            }}
          >
            {formatSeconds(feedback ? feedback.elapsed : elapsed)}s
          </span>

          <button
            onClick={onBack}
            className="flex items-center gap-1 font-semibold text-primary transition-opacity hover:opacity-80"
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
              className="h-full rounded-full transition-[width] duration-200"
              style={{
                width: `${totalMs ? Math.max(0, (remainingMs / totalMs) * 100) : 0}%`,
                background: "var(--gradient-trio)",
              }}
            />
          </div>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">{progressLabel}</div>

      <ComboMeter streak={streak} broke={comboBroke} />

      {levelUp && (
        <div className="glass animate-pop gradient-ring rounded-2xl border border-border p-2.5 text-center text-xs font-bold">
          <span className="text-gradient">עלית רמה בנושא הזה</span>
        </div>
      )}

      <div
        key={question.signature + String(Boolean(feedback))}
        className={`glass relative h-[230px] overflow-hidden rounded-3xl border text-center sm:h-[260px] ${
          feedback
            ? feedback.isCorrect
              ? `animate-pop border-[var(--brand-lime)] ${streak >= 3 ? "animate-glow" : ""}`
              : "animate-shake border-destructive"
            : "gradient-ring border-border"
        }`}
      >
        <AuroraOrb intensity={comboIntensity(streak)} />

        <div className="relative flex h-full flex-col items-center justify-center overflow-y-auto p-6 sm:p-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">
            {question.typeLabel}
          </div>
          <div className={`font-bold leading-relaxed ${questionTextSize}`}>
            {question.text.split("\n").map((line, i) => (
              <div key={i} dir="auto" className="min-h-[0.6em]">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {feedback ? (
        <div
          className={`glass animate-fade-in rounded-3xl border p-4 ${
            feedback.isCorrect ? "border-[var(--brand-lime)]" : "border-destructive"
          }`}
        >
          <div className="mb-2 flex items-center gap-2 font-bold">
            {feedback.isCorrect ? (
              <>
                <Check className="h-5 w-5 text-[var(--brand-lime)]" /> נכון! (
                {formatSeconds(feedback.elapsed)} שניות)
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
            className="mt-4 w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            שאלה הבאה
          </button>
        </div>
      ) : (
        <>
          <div
            dir="ltr"
            className="glass flex min-h-[68px] w-full items-center justify-center rounded-2xl border border-border py-4 text-center font-mono text-3xl font-bold tracking-widest"
          >
            {userInput || "\u00A0"}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button
                key={k}
                onClick={() => onKeypad(k)}
                className={`glass flex h-14 items-center justify-center rounded-2xl border border-border font-mono text-xl transition-colors hover:bg-accent active:scale-95 ${
                  k === "0" ? "col-span-2" : ""
                }`}
                aria-label={k === "del" ? "מחיקה" : k}
              >
                {k === "del" ? <Delete className="h-5 w-5" /> : k}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onKeypad("-")}
              className="glass h-12 rounded-2xl border border-border font-mono text-xl transition-colors hover:bg-accent"
              aria-label="שינוי סימן"
            >
              ±
            </button>
            <button
              onClick={onSubmitNumeric}
              disabled={userInput.trim() === "" || userInput.trim() === "-"}
              className="col-span-2 h-12 rounded-2xl bg-primary font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              בדיקה
            </button>
          </div>
        </>
      )}
    </div>
  );
}
