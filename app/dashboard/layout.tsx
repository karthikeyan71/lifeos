import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/features/tasks/queries/get-tasks";
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

  const tasks = await getTasks(user.id);
  const activeTaskCount = tasks.filter(
    (task) => task.status !== "completed" && task.status !== "cancelled",
  ).length;
  const userName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  const userEmail = user.email ?? "";

  return (
    <div className="flex h-dvh overflow-hidden bg-[#faf9f6]">
      <Sidebar activeTaskCount={activeTaskCount} userName={userName} userEmail={userEmail} />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <MobileHeader userName={userName} userEmail={userEmail} />
        <div className="flex-1 pb-16 sm:pb-0">{children}</div>
      </div>
      <MobileNav activeTaskCount={activeTaskCount} />
    </div>
  );
}
