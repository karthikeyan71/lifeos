"use client";

import { FormEvent, useEffect, useState } from "react";
import { createTask } from "@/features/tasks/actions/create-task";
import { updateTasks } from "@/features/tasks/actions/update-task";

type TaskEditFormProps = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  scheduledDate: string | null;
  dueDate: string | null;
  onCancel: () => void;
};

export function TaskEditForm({ task }: { task: TaskEditFormProps }) {
  console.log(task);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [scheduledDate, setScheduledDate] = useState(task.scheduledDate || "");
  const [dueDate, setDueDate] = useState(task.dueDate || "");

  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    const result = await updateTasks(task.id, {
      title,
      description,
      priority,
      scheduledDate: scheduledDate || undefined,
      dueDate: dueDate || undefined,
    });

    if (!result.success) {
      setMessage(result.error);
      return;
    }
    task.onCancel();
    window.location.reload();

    setMessage("Task updated successfully");

    setTitle("");
    setDescription("");
    setPriority("medium");
    setScheduledDate("");
    setDueDate("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What do you want to do?"
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add some details..."
        />
      </div>

      <div>
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label htmlFor="scheduledDate">Scheduled date</label>
        <input
          id="scheduledDate"
          type="date"
          value={scheduledDate}
          onChange={(event) => setScheduledDate(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="dueDate">Due date</label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>

      <button type="submit">Update Task</button>

      <button type="button" onClick={task.onCancel}>
        Cancel
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
