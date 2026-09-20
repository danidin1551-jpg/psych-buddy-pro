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
  onSubmitNumeric: () => void;\n  onSelectOption: (index: number) => void;
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

/* גודל גופן מתכווץ לתשובות ארוכות כדי שלא יגלשו לשורה שנייה */
function answerTextSize(length: number) {
  if (length > 7) return "text-xl";
  if (length > 5) return "text-2xl";
  return "text-3xl";
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
      if (question.type === "multipleChoice") return;\n      if (/^[0-9]$/.test(e.key)) onKeypad(e.key);
      else if (e.key === "-") onKeypad("-");
      else if (e.key === "Backspace") onKeypad("del");
      else if (e.key === "Enter") onSubmitNumeric();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedback, onKeypad, onNext, onSubmitNumeric]);

  const targetMs = timeTargetSeconds(question.typeLabel) * 1000;
  const isOverTarget = !feedback && elapsed > targetMs;

  /* גודל טקסט השאלה מתכווץ לפי אורך, כדי שיתאים לכרטיס גם כשהגובה גמיש */
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
    <div className="fixed inset-x-0 top-0 z-10 flex" style={{ height: "100dvh" }}>
      <div
        className="mx-auto flex h-full w-full max-w-2xl flex-col px-4 pt-4"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        {/* ===== חלק עליון: קבוע בגובה טבעי ===== */}
        <div className="flex shrink-0 flex-col gap-3">
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
        </div>

        {/* ===== חלק אמצעי: גמיש, ממלא את מה שנשאר ===== */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 py-3">
          {/* עוטף חיצוני: רק חיתוך+מסגרת, בלי backdrop-filter — פותר דליפת Safari */}
          <div
            key={question.signature + String(Boolean(feedback))}
            className={`relative min-h-[110px] flex-1 overflow-hidden rounded-3xl border text-center ${
              feedback
                ? feedback.isCorrect
                  ? `animate-pop border-[var(--brand-lime)] ${streak >= 3 ? "animate-glow" : ""}`
                  : "animate-shake border-destructive"
                : "gradient-ring border-border"
            }`}
          >
            {/* עוטף פנימי: שכבת הזכוכית (blur) בלבד */}
            <div className="glass absolute inset-0 rounded-3xl">
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
          </div>

          {question.type === "multipleChoice" && !feedback && question.options && (
            <div className="grid shrink-0 gap-2">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onSelectOption(index)}
                  className="glass rounded-2xl border border-border p-3 text-right text-sm font-semibold transition-colors hover:bg-accent active:scale-[0.99]"
                  dir="auto"
                >
                  <span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border font-mono">
                    {index + 1}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          )}

          {feedback && (
            <div
              className={`glass max-h-[38%] shrink-0 animate-fade-in overflow-y-auto rounded-3xl border p-4 ${
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
              {question.tip && (
                <div className="mt-3 rounded-2xl border border-border bg-muted/40 p-3 text-xs leading-relaxed" dir="auto">
                  <span className="font-bold text-foreground">טיפ לפסיכומטרי: </span>
                  {question.tip}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== חלק תחתון: קבוע בגובה טבעי — המקלדת או כפתור "שאלה הבאה" ===== */}
        <div className="shrink-0">
          {feedback ? (
            <button
              onClick={onNext}
              className="w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              שאלה הבאה
            </button>
          ) : (
            <>
              <div
                dir="ltr"
                className={`glass mb-2 flex h-[60px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border px-2 text-center font-mono font-bold tracking-widest ${answerTextSize(userInput.length)}`}
              >
                <span className="whitespace-nowrap">{userInput || "\u00A0"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => onKeypad(k)}
                    className={`glass flex h-12 items-center justify-center rounded-2xl border border-border font-mono text-xl transition-colors hover:bg-accent active:scale-95 ${
                      k === "0" ? "col-span-2" : ""
                    }`}
                    aria-label={k === "del" ? "מחיקה" : k}
                  >
                    {k === "del" ? <Delete className="h-5 w-5" /> : k}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  onClick={() => onKeypad("-")}
                  className="glass h-11 rounded-2xl border border-border font-mono text-xl transition-colors hover:bg-accent"
                  aria-label="שינוי סימן"
                >
                  ±
                </button>
                <button
                  onClick={onSubmitNumeric}
                  disabled={userInput.trim() === "" || userInput.trim() === "-"}
                  className="col-span-2 h-11 rounded-2xl bg-primary font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  בדיקה
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
