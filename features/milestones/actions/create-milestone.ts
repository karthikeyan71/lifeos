"use server";

import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { goals, milestones } from "@/db/schema";
import { createMilestoneSchema } from "../schemas/milestone-schema";

export async function createMilestone(goalId: string, input: unknown) {
  const validated = createMilestoneSchema.safeParse(input);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in",
    };
  }

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.flatten(),
    };
  }

  const [goal] = await db
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)));

  if (!goal) {
    return {
      success: false,
      error: "Goal not found",
    };
  }

  const milestone = await db
    .insert(milestones)
    .values({
      goalId,
      title: validated.data.title,
      description: validated.data.description,
      status: validated.data.status,
      startDate: validated.data.startDate,
      targetDate: validated.data.targetDate,
    })
    .returning();

  return {
    success: true,
    milestone: milestone[0],
  };
}
