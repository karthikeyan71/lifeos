/**
 * Helpers for date-only (YYYY-MM-DD) values, matching the `date` columns in the
 * schema. All arithmetic stays in calendar-day space to avoid timezone drift.
 */

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

export function addDays(dateStr: string, amount: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return toDateString(date);
}

/** N consecutive date strings ending at (and including) `endStr`, oldest first. */
export function lastNDays(count: number, endStr: string): string[] {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    days.push(addDays(endStr, -i));
  }
  return days;
}

/** Monday-based start of the ISO week containing `dateStr`. */
export function startOfWeek(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = (date.getDay() + 6) % 7; // Mon = 0 ... Sun = 6
  return addDays(dateStr, -weekday);
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export function weekdayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];
}
