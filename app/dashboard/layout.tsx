import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/features/tasks/queries/get-tasks";
import { Sidebar } from "@/components/sidebar";

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

  return (
    <div className="flex min-h-full bg-[#faf9f6]">
      <Sidebar
        activeTaskCount={activeTaskCount}
        userName={typeof user.user_metadata?.name === "string" ? user.user_metadata.name : ""}
        userEmail={user.email ?? ""}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
