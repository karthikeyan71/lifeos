import { createClient } from "@/lib/supabase/server";
import { TaskForm } from "@/components/task-form";
import { getTasks } from "@/features/tasks/queries/get-tasks";
import { TaskItem } from "@/components/task-item";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const tasks = await getTasks(user.id);

  return (
    <main>
      <h1>LifeOS</h1>

      <p>Logged in as: {user?.email}</p>
      <h2>Create a task</h2>

      <TaskForm />
      <br />
      <br />
      <br />
      <h2>Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              priority={task.priority}
              status={task.status}
              scheduledDate={task.scheduledDate}
              dueDate={task.dueDate}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
