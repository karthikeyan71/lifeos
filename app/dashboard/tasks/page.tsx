import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/features/tasks/queries/get-tasks";
import { TasksView } from "./_components/tasks-view";

export default async function TasksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const tasks = await getTasks(user.id);
  const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name.split(" ")[0] : "";

  return (
    <TasksView
      tasks={tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        scheduledDate: task.scheduledDate,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
      }))}
      greetingName={name}
    />
  );
}
