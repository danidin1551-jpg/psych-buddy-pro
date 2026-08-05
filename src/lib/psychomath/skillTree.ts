import { CATEGORY_KEYS, type CategoryKey, type LevelMap, type StatsMap } from "./types";

export const STAGES_PER_CATEGORY = 5;

export interface Stage {
  index: number;
  name: string;
  minLevel: number;
  maxLevel: number;
  state: "done" | "active" | "locked";
}

const STAGE_NAMES = ["יסודות", "ביסוס", "התקדמות", "שליטה", "מומחיות"];

/** שלב i מכסה רמות 2i+1 עד 2i+2 */
export function stagesFor(level: number): Stage[] {
  const clamped = Math.max(1, Math.min(level, 10));
  return Array.from({ length: STAGES_PER_CATEGORY }, (_, i) => {
    const minLevel = i * 2 + 1;
    const maxLevel = i * 2 + 2;
    const state: Stage["state"] =
      clamped > maxLevel ? "done" : clamped >= minLevel ? "active" : "locked";
    return { index: i, name: STAGE_NAMES[i]!, minLevel, maxLevel, state };
  });
}

export function categoryProgress(level: number): number {
  const clamped = Math.max(1, Math.min(level, 10));
  return Math.round(((clamped - 1) / 9) * 100);
}

export function overallProgress(levels: LevelMap): number {
  const total = CATEGORY_KEYS.reduce((sum, c) => sum + categoryProgress(levels[c] ?? 1), 0);
  return Math.round(total / CATEGORY_KEYS.length);
}

export function accuracyFor(stats: StatsMap, cat: CategoryKey): number | null {
  const s = stats[cat];
  if (!s || s.attempts === 0) return null;
  return Math.round((s.correct / s.attempts) * 100);
}
