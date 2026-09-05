import { getAuthUser } from "@/lib/supabase/auth";
import { getHabits } from "@/features/habits/queries/get-habits";
import { getHabitOccurrences } from "@/features/habits/queries/get-habit-occurrences";
import { getCategories } from "@/features/categories/queries/get-categories";
import { computeHabitStats, type OccurrenceStatus } from "@/features/habits/lib/stats";
import { addDays, todayString } from "@/features/habits/lib/dates";
import { HabitsView } from "./_components/habits-view";
import type { HabitWithStats } from "./_components/habit-card";

export default async function HabitsPage() {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  const today = todayString();
  const fromDate = addDays(today, -180);

  const [habits, occurrences, categories] = await Promise.all([
    getHabits(user.id),
    getHabitOccurrences(user.id, fromDate, today),
    getCategories(user.id),
  ]);

  const occurrencesByHabit = new Map<
    string,
    { date: string; status: OccurrenceStatus; completedAt: Date | string | null }[]
  >();
  for (const occ of occurrences) {
    const list = occurrencesByHabit.get(occ.habitId) ?? [];
    list.push({ date: occ.date, status: occ.status, completedAt: occ.completedAt });
    occurrencesByHabit.set(occ.habitId, list);
  }

  const habitsWithStats: HabitWithStats[] = habits.map((habit) => {
    const habitOccurrences = occurrencesByHabit.get(habit.id) ?? [];
    const todayOccurrence = habitOccurrences.find((occ) => occ.date === today);

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      startDate: habit.startDate,
      endDate: habit.endDate,
      isActive: habit.isActive,
      reminderAt: habit.reminderAt,
      categoryId: habit.categoryId,
      categoryName: habit.categoryName,
      createdAt: habit.createdAt.toISOString(),
      todayCompletedAt:
        todayOccurrence?.status === "completed" && todayOccurrence.completedAt
          ? new Date(todayOccurrence.completedAt).toISOString()
          : null,
      stats: computeHabitStats(
        habit.frequency,
        habitOccurrences.map((occ) => ({ date: occ.date, status: occ.status })),
        today,
      ),
    };
  });

  return <HabitsView habits={habitsWithStats} categories={categories} today={today} />;
}
