"use server";

import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { goals } from "@/db/schema";

export async function updateGoalStatus(
  goalId: string,
  status: "active" | "completed" | "cancelled",
) {
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

  const [goal] = await db
    .update(goals)
    .set({
      status,
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
    goal,
  };
}
