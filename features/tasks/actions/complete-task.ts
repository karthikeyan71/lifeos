"use server";

import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";

export async function updateTaskStatus(
  taskId: string,
  status: "todo" | "in_progress" | "completed" | "cancelled",
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

  const [task] = await db
    .update(tasks)
    .set({
      status,
      completedAt: status === "completed" ? new Date() : null,
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
    task,
  };
}
