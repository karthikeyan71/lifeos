"use server";

import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { categories, habits } from "@/db/schema";
import { createHabitSchema } from "../schemas/habit-schema";

export async function createHabit(input: unknown) {
  const validated = createHabitSchema.safeParse(input);

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

  // Only allow attaching a category the user owns.
  if (validated.data.categoryId) {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, validated.data.categoryId), eq(categories.userId, user.id)));

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }
  }

  const [habit] = await db
    .insert(habits)
    .values({
      userId: user.id,
      name: validated.data.name,
      description: validated.data.description,
      frequency: validated.data.frequency,
      categoryId: validated.data.categoryId,
      startDate: validated.data.startDate,
      endDate: validated.data.endDate,
      isActive: validated.data.isActive,
    })
    .returning();

  return {
    success: true,
    habit,
  };
}
