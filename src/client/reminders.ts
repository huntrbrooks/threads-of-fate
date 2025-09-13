import { listSaved, updateReading, type SavedReading } from "./storage";

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try { return await Notification.requestPermission(); } catch { return "denied"; }
}

export function canNotify(): boolean {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
}

function showNotification(title: string, options?: NotificationOptions) {
  try {
    if (!canNotify()) return;
    new Notification(title, {
      body: options?.body,
      icon: options?.icon || "/favicon.ico",
      tag: options?.tag || "tof-reminder",
    });
  } catch {}
}

let watcherStarted = false;
export function startReminderWatcher(intervalMs = 60000) {
  if (watcherStarted) return;
  watcherStarted = true;
  const tick = () => {
    const now = Date.now();
    const list = listSaved();
    for (const r of list) {
      if (!r.reminderAt) continue;
      const due = new Date(r.reminderAt).getTime();
      if (isNaN(due)) continue;
      const already = r.remindedAt ? new Date(r.remindedAt).getTime() : 0;
      if (due <= now && (!already || already < due)) {
        showNotification(r.output?.headline || "Reading reminder", { body: r.output?.summary || "Open your saved reading." });
        updateReading(r.id, { remindedAt: new Date().toISOString() });
      }
    }
  };
  // run once soon, then on interval
  setTimeout(tick, 2000);
  setInterval(tick, intervalMs);
}

export function createICS(reading: SavedReading, startIso: string): string {
  const uid = `${reading.id}@threadsoffate.local`;
  const dtStart = new Date(startIso);
  const dtEnd = new Date(dtStart.getTime() + 30 * 60 * 1000); // 30 min block
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Threads of Fate//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dtStart)}`,
    `DTEND:${fmt(dtEnd)}`,
    `SUMMARY:${escapeText(reading.output?.headline || "Tarot Reading Reminder")}`,
    `DESCRIPTION:${escapeText(reading.output?.summary || "Open your saved reading in Threads of Fate.")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => (m === "," ? "\\," : "\\;"));
}

