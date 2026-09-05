"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { createGoalSchema } from "../schemas/goal-schema";

export async function createGoal(input: unknown) {
  const validated = createGoalSchema.safeParse(input);

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

  const goal = await db
    .insert(goals)
    .values({
      userId: user.id,
      title: validated.data.title,
      description: validated.data.description,
      status: validated.data.status,
      startDate: validated.data.startDate,
      targetDate: validated.data.targetDate,
      reminderAt: validated.data.reminderAt ? new Date(validated.data.reminderAt) : null,
    })
    .returning();

  return {
    success: true,
    goal: goal[0],
  };
}
