import { addDays, toDateString } from "@/features/habits/lib/dates";
import { computeHabitStats } from "@/features/habits/lib/stats";
import type { InsightsRawData } from "../queries/get-insights-data";

export type InsightsPeriod = "7d" | "30d" | "90d";

export const PERIOD_DAYS: Record<InsightsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const WEEKDAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type InsightsData = {
  period: InsightsPeriod;
  rangeLabel: string;
  taskCompletion: { rate: number; completed: number; total: number };
  habitConsistency: { rate: number; completed: number; applicable: number; bestStreak: number };
  goals: {
    active: number;
    completed: number;
    milestoneRate: number;
    completedMilestones: number;
    totalMilestones: number;
  };
  statusBreakdown: { todo: number; in_progress: number; completed: number; cancelled: number };
  weekdayActivity: { label: string; completed: number }[];
  weekdayInsight: string | null;
  habitHeatmap: { date: string; done: number; total: number }[];
  activeDailyHabitCount: number;
  goalTrajectory: { id: string; title: string; rate: number; completed: number; total: number }[];
  mostConsistent: { id: string; name: string; rate: number; completed: number; applicable: number }[];
  needsAttention: { id: string; name: string; rate: number; completed: number; applicable: number }[];
  overdueTasks: { id: string; title: string; dueDate: string; daysOverdue: number }[];
  avoidance: { id: string; title: string; reason: string; detail: string }[];
  planningVsExecution: { planned: number; completed: number; source: "occurrences" | "scheduled" };
  accomplishments: {
    tasksCompleted: number;
    habitOccurrences: number;
    milestonesCompleted: number;
    goalsCompleted: number;
  };
  synthesis: string[];
};

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.min(100, Math.round((part / whole) * 100));
}

function dateOnly(value: Date | string): string {
  return typeof value === "string" ? value.slice(0, 10) : toDateString(value);
}

