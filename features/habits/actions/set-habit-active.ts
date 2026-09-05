"use server";

import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { habits } from "@/db/schema";

export async function setHabitActive(habitId: string, isActive: boolean) {
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

  const [habit] = await db
    .update(habits)
    .set({ isActive, updatedAt: new Date() })
    .where(and(eq(habits.id, habitId), eq(habits.userId, user.id)))
    .returning();

  if (!habit) {
    return {
      success: false,
      error: "Habit not found",
    };
  }

  return {
    success: true,
    habit,
  };
}
