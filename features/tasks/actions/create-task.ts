"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { createTaskSchema } from "../schemas/task-schema";

export async function createTask(input: unknown) {
  const validated = createTaskSchema.safeParse(input);

  // Connecting with supabse
  const supabase = await createClient();

  // Getting the user from supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Don't allow unauthenticated users to create tasks
  if (!user) {
    return {
      success: false,
      error: "You must be logged in",
    };
  }

  // Validating the input against the schema
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.flatten(),
    };
  }

  const task = await db
    .insert(tasks)
    .values({
      userId: user.id,
      title: validated.data.title,
      description: validated.data.description,
      priority: validated.data.priority,
      scheduledDate: validated.data.scheduledDate,
      dueDate: validated.data.dueDate,
      categoryId: validated.data.categoryId,
      goalId: validated.data.goalId,
      milestoneId: validated.data.milestoneId,
    })
    .returning();

  return {
    success: true,
    task: task[0],
  };
}
