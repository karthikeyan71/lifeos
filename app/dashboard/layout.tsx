import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/features/tasks/queries/get-tasks";
import { getGoals } from "@/features/goals/queries/get-goals";
import { getHabits } from "@/features/habits/queries/get-habits";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { MobileHeader } from "@/components/mobile-header";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [tasks, goals, habits] = await Promise.all([
    getTasks(user.id),
    getGoals(user.id),
    getHabits(user.id),
  ]);
  const activeTaskCount = tasks.filter(
    (task) => task.status !== "completed" && task.status !== "cancelled",
  ).length;
  const activeGoalCount = goals.filter((goal) => goal.status === "active").length;
  const activeHabitCount = habits.filter((habit) => habit.isActive).length;
  const userName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  const userEmail = user.email ?? "";

  return (
    <div className="flex h-dvh overflow-hidden bg-[#faf9f6]">
      <Sidebar
        activeTaskCount={activeTaskCount}
        activeGoalCount={activeGoalCount}
        activeHabitCount={activeHabitCount}
        userName={userName}
        userEmail={userEmail}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <MobileHeader userName={userName} userEmail={userEmail} />
        <div className="flex-1 pb-16 sm:pb-0">{children}</div>
      </div>
      <MobileNav
        activeTaskCount={activeTaskCount}
        activeGoalCount={activeGoalCount}
        activeHabitCount={activeHabitCount}
      />
    </div>
  );
}
