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
  saveLevels,
  saveMissed,
  saveStats,
} from "@/lib/psychomath/storage";
import type {
  CategoryKey,
  LevelMap,
  MissedQuestion,
  ModeKey,
  Question,
  StatsMap,
} from "@/lib/psychomath/types";

export type Screen = "home" | "practice" | "stats" | "summary";
export type SessionKind = "endless" | "exam" | "review";

export const EXAM_LENGTH = 10;

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
}

const emptySession = (kind: SessionKind): Session => ({
  kind,
  answered: 0,
  correct: 0,
  totalTime: 0,
  missed: [],
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
  const [ready, setReady] = useState(false);

  const startTimeRef = useRef(0);
  const recentRef = useRef<string[]>([]);
  const reviewQueueRef = useRef<Question[]>([]);
  const catStreakRef = useRef<Record<string, { up: number; down: number }>>({});

  useEffect(() => {
    setStats(loadStats());
    setLevels(loadLevels());
    setMissed(loadMissed());
    setReady(true);
  }, []);

  const pushQuestion = useCallback(
    (nextMode: ModeKey, currentLevels: LevelMap, currentStats: StatsMap, kind: SessionKind) => {
      let q: Question | undefined;
      if (kind === "review") {
        q = reviewQueueRef.current.shift();
      }
      if (!q) {
        q = generateQuestion(nextMode, currentLevels, currentStats, recentRef.current);
      }
      recentRef.current = [...recentRef.current, q.signature].slice(-6);
      setQuestion(q);
      setUserInput("");
      setFeedback(null);
      startTimeRef.current = Date.now();
    },
    [],
  );

  const startPractice = useCallback(
    (nextMode: ModeKey, kind: SessionKind = "endless") => {
      setMode(nextMode);
      setSession(emptySession(kind));
      setStreak(0);
      recentRef.current = [];
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
    setStreak(0);
    recentRef.current = [];
    pushQuestion("mixed", levels, stats, "review");
    setScreen("practice");
  }, [missed, levels, stats, pushQuestion]);

  const nextQuestion = useCallback(() => {
    const isExam = session.kind === "exam";
    if (isExam && session.answered >= EXAM_LENGTH) {
      setScreen("summary");
      return;
    }
    if (session.kind === "review" && reviewQueueRef.current.length === 0) {
      setScreen("summary");
      return;
    }
    pushQuestion(mode, levels, stats, session.kind);
  }, [mode, levels, stats, session, pushQuestion]);

  const grade = useCallback(
    (isCorrect: boolean, given: string) => {
      if (!question) return;
      const elapsed = Date.now() - startTimeRef.current;
      const cat: CategoryKey = question.sourceCategory;

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
        saveStats(updated);
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
      if (cs.up >= 3 || cs.down >= 2) {
        setLevels((prev) => {
          const current = prev[cat] ?? 1;
          const next = cs.up >= 3 ? Math.min(current + 1, 10) : Math.max(current - 1, 1);
          const updated = { ...prev, [cat]: next };
          saveLevels(updated);
          return updated;
        });
        catStreakRef.current[cat] = { up: 0, down: 0 };
      }

      setStreak((prev) => {
        const next = isCorrect ? prev + 1 : 0;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });

      if (!isCorrect) {
        const entry: MissedQuestion = { question, givenAnswer: given, at: Date.now() };
        setMissed((prev) => {
          const updated = [entry, ...prev.filter((m) => m.question.signature !== question.signature)];
          saveMissed(updated);
          return updated;
        });
      } else if (session.kind === "review") {
        setMissed((prev) => {
          const updated = prev.filter((m) => m.question.signature !== question.signature);
          saveMissed(updated);
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

  const submitCompare = useCallback(
    (value: number) => {
      if (!question || feedback) return;
      grade(value === question.answer, value === 0 ? "A" : "B");
    },
    [question, feedback, grade],
  );

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
    setStats(defaultStats());
    setLevels(defaultLevels());
    setMissed([]);
    setBestStreak(0);
    catStreakRef.current = {};
  }, []);

  const goHome = useCallback(() => {
    setScreen("home");
    setQuestion(null);
    setFeedback(null);
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
    ready,
    startPractice,
    startReview,
    nextQuestion,
    submitNumeric,
    submitCompare,
    handleKeypad,
    resetStats,
    goHome,
  };
}
