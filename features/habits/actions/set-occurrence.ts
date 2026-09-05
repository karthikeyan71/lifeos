"use server";

import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { habitOccurrences, habits } from "@/db/schema";
import { setOccurrenceSchema } from "../schemas/habit-schema";

export async function setOccurrence(input: unknown) {
  const validated = setOccurrenceSchema.safeParse(input);

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

  const { habitId, date, status } = validated.data;

  // Occurrences are a record of what happened; they can't be logged ahead of time.
  // A one-day grace keeps client/server timezone differences from rejecting "today".
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + 1);
  if (date > cutoff.toISOString().slice(0, 10)) {
    return {
      success: false,
      error: "Occurrences can't be logged for a future date",
    };
  }

  const [habit] = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, user.id)));

  if (!habit) {
    return {
      success: false,
      error: "Habit not found",
    };
  }

  // Clearing the occurrence for this date.
  if (status === null) {
    await db
      .delete(habitOccurrences)
      .where(and(eq(habitOccurrences.habitId, habitId), eq(habitOccurrences.date, date)));

    return { success: true, occurrence: null };
  }

  const completedAt = status === "completed" ? new Date() : null;

  const [occurrence] = await db
    .insert(habitOccurrences)
    .values({ habitId, date, status, completedAt })
    .onConflictDoUpdate({
      target: [habitOccurrences.habitId, habitOccurrences.date],
      set: { status, completedAt },
    })
    .returning();

  return {
    success: true,
    occurrence,
  };
}
