"use server";

import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { goals, milestones } from "@/db/schema";

export async function deleteMilestone(milestoneId: string) {
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

  const [owned] = await db
    .select({ id: milestones.id })
    .from(milestones)
    .innerJoin(goals, eq(milestones.goalId, goals.id))
    .where(and(eq(milestones.id, milestoneId), eq(goals.userId, user.id)));

  if (!owned) {
    return {
      success: false,
      error: "Milestone not found",
    };
  }

  await db.delete(milestones).where(eq(milestones.id, milestoneId));

  return {
    success: true,
  };
}
