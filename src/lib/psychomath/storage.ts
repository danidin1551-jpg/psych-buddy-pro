import {
  CATEGORY_KEYS,
  type CategoryKey,
  type LevelMap,
  type MissedQuestion,
  type StatsMap,
} from "./types";

const STATS_KEY = "psychomath_stats_v3";
const LEVELS_KEY = "psychomath_levels_v3";
const MISSED_KEY = "psychomath_missed_v3";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* מצב פרטי / אחסון מלא — ממשיכים בזיכרון בלבד */
  }
}

export function defaultStats(): StatsMap {
  return Object.fromEntries(
    CATEGORY_KEYS.map((k) => [k, { attempts: 0, correct: 0, totalTime: 0, bestTime: null }]),
  ) as StatsMap;
}

export function defaultLevels(): LevelMap {
  return Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 1])) as LevelMap;
}

export function loadStats(): StatsMap {
  const raw = safeGet(STATS_KEY);
  if (!raw) return defaultStats();
  try {
    return { ...defaultStats(), ...(JSON.parse(raw) as StatsMap) };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: StatsMap) {
  safeSet(STATS_KEY, JSON.stringify(stats));
}

export function loadLevels(): LevelMap {
  const raw = safeGet(LEVELS_KEY);
  if (!raw) return defaultLevels();
  try {
    return { ...defaultLevels(), ...(JSON.parse(raw) as LevelMap) };
  } catch {
    return defaultLevels();
  }
}

export function saveLevels(levels: LevelMap) {
  safeSet(LEVELS_KEY, JSON.stringify(levels));
}

export function loadMissed(): MissedQuestion[] {
  const raw = safeGet(MISSED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MissedQuestion[];
    return Array.isArray(parsed) ? parsed.slice(0, 50) : [];
  } catch {
    return [];
  }
}

export function saveMissed(missed: MissedQuestion[]) {
  safeSet(MISSED_KEY, JSON.stringify(missed.slice(0, 50)));
}

export function clearAll() {
  saveStats(defaultStats());
  saveLevels(defaultLevels());
  saveMissed([]);
}

export type { CategoryKey };
