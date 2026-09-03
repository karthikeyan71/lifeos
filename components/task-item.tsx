"use client";

import { useState } from "react";
import { updateTaskStatus } from "@/features/tasks/actions/complete-task";
import { TaskEditForm } from "@/components/task-edit-form";

type TaskItemProps = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  scheduledDate: string | null;
  dueDate: string | null;
};

export function TaskItem({
  id,
  title,
  description,
  priority,
  status,
  scheduledDate,
  dueDate,
}: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function handleComplete() {
    setIsUpdating(true);

    await updateTaskStatus(id, "completed");

    window.location.reload();
  }

  async function handleReopen() {
    setIsUpdating(true);

    await updateTaskStatus(id, "todo");

    window.location.reload();
  }

  if (isEditing) {
    return (
      <TaskEditForm
        key={id}
        task={{
          id,
          title,
          description,
          priority: priority as "low" | "medium" | "high",
          scheduledDate,
          dueDate,
          onCancel: () => setIsEditing(false),
        }}
      />
    );
  }

  return (
    <li>
      <strong>{title}</strong>

      <span> — {priority}</span>

      {description && <p>{description}</p>}

      <p>Status: {status}</p>
      <button type="button" onClick={() => setIsEditing(true)}>
        Edit
      </button>

      {status !== "completed" ? (
        <button type="button" onClick={handleComplete} disabled={isUpdating}>
          {isUpdating ? "Completing..." : "Complete"}
        </button>
      ) : (
        <button type="button" onClick={handleReopen} disabled={isUpdating}>
          {isUpdating ? "Reopening..." : "Reopen"}
        </button>
      )}
    </li>
  );
}
