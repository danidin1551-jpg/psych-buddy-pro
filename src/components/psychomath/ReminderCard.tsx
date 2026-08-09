import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import {
  formatTime,
  notificationPermission,
  requestNotificationPermission,
  saveReminder,
  type ReminderPrefs,
} from "@/lib/psychomath/reminders";

interface Props {
  prefs: ReminderPrefs;
  onChange: (next: ReminderPrefs) => void;
  practicedToday: boolean;
}

const HOURS = [7, 8, 9, 12, 15, 17, 18, 19, 20, 21, 22];

export function ReminderCard({ prefs, onChange, practicedToday }: Props) {
  const [permission, setPermission] = useState<string>("default");

  useEffect(() => {
    setPermission(notificationPermission());
  }, []);

  const update = (next: ReminderPrefs) => {
    saveReminder(next);
    onChange(next);
  };

  const toggle = async () => {
    if (prefs.enabled) {
      update({ ...prefs, enabled: false });
      return;
    }
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") update({ ...prefs, enabled: true });
  };

  const blocked = permission === "denied" || permission === "unsupported";

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {!practicedToday && (
        <p className="mb-3 rounded-xl bg-[color-mix(in_oklch,var(--accent-amber)_14%,var(--card))] px-3 py-2 text-xs text-[var(--accent-amber)]">
          עוד לא תרגלת היום — 3 דקות מספיקות כדי לשמור על הרצף.
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {prefs.enabled ? (
            <BellRing className="h-4 w-4 text-primary" />
          ) : (
            <Bell className="h-4 w-4 text-muted-foreground" />
          )}
          תזכורת יומית
        </span>
        <button
          onClick={toggle}
          disabled={blocked}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
            prefs.enabled
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          {prefs.enabled ? "פעילה" : "הפעלה"}
        </button>
      </div>

      {prefs.enabled && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <label htmlFor="reminder-hour">שעה:</label>
          <select
            id="reminder-hour"
            value={prefs.hour}
            onChange={(e) => update({ ...prefs, hour: Number(e.target.value), lastNotified: null })}
            className="rounded-lg border border-border bg-muted px-2 py-1 font-mono text-foreground"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {formatTime(h, 0)}
              </option>
            ))}
          </select>
          <span>· התזכורת נשלחת כשהאפליקציה פתוחה או ברקע בדפדפן.</span>
        </div>
      )}

      {blocked && (
        <p className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <BellOff className="h-3.5 w-3.5" />
          הדפדפן חוסם התראות — התזכורת הרכה במסך הבית עדיין פעילה.
        </p>
      )}
    </div>
  );
}
