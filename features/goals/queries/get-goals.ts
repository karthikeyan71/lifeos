import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { goals } from "@/db/schema";

export async function getGoals(userId: string) {
  return db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt));
}
