import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { goals, habitOccurrences, habits, milestones, taskOccurrences, tasks } from "@/db/schema";

/**
 * All rows Insights needs for a user, scoped server-side. Every query joins back
 * to a user-owned table so they can all run in a single parallel round rather
 * than a fetch-ids-then-fetch-children waterfall. Occurrence tables are bounded
 * to the lookback window.
 */
export async function getInsightsData(userId: string, fromDate: string, toDate: string) {
  const [taskRows, goalRows, milestoneRows, habitRows, habitOccurrenceRows, taskOccurrenceRows] =
    await Promise.all([
      db.select().from(tasks).where(eq(tasks.userId, userId)),
      db.select().from(goals).where(eq(goals.userId, userId)),
      db
        .select({
          id: milestones.id,
          goalId: milestones.goalId,
          title: milestones.title,
          status: milestones.status,
          updatedAt: milestones.updatedAt,
        })
        .from(milestones)
        .innerJoin(goals, eq(milestones.goalId, goals.id))
        .where(eq(goals.userId, userId)),
      db.select().from(habits).where(eq(habits.userId, userId)),
      db
        .select({
          id: habitOccurrences.id,
          habitId: habitOccurrences.habitId,
          date: habitOccurrences.date,
          status: habitOccurrences.status,
          completedAt: habitOccurrences.completedAt,
        })
        .from(habitOccurrences)
        .innerJoin(habits, eq(habitOccurrences.habitId, habits.id))
        .where(
          and(
            eq(habits.userId, userId),
            gte(habitOccurrences.date, fromDate),
            lte(habitOccurrences.date, toDate),
          ),
        ),
      db
        .select({
          id: taskOccurrences.id,
          taskId: taskOccurrences.taskId,
          plannedDate: taskOccurrences.plannedDate,
          status: taskOccurrences.status,
          completedAt: taskOccurrences.completedAt,
        })
        .from(taskOccurrences)
        .innerJoin(tasks, eq(taskOccurrences.taskId, tasks.id))
        .where(
          and(
            eq(tasks.userId, userId),
            gte(taskOccurrences.plannedDate, fromDate),
            lte(taskOccurrences.plannedDate, toDate),
          ),
        ),
    ]);

  return {
    tasks: taskRows,
    goals: goalRows,
    milestones: milestoneRows,
    habits: habitRows,
    habitOccurrences: habitOccurrenceRows,
    taskOccurrences: taskOccurrenceRows,
  };
}

export type InsightsRawData = Awaited<ReturnType<typeof getInsightsData>>;
