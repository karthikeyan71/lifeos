import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";

export async function getTasks(userId: string) {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
}
