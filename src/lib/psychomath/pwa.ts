/** רישום ה-Service Worker של התזכורות (וגם מה שמאפשר התקנה כאפליקציה) */

let registration: ServiceWorkerRegistration | null = null;
let registering: Promise<ServiceWorkerRegistration | null> | null = null;

export function serviceWorkerSupported() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

export function registerReminderWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!serviceWorkerSupported()) return Promise.resolve(null);
  if (registration) return Promise.resolve(registration);
  if (registering) return registering;
  registering = navigator.serviceWorker
    .register("/reminder-sw.js", { scope: "/" })
    .then((reg) => {
      registration = reg;
      return reg;
    })
    .catch(() => null);
  return registering;
}

export async function getReminderWorker(): Promise<ServiceWorkerRegistration | null> {
  if (registration) return registration;
  if (!serviceWorkerSupported()) return null;
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) registration = existing;
  return registration;
}

async function activeWorker(): Promise<ServiceWorker | null> {
  const reg = (await getReminderWorker()) ?? (await registerReminderWorker());
  if (!reg) return null;
  if (reg.active) return reg.active;
  await navigator.serviceWorker.ready.catch(() => null);
  return reg.active ?? navigator.serviceWorker.controller;
}

export async function postToWorker(message: unknown) {
  const worker = await activeWorker();
  if (!worker) return false;
  worker.postMessage(message);
  return true;
}

interface PeriodicSyncManagerLike {
  register: (tag: string, options?: { minInterval: number }) => Promise<void>;
}

/** רישום periodic background sync — נתמך היום בעיקר בכרום/אנדרואיד באפליקציה מותקנת */
export async function registerPeriodicReminder(): Promise<boolean> {
  const reg = (await getReminderWorker()) ?? (await registerReminderWorker());
  const periodic = (reg as unknown as { periodicSync?: PeriodicSyncManagerLike })?.periodicSync;
  if (!reg || !periodic) return false;
  try {
    const status = await navigator.permissions
      ?.query({ name: "periodic-background-sync" as PermissionName })
      .catch(() => null);
    if (status && status.state !== "granted") return false;
    await periodic.register("psychomath-reminder", { minInterval: 12 * 60 * 60 * 1000 });
    return true;
  } catch {
    return false;
  }
}

export async function periodicSyncSupported(): Promise<boolean> {
  const reg = await getReminderWorker();
  return Boolean(reg && "periodicSync" in reg);
}
