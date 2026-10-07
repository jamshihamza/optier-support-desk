// Times are stored in UTC and always shown in IST (docs/PLAN.md section 5).
const TZ = "Asia/Kolkata";

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

const dayKey = (d: Date): string => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);

export function isToday(iso: string, now: Date = new Date()): boolean {
  return dayKey(new Date(iso)) === dayKey(now);
}
