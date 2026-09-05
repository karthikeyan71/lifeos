import { asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { milestones } from "@/db/schema";

export async function getMilestonesByGoalIds(goalIds: string[]) {
  if (goalIds.length === 0) return [];

  return db
    .select()
    .from(milestones)
    .where(inArray(milestones.goalId, goalIds))
    .orderBy(asc(milestones.createdAt));
}
