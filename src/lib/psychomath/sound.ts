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

export function playCorrect(streak = 1) {
  if (muted) return;
  const boost = Math.min(streak, 5) - 1;
  tone(660 + boost * 40, 0, 0.12);
  tone(880 + boost * 55, 0.09, 0.16);
}

export function playWrong() {
  if (muted) return;
  tone(240, 0, 0.16, 0.05, "triangle");
  tone(180, 0.1, 0.2, 0.04, "triangle");
}

export function playFinish() {
  if (muted) return;
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.22, 0.05));
}

export function playLevelUp() {
  if (muted) return;
  [587, 880].forEach((f, i) => tone(f, i * 0.1, 0.2, 0.05, "triangle"));
}
