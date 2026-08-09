import { useCallback, useEffect, useRef, useState } from "react";
import {
  generateQuestion,
  isAnswerCorrect,
} from "@/lib/psychomath/generators";
import {
  clearAll,
  defaultLevels,
  defaultStats,
  loadLevels,
  loadMissed,
  loadStats,
  queueSave,
  flushSaves,
} from "@/lib/psychomath/storage";
import {
  currentStreakValue,
  emptyStreak,
  loadStreak,
  practicedToday,
  recordPracticeDay,
  saveStreak,
  type StreakData,
} from "@/lib/psychomath/streaks";
import {
  isMuted,
  setMuted as persistMuted,
} from "@/lib/psychomath/sound";
import {
  feedbackCorrect,
  feedbackFinish,
  feedbackLevelUp,
  feedbackWrong,
  isConfettiStreak,
} from "@/lib/psychomath/feedback";
import {
  defaultReminder,
  fireReminder,
  isDue,
  loadReminder,
  type ReminderPrefs,
} from "@/lib/psychomath/reminders";
import type {
  CategoryKey,
  LevelMap,
  MissedQuestion,
  ModeKey,
  Question,
  StatsMap,
} from "@/lib/psychomath/types";

export type Screen = "home" | "practice" | "stats" | "summary" | "path";
export type SessionKind = "endless" | "exam" | "review" | "timed" | "fix";

export const EXAM_LENGTH = 10;
/** אורכי מנה קצרה בדקות */
export const SHORT_SESSION_MINUTES = [3, 5] as const;

interface Feedback {
  isCorrect: boolean;
  elapsed: number;
  given: string;
}

interface Session {
  kind: SessionKind;
  answered: number;
  correct: number;
  totalTime: number;
  missed: MissedQuestion[];
  /** משך יעד במילישניות (למנה קצרה) */
  durationMs: number | null;
  endsAt: number | null;
}

const emptySession = (kind: SessionKind, durationMs: number | null = null): Session => ({
  kind,
  answered: 0,
  correct: 0,
  totalTime: 0,
  missed: [],
  durationMs,
  endsAt: durationMs ? Date.now() + durationMs : null,
});

