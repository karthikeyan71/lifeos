"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus } from "@/features/tasks/actions/complete-task";
import { deleteTask } from "@/features/tasks/actions/delete-task";
import { formatReminder } from "@/lib/datetime";
import { TaskFormPanel } from "./task-form-panel";

export type TaskCardData = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "completed" | "cancelled";
  scheduledDate: string | null;
  dueDate: string | null;
  reminderAt: Date | string | null;
  completedAt: Date | string | null;
};

const priorityStyles: Record<TaskCardData["priority"], { bg: string; dot: string; text: string; label: string }> = {
  high: { bg: "bg-[#ffdad6]/60", dot: "bg-[#4a170c]", text: "text-[#4a170c]", label: "High Priority" },
  medium: { bg: "bg-[#e3dfda]", dot: "bg-[#605e5a]", text: "text-[#64625f]", label: "Medium Priority" },
  low: { bg: "bg-[#efeeeb]", dot: "bg-[#78716c]", text: "text-[#605e5a]", label: "Low Priority" },
};

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays === -1) return "yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 10" fill="none" className="size-full">
      <path d="M1 5 4.3 8.3 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-full">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 3.2V6l2 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-full">
      <path
        d="M3 5a3 3 0 0 1 6 0c0 2 .8 2.7 1 3H2c.2-.3 1-1 1-3Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M5 10.2a1 1 0 0 0 2 0" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 4 14" fill="currentColor" className="size-full">
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="2" cy="7" r="1.5" />
      <circle cx="2" cy="12" r="1.5" />
    </svg>
  );
}

export function TaskCard({ task }: { task: TaskCardData }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isCompleted = task.status === "completed";

  async function toggleStatus() {
    setIsUpdating(true);
    await updateTaskStatus(task.id, isCompleted ? "todo" : "completed");
    router.refresh();
    setIsUpdating(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError("");

    const result = await deleteTask(task.id);

    if (!result.success) {
      setIsDeleting(false);
      setDeleteError(result.error ?? "Something went wrong");
      return;
    }

    router.refresh();
  }

  if (isEditing) {
    return (
      <TaskFormPanel
        mode="edit"
        taskId={task.id}
        initialValues={{
          title: task.title,
          description: task.description,
          priority: task.priority,
          scheduledDate: task.scheduledDate,
          dueDate: task.dueDate,
          reminderAt: task.reminderAt ? new Date(task.reminderAt).toISOString() : null,
        }}
        onDone={() => setIsEditing(false)}
      />
    );
  }

  const priorityStyle = priorityStyles[task.priority];
  const dueLabel = task.dueDate ? `Due ${formatDateLabel(task.dueDate)}` : null;
  const reminderLabel = task.reminderAt ? formatReminder(task.reminderAt) : null;
  const completedLabel = task.completedAt
    ? `Completed ${new Date(task.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : null;

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
        isCompleted
          ? "border-[#c2c8c4]/30 bg-[#f4f3f1]/60 opacity-75"
          : "border-[#c2c8c4]/40 bg-white"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <button
          type="button"
          onClick={toggleStatus}
          disabled={isUpdating}
          aria-label={isCompleted ? "Reopen task" : "Mark task complete"}
          className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border ${
            isCompleted
              ? "border-[#162c26] bg-[#162c26] text-white"
              : "border-[#727875] bg-[#f4f3f1] text-transparent"
          }`}
        >
          <span className="size-2.5">
            <CheckIcon />
          </span>
        </button>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
          <span
            className={`text-[14px] font-semibold ${
              isCompleted ? "text-[#605e5a] line-through decoration-from-font" : "text-[#1a1c1a]"
            }`}
          >
            {task.title}
          </span>

          {!isCompleted && (
            <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityStyle.bg} ${priorityStyle.text}`}>
              <span className={`size-1.5 rounded-full ${priorityStyle.dot}`} />
              {priorityStyle.label}
            </span>
          )}

          {!isCompleted && dueLabel && (
            <span className="flex items-center gap-1 rounded-[4px] bg-[#efeeeb] px-2 py-0.5 text-[11px] font-medium text-[#605e5a]">
              <span className="size-2.5">
                <ClockIcon />
              </span>
              {dueLabel}
            </span>
          )}

          {!isCompleted && reminderLabel && (
            <span className="flex items-center gap-1 rounded-[4px] bg-[#efeeeb] px-2 py-0.5 text-[11px] font-medium text-[#605e5a]">
              <span className="size-2.5">
                <BellIcon />
              </span>
              {reminderLabel}
            </span>
          )}

          {isCompleted && completedLabel && (
            <span className="rounded-[4px] bg-[#efeeeb] px-2 py-0.5 text-[11px] font-medium text-[#605e5a]">
              {completedLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-70">
        {!isCompleted && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-[4px] px-2.5 py-1 text-[12px] font-medium text-[#605e5a] hover:bg-[#f4f3f1]"
          >
            Edit
          </button>
        )}
        <div className="relative">
          <button
            type="button"
            aria-label="More options"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="flex size-6 items-center justify-center rounded-[4px] text-[#605e5a] hover:bg-[#f4f3f1]"
          >
            <span className="size-3">
              <DotsIcon />
            </span>
          </button>

          {isMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-[#c2c8c4]/40 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsConfirmingDelete(true);
                  }}
                  className="flex w-full items-center px-3 py-2 text-left text-[13px] font-medium text-[#b3462c] hover:bg-[#ffdad6]/30"
                >
                  Delete task
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isConfirmingDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-[16px] font-semibold text-[#1a1c1a]">Delete task?</h2>
            <p className="pt-2 text-[13px] text-[#605e5a]">
              &ldquo;{task.title}&rdquo; will be permanently deleted. This can&apos;t be undone.
            </p>
            {deleteError && <p className="pt-2 text-[13px] text-[#b3462c]">{deleteError}</p>}
            <div className="flex justify-end gap-2 pt-5">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
                className="flex h-9 items-center justify-center rounded-lg px-4 text-[13px] font-medium text-[#605e5a] hover:bg-[#f4f3f1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex h-9 items-center justify-center rounded-lg bg-[#b3462c] px-4 text-[13px] font-semibold text-white disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
