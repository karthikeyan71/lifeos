import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { habitOccurrences, habits } from "@/db/schema";

/**
 * Occurrences for the given user's habits, limited to [fromDate, toDate] (inclusive).
 * Dates are ISO date strings (YYYY-MM-DD).
 */
export async function getHabitOccurrences(userId: string, fromDate: string, toDate: string) {
  const owned = await db
    .select({ id: habits.id })
    .from(habits)
    .where(eq(habits.userId, userId));

  const habitIds = owned.map((row) => row.id);
  if (habitIds.length === 0) return [];

  return db
    .select({
      id: habitOccurrences.id,
      habitId: habitOccurrences.habitId,
      date: habitOccurrences.date,
      status: habitOccurrences.status,
      completedAt: habitOccurrences.completedAt,
    })
    .from(habitOccurrences)
    .where(
      and(
        inArray(habitOccurrences.habitId, habitIds),
        gte(habitOccurrences.date, fromDate),
        lte(habitOccurrences.date, toDate),
      ),
    );
}
