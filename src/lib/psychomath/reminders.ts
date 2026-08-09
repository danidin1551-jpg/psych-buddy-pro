import { dayKey } from "./streaks";

const KEY = "psychomath_reminder_v1";

export interface ReminderPrefs {
  /** התראת דפדפן יומית */
  enabled: boolean;
  /** שעה ביום (0-23) */
  hour: number;
  minute: number;
  /** היום האחרון שבו כבר נשלחה תזכורת */
  lastNotified: string | null;
}

export const defaultReminder = (): ReminderPrefs => ({
  enabled: false,
  hour: 20,
  minute: 0,
  lastNotified: null,
});

export function loadReminder(): ReminderPrefs {
  if (typeof window === "undefined") return defaultReminder();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultReminder();
    return { ...defaultReminder(), ...(JSON.parse(raw) as Partial<ReminderPrefs>) };
  } catch {
    return defaultReminder();
  }
}

export function saveReminder(prefs: ReminderPrefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* אחסון חסום */
  }
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function formatTime(hour: number, minute: number) {
  return `${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`;
}

/** האם הגיע הזמן לשלוח תזכורת היום */
export function isDue(prefs: ReminderPrefs, practicedTodayFlag: boolean, now = new Date()): boolean {
  if (!prefs.enabled || practicedTodayFlag) return false;
  if (prefs.lastNotified === dayKey(now)) return false;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return minutesNow >= prefs.hour * 60 + prefs.minute;
}

/** שולח את התזכורת ומחזיר את ההעדפות המעודכנות (או null אם לא נשלח) */
export function fireReminder(prefs: ReminderPrefs): ReminderPrefs | null {
  if (notificationPermission() !== "granted") return null;
  try {
    new Notification("זמן למנה קצרה 🧠", {
      body: "3 דקות תרגול היום ישמרו על הרצף שלך.",
      tag: "psychomath-daily",
    });
  } catch {
    return null;
  }
  const next = { ...prefs, lastNotified: dayKey() };
  saveReminder(next);
  return next;
}
