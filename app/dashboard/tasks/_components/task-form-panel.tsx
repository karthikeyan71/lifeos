"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/features/tasks/actions/create-task";
import { updateTasks } from "@/features/tasks/actions/update-task";

type Priority = "low" | "medium" | "high";

type TaskFormPanelProps = {
  mode: "create" | "edit";
  taskId?: string;
  initialValues?: {
    title: string;
    description: string | null;
    priority: Priority;
    scheduledDate: string | null;
    dueDate: string | null;
  };
  onDone: () => void;
};

export function TaskFormPanel({ mode, taskId, initialValues, onDone }: TaskFormPanelProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? "medium");
  const [scheduledDate, setScheduledDate] = useState(initialValues?.scheduledDate ?? "");
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const input = {
      title,
      description: description || undefined,
      priority,
      scheduledDate: scheduledDate || undefined,
      dueDate: dueDate || undefined,
    };

    const result =
      mode === "create" ? await createTask(input) : await updateTasks(taskId!, input);

    setIsSubmitting(false);

    if (!result.success) {
      setError(typeof result.error === "string" ? result.error : "Something went wrong");
      return;
    }

    router.refresh();
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-[#c2c8c4]/40 bg-white p-5"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#605e5a]">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What do you want to do?"
          required
          className="h-10 rounded-lg border border-[#c2c8c4]/50 bg-[#f4f3f1]/70 px-3 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#605e5a]">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add some details..."
          rows={2}
          className="rounded-lg border border-[#c2c8c4]/50 bg-[#f4f3f1]/70 px-3 py-2 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="priority" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#605e5a]">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className="h-10 rounded-lg border border-[#c2c8c4]/50 bg-[#f4f3f1]/70 px-2 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="scheduledDate" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#605e5a]">
            Scheduled
          </label>
          <input
            id="scheduledDate"
            type="date"
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
            className="h-10 rounded-lg border border-[#c2c8c4]/50 bg-[#f4f3f1]/70 px-2 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dueDate" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#605e5a]">
            Due date
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="h-10 rounded-lg border border-[#c2c8c4]/50 bg-[#f4f3f1]/70 px-2 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
          />
        </div>
      </div>

      {error && <p className="text-[13px] text-[#b3462c]">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-9 items-center justify-center rounded-lg bg-[#162c26] px-4 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create task" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex h-9 items-center justify-center rounded-lg px-4 text-[13px] font-medium text-[#605e5a] hover:bg-[#f4f3f1]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
