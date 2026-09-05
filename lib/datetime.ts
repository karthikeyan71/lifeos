/**
 * Helpers for the optional reminder timestamp. Unlike the date-only helpers in
 * `features/habits/lib/dates.ts`, a reminder is an absolute instant: the form
 * captures a wall-clock value, we convert it to a UTC ISO string for storage,
 * and convert back for display.
 */

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * `Date` (or ISO string) → the `YYYY-MM-DDTHH:mm` string an
 * `<input type="datetime-local">` expects, in the viewer's local time.
 */
export function toDateTimeLocalValue(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * The value from an `<input type="datetime-local">` (local wall-clock, no zone)
 * → a UTC ISO 8601 string for the server. Returns `undefined` for an empty
 * value so callers can omit the field.
 */
export function isoFromDateTimeLocalValue(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/** A reminder instant formatted for display, e.g. "Sep 8, 9:00 AM". */
export function formatReminder(value: Date | string, timeZone?: string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}
