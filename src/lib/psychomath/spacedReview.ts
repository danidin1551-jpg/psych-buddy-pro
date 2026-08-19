import { isDueForReview, MissedQuestion } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** תזמון יומים ספציפי: 1 → 3 → 7 → 21 → 45 */
const SCHEDULE = [1, 3, 7, 21, 45];

function nextIntervalDays(currentDays: number): number {
  const idx = SCHEDULE.indexOf(currentDays);
  if (idx !== -1 && idx < SCHEDULE.length - 1) {
    return SCHEDULE[idx + 1];
  }
  // מעבר 45 יום → מכפיל קבוע ~2.5
  return Math.round(currentDays * 2.5);
}

export interface NextIntervalResult {
  intervalDays: number;
  failCount: number;
  nextReviewAt: number;
}

/**
 * חישוב המרווח הבא לשאלה חזרתית.
 * פונקציה טהורה — קלט→פלט, ללא side effects.
 */
export function computeNextInterval(
  current: { intervalDays?: number; failCount?: number },
  wasCorrect: boolean,
  now = Date.now(),
): NextIntervalResult {
  const priorFailCount = current.failCount ?? 0;

  if (!wasCorrect) {
    const failCount = priorFailCount + 1;
    return {
      intervalDays: 1,
      failCount,
      nextReviewAt: now + MS_PER_DAY,
    };
  }

  // הצלחה: מאפסת את מונה הכישלונות הרצופים
  const failCount = 0;

  if (current.intervalDays === undefined) {
    return {
      intervalDays: 1,
      failCount,
      nextReviewAt: now + MS_PER_DAY,
    };
  }

  const intervalDays = nextIntervalDays(current.intervalDays);
  return {
    intervalDays,
    failCount,
    nextReviewAt: now + intervalDays * MS_PER_DAY,
  };
}

/**
 * מחזיר רק את השאלות שהגיע זמנן לחזרה, ממוינות מהדחופה ביותר לפחות.
 */
export function getDueReviews(
  missed: MissedQuestion[],
  now = Date.now(),
): MissedQuestion[] {
  return missed
    .filter((m) => isDueForReview(m, now))
    .sort((a, b) => {
      const aAt = a.nextReviewAt ?? now;
      const bAt = b.nextReviewAt ?? now;
      return aAt - bAt;
    });
}

/**
 * זיהוי leech: שאלה שנכשלה 3 פעמים ברצף (כולל אחרי חזרות).
 */
export function isLeech(m: MissedQuestion): boolean {
  return (m.failCount ?? 0) >= 3;
}
