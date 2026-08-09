import { isMuted, playCorrect, playFinish, playLevelUp, playWrong } from "./sound";
import { hapticCorrect, hapticFinish, hapticLevelUp, hapticWrong } from "./haptics";

/** רמת עוצמה לפי אורך הרצף — משמשת גם לאנימציות */
export type Intensity = "soft" | "medium" | "high" | "peak";

export function intensityFor(streak: number): Intensity {
  if (streak >= 10) return "peak";
  if (streak >= 5) return "high";
  if (streak >= 3) return "medium";
  return "soft";
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

export function feedbackFinish() {
  if (isMuted()) return;
  playFinish();
  hapticFinish();
}
