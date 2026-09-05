"use server";

import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { categories, habits } from "@/db/schema";
import { createHabitSchema } from "../schemas/habit-schema";

export async function updateHabit(habitId: string, input: unknown) {
  const parsed = createHabitSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid habit data",
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

  if (parsed.data.categoryId) {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, parsed.data.categoryId), eq(categories.userId, user.id)));

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }
  }

  const [habit] = await db
    .update(habits)
    .set({
      name: parsed.data.name,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
      categoryId: parsed.data.categoryId ?? null,
      startDate: parsed.data.startDate ?? null,
      endDate: parsed.data.endDate ?? null,
      isActive: parsed.data.isActive,
      updatedAt: new Date(),
    })
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
