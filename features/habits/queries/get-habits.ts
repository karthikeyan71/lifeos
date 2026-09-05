import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, habits } from "@/db/schema";

export async function getHabits(userId: string) {
  return db
    .select({
      id: habits.id,
      name: habits.name,
      description: habits.description,
      frequency: habits.frequency,
      startDate: habits.startDate,
      endDate: habits.endDate,
      isActive: habits.isActive,
      createdAt: habits.createdAt,
      categoryId: habits.categoryId,
      categoryName: categories.name,
    })
    .from(habits)
    .leftJoin(categories, eq(habits.categoryId, categories.id))
    .where(eq(habits.userId, userId))
    .orderBy(desc(habits.createdAt));
}
