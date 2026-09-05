import { getAuthUser } from "@/lib/supabase/auth";
import { getNavCounts } from "@/features/dashboard/queries/get-nav-counts";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { MobileHeader } from "@/components/mobile-header";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  const { activeTaskCount, activeGoalCount, activeHabitCount } = await getNavCounts(user.id);
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
