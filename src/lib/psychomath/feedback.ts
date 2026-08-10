import { isMuted, playCorrect, playFinish, playLevelUp, playPersonalBest, playWrong } from "./sound";
import { hapticCorrect, hapticFinish, hapticLevelUp, hapticRecord, hapticWrong } from "./haptics";

/** רמת עוצמה לפי אורך הרצף — משמשת גם לאנימציות */
export type Intensity = "soft" | "medium" | "high" | "peak";

export function intensityFor(streak: number): Intensity {
  if (streak >= 10) return "peak";
  if (streak >= 5) return "high";
  if (streak >= 3) return "medium";
  return "soft";
}

/** 0→1 — מזין את המשתנה --combo-intensity שמניע את כדור האורורה */
export function comboIntensity(streak: number): number {
  return Math.min(1, streak / 12);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** נקודות שבהן מגיע קונפטי: רצף 10, עליית רמה, סיום סשן */
export function isConfettiStreak(streak: number): boolean {
  return streak > 0 && streak % 10 === 0;
}

export function feedbackCorrect(streak: number) {
  if (isMuted()) return;
  playCorrect(streak);
  hapticCorrect(streak);
}

export function feedbackWrong() {
  if (isMuted()) return;
  playWrong();
  hapticWrong();
}

export function feedbackLevelUp() {
  if (isMuted()) return;
  playLevelUp();
  hapticLevelUp();
}

/** סיום סשן — צליל אחר לגמרי כשנשבר שיא אישי */
export function feedbackFinish(isPersonalBest = false) {
  if (isMuted()) return;
  if (isPersonalBest) {
    playPersonalBest();
    hapticRecord();
    return;
  }
  playFinish();
  hapticFinish();
}
