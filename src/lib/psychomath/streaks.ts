export interface StreakData {
  current: number;
  best: number;
  lastDay: string | null;
  /** תאריכי תרגול אחרונים (YYYY-MM-DD), חדש→ישן, עד 60 */
  days: string[];
}

const STREAK_KEY = "psychomath_streak_v1";

export const emptyStreak = (): StreakData => ({
  current: 0,
  best: 0,
  lastDay: null,
  days: [],
});

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + delta);
  return dayKey(date);
}

export function loadStreak(): StreakData {
  if (typeof window === "undefined") return emptyStreak();
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (!raw) return emptyStreak();
    const parsed = JSON.parse(raw) as Partial<StreakData>;
    return { ...emptyStreak(), ...parsed, days: parsed.days ?? [] };
  } catch {
    return emptyStreak();
  }
}

export function saveStreak(data: StreakData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch {
    /* אחסון חסום — ממשיכים בזיכרון */
  }
}

/** מסמן את היום הנוכחי כיום תרגול ומעדכן את הרצף */
export function recordPracticeDay(prev: StreakData): StreakData {
  const today = dayKey();
  if (prev.lastDay === today) return prev;
  const continued = prev.lastDay === addDays(today, -1);
  const current = continued ? prev.current + 1 : 1;
  const next: StreakData = {
    current,
    best: Math.max(prev.best, current),
    lastDay: today,
    days: [today, ...prev.days.filter((d) => d !== today)].slice(0, 60),
  };
  saveStreak(next);
  return next;
}

/** מנרמל רצף שנקטע (בלי לשמור — לתצוגה בלבד) */
export function currentStreakValue(data: StreakData): number {
  if (!data.lastDay) return 0;
  const today = dayKey();
  if (data.lastDay === today || data.lastDay === addDays(today, -1)) return data.current;
  return 0;
}

export function practicedToday(data: StreakData): boolean {
  return data.lastDay === dayKey();
}

/** 7 הימים האחרונים, מהישן לחדש */
export function lastSevenDays(data: StreakData): { key: string; label: string; done: boolean }[] {
  const labels = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const out: { key: string; label: string; done: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    out.push({ key, label: labels[d.getDay()]!, done: data.days.includes(key) });
  }
  return out;
}
