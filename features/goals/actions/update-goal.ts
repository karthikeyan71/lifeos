"use server";

import { db } from "@/db";
import { goals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { createGoalSchema } from "../schemas/goal-schema";

export async function updateGoal(goalId: string, input: unknown) {
  const parsed = createGoalSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid goal data",
    };
  }

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

  const goal = await db
    .update(goals)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      startDate: parsed.data.startDate,
      targetDate: parsed.data.targetDate,
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
    .returning();

  if (!goal) {
    return {
      success: false,
      error: "Goal not found",
    };
  }

  return {
    success: true,
    goal: goal[0],
  };
}
