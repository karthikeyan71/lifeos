import { addDays, lastNDays, startOfWeek } from "./dates";

export type OccurrenceStatus = "completed" | "missed" | "skipped";

export type DayCell = {
  date: string;
  status: OccurrenceStatus | null;
  isToday: boolean;
  isFuture: boolean;
};

export type HabitStats = {
  streakUnit: "day" | "week";
  currentStreak: number;
  longestStreak: number;
  last7: DayCell[];
  consistency7: number; // 0..100
  completedLast7: number;
  todayStatus: OccurrenceStatus | null;
  completedToday: boolean;
  weekCompletedCount: number;
  totalCompleted: number;
};

type OccurrenceInput = { date: string; status: OccurrenceStatus };

export function computeHabitStats(
  frequency: "daily" | "weekly",
  occurrences: OccurrenceInput[],
  today: string,
): HabitStats {
  const byDate = new Map<string, OccurrenceStatus>();
  for (const occ of occurrences) byDate.set(occ.date, occ.status);

  const sortedDates = [...byDate.keys()].sort();
  const totalCompleted = occurrences.filter((o) => o.status === "completed").length;

  const todayStatus = byDate.get(today) ?? null;
  const completedToday = todayStatus === "completed";

  // Last 7 calendar days strip.
  const last7: DayCell[] = lastNDays(7, today).map((date) => ({
    date,
    status: byDate.get(date) ?? null,
    isToday: date === today,
    isFuture: false,
  }));
  const completedLast7 = last7.filter((cell) => cell.status === "completed").length;
  const consistency7 = Math.round((completedLast7 / 7) * 100);

  // Current week completions (Mon-based).
  const weekStart = startOfWeek(today);
  const weekCompletedCount = occurrences.filter(
    (o) => o.status === "completed" && o.date >= weekStart && o.date <= today,
  ).length;

  if (frequency === "weekly") {
    const { current, longest } = weekStreaks(byDate, sortedDates, today);
    return {
      streakUnit: "week",
      currentStreak: current,
      longestStreak: longest,
      last7,
      consistency7,
      completedLast7,
      todayStatus,
      completedToday,
      weekCompletedCount,
      totalCompleted,
    };
  }

  const { current, longest } = dayStreaks(byDate, sortedDates, today);
  return {
    streakUnit: "day",
    currentStreak: current,
    longestStreak: longest,
    last7,
    consistency7,
    completedLast7,
    todayStatus,
    completedToday,
    weekCompletedCount,
    totalCompleted,
  };
}

function dayStreaks(
  byDate: Map<string, OccurrenceStatus>,
  sortedDates: string[],
  today: string,
): { current: number; longest: number } {
  // Current: walk back from today. `completed` extends, `skipped` is neutral,
  // `missed` or an unlogged past day breaks. Today being unlogged does not break.
  let current = 0;
  let cursor = today;
  for (let guard = 0; guard < 1000; guard += 1) {
    const status = byDate.get(cursor) ?? null;
    if (status === "completed") {
      current += 1;
    } else if (status === "skipped") {
      // neutral
    } else if (cursor === today) {
      // not logged yet today
    } else {
      break;
    }
    cursor = addDays(cursor, -1);
  }

  // Longest: scan every calendar day from the first logged day to today.
  let longest = 0;
  if (sortedDates.length > 0) {
    let run = 0;
    let day = sortedDates[0];
    for (let guard = 0; guard < 20000 && day <= today; guard += 1) {
      const status = byDate.get(day) ?? null;
      if (status === "completed") {
        run += 1;
        if (run > longest) longest = run;
      } else if (status === "skipped") {
        // neutral - keep the run
      } else {
        run = 0;
      }
      day = addDays(day, 1);
    }
  }

  return { current, longest };
}

function weekStreaks(
  byDate: Map<string, OccurrenceStatus>,
  sortedDates: string[],
  today: string,
): { current: number; longest: number } {
  const weekHasCompletion = (weekStart: string): boolean => {
    const weekEnd = addDays(weekStart, 6);
    for (const [date, status] of byDate) {
      if (status === "completed" && date >= weekStart && date <= weekEnd) return true;
    }
    return false;
  };

  // Current: from this week backwards. This week with no completion yet is
  // "in progress" (neutral); a completed past week extends; an empty past week breaks.
  let current = 0;
  let weekStart = startOfWeek(today);
  const thisWeekStart = weekStart;
  for (let guard = 0; guard < 520; guard += 1) {
    if (weekHasCompletion(weekStart)) {
      current += 1;
    } else if (weekStart === thisWeekStart) {
      // still in progress
    } else {
      break;
    }
    weekStart = addDays(weekStart, -7);
  }

  // Longest: consecutive weeks with a completion, from first logged week to now.
  let longest = 0;
  if (sortedDates.length > 0) {
    let run = 0;
    let cursor = startOfWeek(sortedDates[0]);
    const end = startOfWeek(today);
    for (let guard = 0; guard < 2600 && cursor <= end; guard += 1) {
      if (weekHasCompletion(cursor)) {
        run += 1;
        if (run > longest) longest = run;
      } else {
        run = 0;
      }
      cursor = addDays(cursor, 7);
    }
  }

  return { current, longest };
}