export function usePsychoMath() {
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<ModeKey>("mixed");
  const [question, setQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [stats, setStats] = useState<StatsMap>(defaultStats);
  const [levels, setLevels] = useState<LevelMap>(defaultLevels);
  const [missed, setMissed] = useState<MissedQuestion[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [session, setSession] = useState<Session>(() => emptySession("endless"));
  const [dayStreak, setDayStreak] = useState<StreakData>(emptyStreak);
  const [muted, setMutedState] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [levelUpFlash, setLevelUpFlash] = useState<CategoryKey | null>(null);
  const [confettiTick, setConfettiTick] = useState(0);
  const [comboBroke, setComboBroke] = useState(false);
  const [reminder, setReminder] = useState<ReminderPrefs>(defaultReminder);
  const [ready, setReady] = useState(false);

  const startTimeRef = useRef(0);
  const recentRef = useRef<string[]>([]);
  const reviewQueueRef = useRef<Question[]>([]);
  const catStreakRef = useRef<Record<string, { up: number; down: number }>>({});
  const levelsRef = useRef<LevelMap>(defaultLevels());
  const streakRef = useRef(0);
  const nextDeltaRef = useRef(0);

  useEffect(() => {
    setStats(loadStats());
    const storedLevels = loadLevels();
    levelsRef.current = storedLevels;
    setLevels(storedLevels);
    setMissed(loadMissed());
    setDayStreak(loadStreak());
    setMutedState(isMuted());
    setReminder(loadReminder());
    setReady(true);
  }, []);

  // בדיקת תזכורת יומית כל דקה, וגם בכל חזרה ללשונית
  useEffect(() => {
    if (!ready) return;
    // הפעולה נעשית מחוץ ל-updater כדי שההתראה תישלח פעם אחת בלבד
    const check = () => {
      const prefs = reminderRef.current;
      if (!isDue(prefs, practicedToday(dayStreak))) return;
      const next = fireReminder(prefs);
      if (next) {
        reminderRef.current = next;
        setReminder(next);
      }
    };
    check();
    const id = window.setInterval(check, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready, dayStreak]);

  const updateReminder = useCallback((next: ReminderPrefs) => {
    reminderRef.current = next;
    setReminder(next);
  }, []);

  const toggleMuted = useCallback(() => {
    setMutedState((prev) => {
      persistMuted(!prev);
      return !prev;
    });
  }, []);

  const pushQuestion = useCallback(
    (nextMode: ModeKey, currentLevels: LevelMap, currentStats: StatsMap, kind: SessionKind) => {
      let q: Question | undefined;
      if (kind === "review" || kind === "fix") {
        q = reviewQueueRef.current.shift();
      }
      if (!q) {
        q = generateQuestion(
          nextMode,
          currentLevels,
          currentStats,
          recentRef.current,
          nextDeltaRef.current,
        );
      }
      nextDeltaRef.current = 0;
      recentRef.current = [...recentRef.current, q.signature].slice(-6);
      setQuestion(q);
      setUserInput("");
      setFeedback(null);
      startTimeRef.current = Date.now();
    },
    [],
  );

  const startPractice = useCallback(
    (nextMode: ModeKey, kind: SessionKind = "endless", minutes?: number) => {
      setMode(nextMode);
      const duration = kind === "timed" ? (minutes ?? 3) * 60_000 : null;
      setSession(emptySession(kind, duration));
      setRemainingMs(duration);
      setStreak(0);
      recentRef.current = [];
      // שאלת חימום ברמה נמוכה יותר בתחילת כל סשן
      nextDeltaRef.current = -1;
      pushQuestion(nextMode, levels, stats, kind);
      setScreen("practice");
    },
    [levels, stats, pushQuestion],
  );

  const startReview = useCallback(() => {
    if (missed.length === 0) return;
    reviewQueueRef.current = missed.slice(0, EXAM_LENGTH).map((m) => m.question);
    setMode("mixed");
    setSession(emptySession("review"));
    setRemainingMs(null);
    setStreak(0);
    streakRef.current = 0;
    recentRef.current = [];
    nextDeltaRef.current = 0;
    pushQuestion("mixed", levels, stats, "review");
    setScreen("practice");
  }, [missed, levels, stats, pushQuestion]);

  /** סבב תיקון מיידי על הטעויות של הסשן שהסתיים */
  const startFixRound = useCallback(() => {
    const queue = session.missed.map((m) => m.question);
    if (queue.length === 0) return;
    reviewQueueRef.current = queue;
    setSession(emptySession("fix"));
    setRemainingMs(null);
    setStreak(0);
    streakRef.current = 0;
    recentRef.current = [];
    nextDeltaRef.current = 0;
    pushQuestion(mode, levels, stats, "fix");
    setScreen("practice");
  }, [session.missed, mode, levels, stats, pushQuestion]);

  const finishSession = useCallback(() => {
    flushSaves();
    feedbackFinish();
    setConfettiTick((t) => t + 1);
    setScreen("summary");
  }, []);

  const nextQuestion = useCallback(() => {
    if (session.kind === "exam" && session.answered >= EXAM_LENGTH) {
      finishSession();
      return;
    }
    if ((session.kind === "review" || session.kind === "fix") && reviewQueueRef.current.length === 0) {
      finishSession();
      return;
    }
    if (session.kind === "timed" && session.endsAt && Date.now() >= session.endsAt) {
      finishSession();
      return;
    }
    pushQuestion(mode, levels, stats, session.kind);
  }, [mode, levels, stats, session, pushQuestion, finishSession]);

  // טיימר מנה קצרה
  useEffect(() => {
    if (screen !== "practice" || !session.endsAt) return;
    const id = window.setInterval(() => {
      const left = session.endsAt! - Date.now();
      setRemainingMs(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(id);
        finishSession();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [screen, session.endsAt, finishSession]);

  const grade = useCallback(
    (isCorrect: boolean, given: string) => {
      if (!question) return;
      const elapsed = Date.now() - startTimeRef.current;
      const cat: CategoryKey = question.sourceCategory;

      setDayStreak((prev) => (practicedToday(prev) ? prev : recordPracticeDay(prev)));

      setStats((prev) => {
        const base = prev[cat];
        const updated: StatsMap = {
          ...prev,
          [cat]: {
            attempts: base.attempts + 1,
            correct: base.correct + (isCorrect ? 1 : 0),
            totalTime: base.totalTime + elapsed,
            bestTime:
              isCorrect && (base.bestTime === null || elapsed < base.bestTime)
                ? elapsed
                : base.bestTime,
          },
        };
        queueSave({ stats: updated });
        return updated;
      });

      // דרגה משתנה רק אחרי רצף — לא אחרי כל שאלה בודדת
      const cs = catStreakRef.current[cat] ?? { up: 0, down: 0 };
      if (isCorrect) {
        cs.up += 1;
        cs.down = 0;
      } else {
        cs.down += 1;
        cs.up = 0;
      }
      catStreakRef.current[cat] = cs;

      // אחרי שתי טעויות רצופות — השאלה הבאה קלה יותר
      if (!isCorrect && cs.down >= 2) nextDeltaRef.current = -1;

      // החישוב נעשה מחוץ ל-updater כדי שהאפקטים (צליל/פלאש) יופעלו פעם אחת בלבד
      let leveledUp = false;
      if (cs.up >= 3 || cs.down >= 2) {
        const current = levelsRef.current[cat] ?? 1;
        const next = cs.up >= 3 ? Math.min(current + 1, 10) : Math.max(current - 1, 1);
        if (next !== current) {
          const updated: LevelMap = { ...levelsRef.current, [cat]: next };
          levelsRef.current = updated;
          setLevels(updated);
          queueSave({ levels: updated });
        }
        if (next > current) {
          leveledUp = true;
          // רמה חדשה מתחילה מהקצה הקל שלה
          nextDeltaRef.current = -1;
        }
        catStreakRef.current[cat] = { up: 0, down: 0 };
      }

      const nextStreak = isCorrect ? streakRef.current + 1 : 0;
      streakRef.current = nextStreak;
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));

      if (isCorrect) feedbackCorrect(nextStreak);
      else feedbackWrong();
      if (!isCorrect) setComboBroke(true);
      if (isCorrect && isConfettiStreak(nextStreak)) setConfettiTick((t) => t + 1);
      if (leveledUp) {
        feedbackLevelUp();
        setConfettiTick((t) => t + 1);
        setLevelUpFlash(cat);
        window.setTimeout(() => setLevelUpFlash(null), 1600);
      }

      if (!isCorrect) {
        const entry: MissedQuestion = { question, givenAnswer: given, at: Date.now() };
        setMissed((prev) => {
          const updated = [entry, ...prev.filter((m) => m.question.signature !== question.signature)];
          queueSave({ missed: updated });
          return updated;
        });
      } else if (session.kind === "review" || session.kind === "fix") {
        setMissed((prev) => {
          const updated = prev.filter((m) => m.question.signature !== question.signature);
          queueSave({ missed: updated });
          return updated;
        });
      }

      setSession((prev) => ({
        ...prev,
        answered: prev.answered + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        totalTime: prev.totalTime + elapsed,
        missed: isCorrect
          ? prev.missed
          : [...prev.missed, { question, givenAnswer: given, at: Date.now() }],
      }));

      setFeedback({ isCorrect, elapsed, given });
    },
    [question, session.kind],
  );

  const submitNumeric = useCallback(() => {
    if (!question || feedback) return;
    if (userInput.trim() === "" || userInput.trim() === "-") return;
    grade(isAnswerCorrect(userInput, question.answer), userInput);
  }, [question, userInput, feedback, grade]);

  const handleKeypad = useCallback((key: string) => {
    setUserInput((prev) => {
      if (key === "del") return prev.slice(0, -1);
      if (key === "-") return prev.startsWith("-") ? prev.slice(1) : "-" + prev;
      if (key === ".") return prev.includes(".") ? prev : prev === "" ? "0." : prev + ".";
      if (prev.replace("-", "").length >= 9) return prev;
      return prev + key;
    });
  }, []);

  const resetStats = useCallback(() => {
    clearAll();
    saveStreak(emptyStreak());
    setStats(defaultStats());
    const freshLevels = defaultLevels();
    levelsRef.current = freshLevels;
    setLevels(freshLevels);
    setMissed([]);
    setBestStreak(0);
    setStreak(0);
    streakRef.current = 0;
    setDayStreak(emptyStreak());
    catStreakRef.current = {};
  }, []);

  const goHome = useCallback(() => {
    setScreen("home");
    setQuestion(null);
    setFeedback(null);
    setRemainingMs(null);
  }, []);

  return {
    screen,
    setScreen,
    mode,
    question,
    userInput,
    feedback,
    stats,
    levels,
    missed,
    streak,
    bestStreak,
    session,
    dayStreak,
    dayStreakValue: currentStreakValue(dayStreak),
    practicedToday: practicedToday(dayStreak),
    muted,
    toggleMuted,
    remainingMs,
    levelUpFlash,
    ready,
    startPractice,
    startReview,
    startFixRound,
    nextQuestion,
    finishSession,
    submitNumeric,
    handleKeypad,
    resetStats,
    goHome,
  };
}
