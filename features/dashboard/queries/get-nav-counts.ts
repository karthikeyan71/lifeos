import { and, count, eq, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { goals, habits, tasks } from "@/db/schema";

/**
 * Badge counts for the sidebar / mobile nav. Uses `count(*)` per table rather
 * than loading every row just to length-filter it in JS.
 */
export async function getNavCounts(userId: string) {
  const [taskRows, goalRows, habitRows] = await Promise.all([
    db
      .select({ value: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), notInArray(tasks.status, ["completed", "cancelled"]))),
    db
      .select({ value: count() })
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active"))),
    db
      .select({ value: count() })
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true))),
  ]);

  return {
    activeTaskCount: taskRows[0]?.value ?? 0,
    activeGoalCount: goalRows[0]?.value ?? 0,
    activeHabitCount: habitRows[0]?.value ?? 0,
  };
}
