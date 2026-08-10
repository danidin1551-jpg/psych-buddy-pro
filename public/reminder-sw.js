/*
 * Service Worker לתזכורות בלבד — אין כאן שום מטמון של האפליקציה (אין fetch handler),
 * ולכן הוא לא יכול להגיש תוכן ישן.
 */

const STORE = "psychomath-reminder-store";
const PREFS_URL = "/__reminder-prefs";
const TAG = "psychomath-daily";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

async function readPrefs() {
  try {
    const cache = await caches.open(STORE);
    const res = await cache.match(PREFS_URL);
    if (!res) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function writePrefs(prefs) {
  const cache = await caches.open(STORE);
  await cache.put(PREFS_URL, new Response(JSON.stringify(prefs)));
}

function dayKey(d = new Date()) {
  const p = (n) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function maybeNotify(force = false) {
  const prefs = await readPrefs();
  if (!prefs || !prefs.enabled) return;
  const today = dayKey();
  if (!force) {
    if (prefs.lastNotified === today) return;
    if (prefs.practicedDay === today) return;
    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    if (minutesNow < prefs.hour * 60 + (prefs.minute || 0)) return;
  }
  await self.registration.showNotification("זמן למנה קצרה 🧠", {
    body: "3 דקות תרגול היום ישמרו על הרצף שלך.",
    tag: TAG,
    dir: "rtl",
    lang: "he",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: "/" },
  });
  await writePrefs({ ...prefs, lastNotified: today });
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "reminder:prefs") {
    event.waitUntil(writePrefs(data.prefs).then(() => maybeNotify()));
  } else if (data.type === "reminder:check") {
    event.waitUntil(maybeNotify());
  } else if (data.type === "reminder:test") {
    event.waitUntil(maybeNotify(true));
  }
});

// נתמך היום בעיקר ב-Chrome/Android לאפליקציות מותקנות
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "psychomath-reminder") event.waitUntil(maybeNotify());
});

self.addEventListener("sync", (event) => {
  if (event.tag === "psychomath-reminder") event.waitUntil(maybeNotify());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = all.find((c) => "focus" in c);
      if (existing) return existing.focus();
      return self.clients.openWindow("/");
    })(),
  );
});
