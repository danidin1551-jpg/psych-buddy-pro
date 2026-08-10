import { dayKey } from "./streaks";
import { getReminderWorker, postToWorker, registerPeriodicReminder, registerReminderWorker } from "./pwa";

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
    const result = await Notification.requestPermission();
    if (result === "granted") {
      await registerReminderWorker();
      await registerPeriodicReminder();
    }
    return result;
  } catch {
    return Notification.permission;
  }
}

export function formatTime(hour: number, minute: number) {
  return `${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`;
}

/** מסנכרן את ההעדפות אל ה-Service Worker כדי שיוכל להתריע גם כשהאפליקציה סגורה */
export function syncReminderToWorker(prefs: ReminderPrefs, practicedTodayFlag: boolean) {
  void postToWorker({
    type: "reminder:prefs",
    prefs: {
      enabled: prefs.enabled,
      hour: prefs.hour,
      minute: prefs.minute,
      lastNotified: prefs.lastNotified,
      practicedDay: practicedTodayFlag ? dayKey() : null,
    },
  });
}

/** האם הגיע הזמן לשלוח תזכורת היום */
export function isDue(prefs: ReminderPrefs, practicedTodayFlag: boolean, now = new Date()): boolean {
  if (!prefs.enabled || practicedTodayFlag) return false;
  if (prefs.lastNotified === dayKey(now)) return false;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return minutesNow >= prefs.hour * 60 + prefs.minute;
}

/**
 * שולח את התזכורת ומחזיר את ההעדפות המעודכנות (או null אם לא נשלח).
 * מנסה קודם דרך ה-Service Worker (עובד גם ברקע), ונופל להתראה רגילה מהעמוד.
 */
export function fireReminder(prefs: ReminderPrefs): ReminderPrefs | null {
  if (notificationPermission() !== "granted") return null;
  const body = "3 דקות תרגול היום ישמרו על הרצף שלך.";
  const title = "זמן למנה קצרה 🧠";
  void (async () => {
    const reg = await getReminderWorker();
    if (reg) {
      try {
        await reg.showNotification(title, {
          body,
          tag: "psychomath-daily",
          dir: "rtl",
          lang: "he",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
        });
        return;
      } catch {
        /* נופלים להתראה רגילה */
      }
    }
    try {
      new Notification(title, { body, tag: "psychomath-daily" });
    } catch {
      /* חסום */
    }
  })();
  const next = { ...prefs, lastNotified: dayKey() };
  saveReminder(next);
  return next;
}
