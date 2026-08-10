const MUTE_KEY = "psychomath_prefs_v1";

let ctx: AudioContext | null = null;
let muted = false;

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(MUTE_KEY);
    if (raw) muted = Boolean((JSON.parse(raw) as { muted?: boolean }).muted);
  } catch {
    /* ברירת מחדל: קול פועל */
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUTE_KEY, JSON.stringify({ muted: next }));
  } catch {
    /* אחסון חסום */
  }
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, gain = 0.06, type: OscillatorType = "sine") {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  amp.gain.setValueAtTime(0.0001, ac.currentTime + start);
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.02);
}

/**
 * מדרגות הפיץ' מיושרות למדרגות הרטט ב-haptics.ts:
 * 1-2 · 3-4 · 5-9 · 10+
 */
export function playCorrect(streak = 1) {
  if (muted) return;
  const boost = Math.min(streak, 5) - 1;
  // מדרגה נוספת מרצף 10 ומעלה — מתאימה לרטט החזק יותר
  const peak = streak >= 10 ? 1 : 0;
  tone(660 + boost * 40 + peak * 120, 0, 0.12);
  tone(880 + boost * 55 + peak * 160, 0.09, 0.16);
  if (peak) tone(1320, 0.18, 0.14, 0.045);
}

export function playWrong() {
  if (muted) return;
  tone(240, 0, 0.16, 0.05, "triangle");
  tone(180, 0.1, 0.2, 0.04, "triangle");
}

/** סיום סשן רגיל — ארפג' עולה נקי */
export function playFinish() {
  if (muted) return;
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.22, 0.05));
}

/** עליית רמה — שני צלילי triangle קצרים */
export function playLevelUp() {
  if (muted) return;
  [587, 880].forEach((f, i) => tone(f, i * 0.1, 0.2, 0.05, "triangle"));
}

/** שיא אישי — פנפרה רחבה עם אקורד מחזיק, מובחנת משני האחרים */
export function playPersonalBest() {
  if (muted) return;
  [784, 988, 1175].forEach((f, i) => tone(f, i * 0.07, 0.18, 0.045, "square"));
  [523, 659, 784, 1046].forEach((f) => tone(f, 0.26, 0.75, 0.035, "sine"));
  tone(1568, 0.34, 0.5, 0.03, "triangle");
}
