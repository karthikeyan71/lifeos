"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { createTaskSchema } from "../schemas/task-schema";

export async function updateTasks(taskId: string, input: unknown) {
  const parsed = createTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid task data",
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

  const task = await db
    .update(tasks)
    .set({
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      scheduledDate: parsed.data.scheduledDate,
      dueDate: parsed.data.dueDate,
      reminderAt: parsed.data.reminderAt ? new Date(parsed.data.reminderAt) : null,
      categoryId: parsed.data.categoryId,
      goalId: parsed.data.goalId,
      milestoneId: parsed.data.milestoneId,
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
    .returning();

  if (!task) {
    return {
      success: false,
      error: "Task not found",
    };
  }

  return {
    success: true,
    task: task[0],
  };
}
