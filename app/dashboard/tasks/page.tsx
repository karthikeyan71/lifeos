import { getAuthUser } from "@/lib/supabase/auth";
import { getTasks } from "@/features/tasks/queries/get-tasks";
import { TasksView } from "./_components/tasks-view";

export default async function TasksPage() {
  const user = await getAuthUser();

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
        reminderAt: task.reminderAt,
        completedAt: task.completedAt,
      }))}
      greetingName={name}
    />
  );
}