function formatShort(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function computeInsights(
  raw: InsightsRawData,
  period: InsightsPeriod,
  today: string,
): InsightsData {
  const days = PERIOD_DAYS[period];
  const from = addDays(today, -(days - 1));
  const inWindow = (dateStr: string | null | undefined) =>
    !!dateStr && dateStr >= from && dateStr <= today;

  // --- Tasks -------------------------------------------------------------
  const tasksInWindow = raw.tasks.filter((task) => {
    const created = dateOnly(task.createdAt);
    return (
      inWindow(task.scheduledDate) ||
      inWindow(task.dueDate) ||
      inWindow(created) ||
      (task.completedAt ? inWindow(dateOnly(task.completedAt)) : false)
    );
  });

  const completedInWindow = tasksInWindow.filter((task) => task.status === "completed");
  const taskCompletion = {
    completed: completedInWindow.length,
    total: tasksInWindow.length,
    rate: pct(completedInWindow.length, tasksInWindow.length),
  };

  const statusBreakdown = { todo: 0, in_progress: 0, completed: 0, cancelled: 0 };
  for (const task of tasksInWindow) statusBreakdown[task.status] += 1;

  // Completions bucketed by weekday (Mon..Sun).
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const task of raw.tasks) {
    if (!task.completedAt) continue;
    const completedDate = dateOnly(task.completedAt);
    if (!inWindow(completedDate)) continue;
    const jsDay = new Date(completedDate + "T00:00:00").getDay(); // 0 = Sun
    weekdayCounts[(jsDay + 6) % 7] += 1; // 0 = Mon
  }
  const weekdayActivity = WEEKDAY_ORDER.map((label, index) => ({
    label,
    completed: weekdayCounts[index],
  }));

  const weekdayTotal = weekdayCounts.slice(0, 5).reduce((a, b) => a + b, 0);
  const weekendTotal = weekdayCounts.slice(5).reduce((a, b) => a + b, 0);
  const weekdayAvg = weekdayTotal / 5;
  const weekendAvg = weekendTotal / 2;
  let weekdayInsight: string | null = null;
  if (weekdayAvg > 0 && weekendAvg > 0 && weekdayAvg > weekendAvg) {
    weekdayInsight = `You complete ${Math.round(((weekdayAvg - weekendAvg) / weekendAvg) * 100)}% more work on weekdays than weekends.`;
  } else if (weekdayAvg > 0 && weekendAvg === 0 && weekdayTotal + weekendTotal >= 3) {
    weekdayInsight = "Your completions cluster on weekdays; weekends stay clear.";
  }

  const overdueTasks = raw.tasks
    .filter(
      (task) =>
        task.dueDate &&
        task.dueDate < today &&
        task.status !== "completed" &&
        task.status !== "cancelled",
    )
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate as string,
      daysOverdue: daysBetween(task.dueDate as string, today),
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 6);

  // --- Goals & milestones ---------------------------------------------------
  const activeGoals = raw.goals.filter((goal) => goal.status === "active");
  const completedGoals = raw.goals.filter((goal) => goal.status === "completed");
  const milestonesByGoal = new Map<string, typeof raw.milestones>();
  for (const milestone of raw.milestones) {
    const list = milestonesByGoal.get(milestone.goalId) ?? [];
    list.push(milestone);
    milestonesByGoal.set(milestone.goalId, list);
  }

  const activeGoalMilestones = activeGoals.flatMap((goal) => milestonesByGoal.get(goal.id) ?? []);
  const completedMilestones = activeGoalMilestones.filter((m) => m.status === "completed").length;

  const goalTrajectory = activeGoals
    .map((goal) => {
      const list = milestonesByGoal.get(goal.id) ?? [];
      const done = list.filter((m) => m.status === "completed").length;
      return {
        id: goal.id,
        title: goal.title,
        completed: done,
        total: list.length,
        rate: pct(done, list.length),
      };
    })
    .sort((a, b) => b.rate - a.rate);

  // --- Habits -------------------------------------------------------------
  const occurrencesByHabit = new Map<string, { date: string; status: "completed" | "missed" | "skipped" }[]>();
  for (const occ of raw.habitOccurrences) {
    const list = occurrencesByHabit.get(occ.habitId) ?? [];
    list.push({ date: occ.date, status: occ.status });
    occurrencesByHabit.set(occ.habitId, list);
  }

  const relevantHabits = raw.habits.filter(
    (habit) => habit.isActive || (occurrencesByHabit.get(habit.id)?.length ?? 0) > 0,
  );

  const habitBreakdown = relevantHabits.map((habit) => {
    const occ = occurrencesByHabit.get(habit.id) ?? [];
    const windowStart =
      habit.startDate && habit.startDate > from ? habit.startDate : from;
    const windowEnd = habit.endDate && habit.endDate < today ? habit.endDate : today;
    const applicableDays = windowEnd >= windowStart ? daysBetween(windowStart, windowEnd) + 1 : 0;
    const applicable =
      habit.frequency === "weekly" ? Math.max(1, Math.ceil(applicableDays / 7)) : applicableDays;
    const completed = occ.filter(
      (o) => o.status === "completed" && o.date >= windowStart && o.date <= windowEnd,
    ).length;
    const stats = computeHabitStats(habit.frequency, occ, today);
    return {
      id: habit.id,
      name: habit.name,
      frequency: habit.frequency,
      isActive: habit.isActive,
      applicable,
      completed: Math.min(completed, applicable || completed),
      rate: pct(completed, applicable),
      currentStreak: stats.currentStreak,
    };
  });

  const totalApplicable = habitBreakdown.reduce((sum, h) => sum + h.applicable, 0);
  const totalCompleted = habitBreakdown.reduce((sum, h) => sum + h.completed, 0);
  const bestStreak = habitBreakdown.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  const rankable = habitBreakdown.filter((h) => h.applicable >= Math.min(3, days));
  const mostConsistent = [...rankable]
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3)
    .map(({ id, name, rate, completed, applicable }) => ({ id, name, rate, completed, applicable }));
  const needsAttention = [...rankable]
    .filter((h) => h.rate < 60)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3)
    .map(({ id, name, rate, completed, applicable }) => ({ id, name, rate, completed, applicable }));

  // Heatmap: last min(days, 35) calendar days, ratio of active daily habits completed.
  const activeDailyHabits = raw.habits.filter((h) => h.isActive && h.frequency === "daily");
  const heatmapDays = Math.min(days, 35);
  const habitHeatmap = [] as { date: string; done: number; total: number }[];
  for (let i = heatmapDays - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i);
    let done = 0;
    for (const habit of activeDailyHabits) {
      const occ = occurrencesByHabit.get(habit.id);
      if (occ?.some((o) => o.date === date && o.status === "completed")) done += 1;
    }
    habitHeatmap.push({ date, done, total: activeDailyHabits.length });
  }

  // --- Avoidance patterns ------------------------------------------------
  const occByTask = new Map<string, { postponed: number; skipped: number }>();
  for (const occ of raw.taskOccurrences) {
    const entry = occByTask.get(occ.taskId) ?? { postponed: 0, skipped: 0 };
    if (occ.status === "postponed") entry.postponed += 1;
    if (occ.status === "skipped") entry.skipped += 1;
    occByTask.set(occ.taskId, entry);
  }
  const taskById = new Map(raw.tasks.map((task) => [task.id, task]));
  const avoidance: InsightsData["avoidance"] = [];

  for (const [taskId, counts] of occByTask) {
    const task = taskById.get(taskId);
    if (!task || task.status === "completed" || task.status === "cancelled") continue;
    const moves = counts.postponed + counts.skipped;
    if (moves >= 1) {
      avoidance.push({
        id: taskId,
        title: task.title,
        reason: counts.postponed >= counts.skipped ? `Postponed ${counts.postponed}x` : `Skipped ${counts.skipped}x`,
        detail: `Created ${daysBetween(dateOnly(task.createdAt), today)}d ago`,
      });
    }
  }

  for (const task of raw.tasks) {
    if (task.status === "completed" || task.status === "cancelled") continue;
    if (avoidance.some((item) => item.id === task.id)) continue;
    const ageDays = daysBetween(dateOnly(task.createdAt), today);
    const staleDays = daysBetween(dateOnly(task.updatedAt), today);
    if (task.dueDate && task.dueDate < today && ageDays >= 10) {
      avoidance.push({
        id: task.id,
        title: task.title,
        reason: `Stalled ${staleDays}d`,
        detail: "Past due date",
      });
    } else if (staleDays >= 14 && ageDays >= 14) {
      avoidance.push({
        id: task.id,
        title: task.title,
        reason: `${staleDays}d inactive`,
        detail: "No recent movement",
      });
    }
  }
  avoidance.splice(5);

  // --- Planning vs execution ------------------------------------------------
  let planningVsExecution: InsightsData["planningVsExecution"];
  if (raw.taskOccurrences.length > 0) {
    const planned = raw.taskOccurrences.filter((o) => inWindow(o.plannedDate)).length;
    const done = raw.taskOccurrences.filter(
      (o) => inWindow(o.plannedDate) && o.status === "completed",
    ).length;
    planningVsExecution = { planned, completed: done, source: "occurrences" };
  } else {
    const scheduled = raw.tasks.filter((task) => inWindow(task.scheduledDate));
    planningVsExecution = {
      planned: scheduled.length,
      completed: scheduled.filter((task) => task.status === "completed").length,
      source: "scheduled",
    };
  }

  // --- Accomplishments -------------------------------------------------------
  const accomplishments = {
    tasksCompleted: raw.tasks.filter(
      (task) => task.completedAt && inWindow(dateOnly(task.completedAt)),
    ).length,
    habitOccurrences: raw.habitOccurrences.filter(
      (occ) => occ.status === "completed" && inWindow(occ.date),
    ).length,
    milestonesCompleted: raw.milestones.filter(
      (m) => m.status === "completed" && inWindow(dateOnly(m.updatedAt)),
    ).length,
    goalsCompleted: raw.goals.filter(
      (goal) => goal.status === "completed" && inWindow(dateOnly(goal.updatedAt)),
    ).length,
  };

  // --- Synthesis (templated from the numbers above) -----------------------
  const synthesis: string[] = [];
  if (taskCompletion.total > 0) {
    synthesis.push(
      `You completed ${taskCompletion.completed} of ${taskCompletion.total} tracked tasks (${taskCompletion.rate}%)` +
        (totalApplicable > 0
          ? ` and held ${pct(totalCompleted, totalApplicable)}% habit consistency.`
          : "."),
    );
  } else if (totalApplicable > 0) {
    synthesis.push(`You held ${pct(totalCompleted, totalApplicable)}% habit consistency over this window.`);
  }
  const leadGoal = goalTrajectory.find((goal) => goal.total > 0);
  if (leadGoal) {
    synthesis.push(`"${leadGoal.title}" leads your goals at ${leadGoal.rate}% of milestones (${leadGoal.completed}/${leadGoal.total}).`);
  }
  if (weekdayInsight) synthesis.push(weekdayInsight);
  if (overdueTasks.length > 0) {
    synthesis.push(
      `${overdueTasks.length} task${overdueTasks.length === 1 ? " is" : "s are"} past due — clarifying the next step will reduce friction.`,
    );
  }

  const habitConsistency = {
    completed: totalCompleted,
    applicable: totalApplicable,
    rate: pct(totalCompleted, totalApplicable),
    bestStreak,
  };

  return {
    period,
    rangeLabel: `${formatShort(from)} – ${formatShort(today)}`,
    taskCompletion,
    habitConsistency,
    goals: {
      active: activeGoals.length,
      completed: completedGoals.length,
      milestoneRate: pct(completedMilestones, activeGoalMilestones.length),
      completedMilestones,
      totalMilestones: activeGoalMilestones.length,
    },
    statusBreakdown,
    weekdayActivity,
    weekdayInsight,
    habitHeatmap,
    activeDailyHabitCount: activeDailyHabits.length,
    goalTrajectory,
    mostConsistent,
    needsAttention,
    overdueTasks,
    avoidance,
    planningVsExecution,
    accomplishments,
    synthesis,
  };
}

function daysBetween(fromStr: string, toStr: string): number {
  const [fy, fm, fd] = fromStr.split("-").map(Number);
  const [ty, tm, td] = toStr.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / 86_400_000);
}
