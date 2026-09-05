import { getAuthUser } from "@/lib/supabase/auth";
import { getGoals } from "@/features/goals/queries/get-goals";
import { getMilestonesByGoalIds } from "@/features/milestones/queries/get-milestones";
import { GoalsView } from "./_components/goals-view";
import type { MilestoneCardData } from "./_components/goal-card";

export default async function GoalsPage() {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  const goals = await getGoals(user.id);
  const milestones = await getMilestonesByGoalIds(goals.map((goal) => goal.id));

  const milestonesByGoalId: Record<string, MilestoneCardData[]> = {};
  for (const milestone of milestones) {
    (milestonesByGoalId[milestone.goalId] ??= []).push({
      id: milestone.id,
      title: milestone.title,
      status: milestone.status,
      targetDate: milestone.targetDate,
    });
  }

  return (
    <GoalsView
      goals={goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        startDate: goal.startDate,
        targetDate: goal.targetDate,
        reminderAt: goal.reminderAt,
      }))}
      milestonesByGoalId={milestonesByGoalId}
    />
  );
}
