"use client";

import { FormEvent, useState } from "react";
import { createTask } from "@/features/tasks/actions/create-task";

export function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [scheduledDate, setScheduledDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    const result = await createTask({
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

    setMessage("Task created successfully");

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

      <button type="submit">Create Task</button>

      {message && <p>{message}</p>}
    </form>
  );
}
