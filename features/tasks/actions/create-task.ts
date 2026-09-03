"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { createTaskSchema } from "../schemas/task-schema";

export async function createTask(input: unknown) {
  const validated = createTaskSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.flatten(),
    };
  }

  const task = await db
    .insert(tasks)
    .values({
      userId: "00000000-0000-0000-0000-000000000000",
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
