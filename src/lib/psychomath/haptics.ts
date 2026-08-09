/** רטט קצר — נתמך באנדרואיד/כרום; ב-iOS פשוט לא קורה כלום */
function buzz(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (typeof nav.vibrate !== "function") return;
  try {
    nav.vibrate(pattern);
  } catch {
    /* חסום על ידי הדפדפן */
  }
}

/** עוצמת הרטט עולה עם הרצף */
export function hapticCorrect(streak = 1) {
  if (streak >= 10) buzz([18, 45, 18, 45, 32]);
  else if (streak >= 5) buzz([14, 40, 22]);
  else if (streak >= 3) buzz([12, 35, 14]);
  else buzz(10);
}

export function hapticWrong() {
  buzz([22, 60, 22]);
}

export function hapticLevelUp() {
  buzz([16, 40, 16, 40, 40]);
}

export function hapticFinish() {
  buzz([12, 40, 12, 40, 12, 40, 45]);
}
