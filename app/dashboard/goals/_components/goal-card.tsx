"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Newsreader } from "next/font/google";
import { updateGoalStatus } from "@/features/goals/actions/update-goal-status";
import { deleteGoal } from "@/features/goals/actions/delete-goal";
import { createMilestone } from "@/features/milestones/actions/create-milestone";
import { updateMilestoneStatus } from "@/features/milestones/actions/update-milestone-status";
import { deleteMilestone } from "@/features/milestones/actions/delete-milestone";
import { formatReminder } from "@/lib/datetime";
import { GoalFormPanel } from "./goal-form-panel";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

export type GoalCardData = {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "completed" | "cancelled";
  startDate: string | null;
  targetDate: string | null;
  reminderAt: Date | string | null;
};

export type MilestoneCardData = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "completed" | "cancelled";
  targetDate: string | null;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 10" fill="none" className="size-full">
      <path d="M1 5 4.3 8.3 11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-full">
      <path d="M3 1v12M3 2h7l-1.4 2.2L10 6.5H3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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

function XIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" className="size-full">
      <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-full">
      <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 64 64" className="size-full -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e9e8e5" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#2c423b"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-[#162c26]">
        {percent}%
      </span>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const milestoneStatusLabel: Record<MilestoneCardData["status"], string> = {
  todo: "To do",
  in_progress: "In progress",
  completed: "Done",
  cancelled: "Cancelled",
};

export function GoalCard({
  goal,
  milestones,
}: {
  goal: GoalCardData;
  milestones: MilestoneCardData[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [milestoneError, setMilestoneError] = useState("");

  const isCompleted = goal.status === "completed";
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const percent = milestones.length === 0 ? 0 : Math.round((completedCount / milestones.length) * 100);
  const nextMilestone = milestones.find((m) => m.status === "todo" || m.status === "in_progress");

  async function toggleGoalStatus() {
    await updateGoalStatus(goal.id, isCompleted ? "active" : "completed");
    router.refresh();
  }

  async function handleDeleteGoal() {
    setIsDeleting(true);
    setDeleteError("");
    const result = await deleteGoal(goal.id);
    if (!result.success) {
      setIsDeleting(false);
      setDeleteError(result.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  async function toggleMilestone(milestone: MilestoneCardData) {
    await updateMilestoneStatus(milestone.id, milestone.status === "completed" ? "todo" : "completed");
    router.refresh();
  }

  async function handleRemoveMilestone(milestoneId: string) {
    await deleteMilestone(milestoneId);
    router.refresh();
  }

  async function handleAddMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    setIsAddingMilestone(true);
    setMilestoneError("");
    const result = await createMilestone(goal.id, {
      title: newMilestoneTitle,
      targetDate: newMilestoneDate || undefined,
    });
    setIsAddingMilestone(false);

    if (!result.success) {
      setMilestoneError(
        typeof result.error === "string" ? result.error : "Couldn't add milestone. Please try again.",
      );
      return;
    }

    setNewMilestoneTitle("");
    setNewMilestoneDate("");
    setIsAddingOpen(false);
    router.refresh();
  }

  return (
    <article
      className={`relative overflow-hidden rounded-xl border p-5 sm:p-6 ${
        isCompleted ? "border-[#c2c8c4]/30 bg-[#f4f3f1]/60" : "border-[#c2c8c4]/40 bg-white shadow-sm"
      }`}
    >
      <span
        aria-hidden
        className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${
          isCompleted ? "bg-[#c2c8c4]" : "bg-[#2c423b]"
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleGoalStatus}
              aria-label={isCompleted ? "Reopen goal" : "Mark goal completed"}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                isCompleted ? "bg-[#e9e8e5] text-[#605e5a]" : "bg-[#cfe8de]/60 text-[#162c26]"
              }`}
            >
              {isCompleted ? "Completed" : "Active"}
            </button>
            {goal.targetDate && (
              <span className="text-[12px] text-[#605e5a]">Target {formatDate(goal.targetDate)}</span>
            )}
            {goal.reminderAt && (
              <span className="text-[12px] text-[#605e5a]">
                Reminder {formatReminder(goal.reminderAt)}
              </span>
            )}
          </div>

          <h3
            className={`${newsreader.className} pt-2 text-[22px] font-medium leading-[28px] tracking-[-0.01em] ${
              isCompleted ? "text-[#605e5a] line-through decoration-from-font" : "text-[#162c26]"
            }`}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p className="pt-1.5 max-w-2xl text-[13px] leading-[20px] text-[#605e5a]">{goal.description}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
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
                      setIsEditing(true);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-[13px] font-medium text-[#1a1c1a] hover:bg-[#f4f3f1]"
                  >
                    Edit goal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsConfirmingDelete(true);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-[13px] font-medium text-[#b3462c] hover:bg-[#ffdad6]/30"
                  >
                    Delete goal
                  </button>
                </div>
              </>
            )}
          </div>

          {milestones.length > 0 && <ProgressRing percent={percent} />}
        </div>
      </div>

      <div className="mt-5 border-t border-[#e9e8e5] pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#605e5a]">
            Milestone Roadmap
          </span>
          {milestones.length > 0 && (
            <span className="text-[12px] text-[#605e5a]">
              {completedCount} of {milestones.length} done
            </span>
          )}
        </div>

        {milestones.length === 0 ? (
          <div className="mt-3 flex flex-col items-start gap-2 rounded-lg border border-dashed border-[#c2c8c4]/60 bg-[#f4f3f1]/40 p-4">
            <p className="text-[13px] text-[#605e5a]">
              No milestones yet. Lay down the first checkpoint that marks real progress.
            </p>
            {!isAddingOpen && (
              <button
                type="button"
                onClick={() => setIsAddingOpen(true)}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-[#162c26] px-3 text-[12px] font-semibold text-white"
              >
                <span className="size-2.5">
                  <PlusIcon />
                </span>
                Add milestone
              </button>
            )}
          </div>
        ) : (
          <>
            {nextMilestone && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f4f3f1]/70 px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2c423b]">
                  Next
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#162c26]">
                  {nextMilestone.title}
                </span>
              </div>
            )}

            <ol className="relative mt-3 pl-0.5">
              {milestones.map((milestone, index) => {
                const done = milestone.status === "completed";
                const active = milestone.status === "in_progress";
                const isLast = index === milestones.length - 1;

                return (
                  <li key={milestone.id} className="relative flex gap-3 pb-4">
                    {!isLast && (
                      <span
                        aria-hidden
                        className={`absolute left-[13px] top-7 bottom-0 w-[2px] ${
                          done ? "bg-[#2c423b]" : "bg-[#c2c8c4]/60"
                        }`}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => toggleMilestone(milestone)}
                      aria-label={done ? `Reopen milestone: ${milestone.title}` : `Complete milestone: ${milestone.title}`}
                      className={`z-10 flex size-7 shrink-0 items-center justify-center rounded-full ${
                        done
                          ? "bg-[#162c26] text-white"
                          : active
                            ? "bg-[#ffdad3] text-[#4a170c] ring-4 ring-[#ffdad3]/40"
                            : "bg-[#e9e8e5] text-[#605e5a]"
                      }`}
                    >
                      {done ? (
                        <span className="size-3">
                          <CheckIcon />
                        </span>
                      ) : active ? (
                        <span className="size-2 rounded-full bg-[#4a170c]" />
                      ) : (
                        <span className="size-3">
                          <FlagIcon />
                        </span>
                      )}
                    </button>

                    <div className="flex min-w-0 flex-1 flex-col pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`min-w-0 flex-1 truncate text-[13.5px] ${
                            done
                              ? "font-medium text-[#78716c] line-through decoration-from-font"
                              : active
                                ? "font-semibold text-[#162c26]"
                                : "font-medium text-[#424845]"
                          }`}
                        >
                          {milestone.title}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            done
                              ? "bg-[#e9e8e5] text-[#605e5a]"
                              : active
                                ? "bg-[#cfe8de]/60 text-[#162c26]"
                                : "bg-[#efeeeb] text-[#605e5a]"
                          }`}
                        >
                          {milestoneStatusLabel[milestone.status]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(milestone.id)}
                          aria-label={`Remove milestone: ${milestone.title}`}
                          className="flex size-5 shrink-0 items-center justify-center text-[#a8a29e] hover:text-[#b3462c]"
                        >
                          <span className="size-2">
                            <XIcon />
                          </span>
                        </button>
                      </div>
                      {milestone.targetDate && (
                        <span className="pt-0.5 text-[11px] text-[#605e5a]">
                          Target {formatDate(milestone.targetDate)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}

              <li className="relative flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed border-[#727875] bg-white text-[#605e5a]"
                >
                  <span className="size-2.5">
                    <PlusIcon />
                  </span>
                </span>
                {!isAddingOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingOpen(true)}
                    className="flex h-8 items-center rounded-full bg-[#f4f3f1] px-3.5 text-[12px] font-semibold text-[#162c26] hover:bg-[#e9e8e5]"
                  >
                    Add milestone
                  </button>
                ) : (
                  <span className="text-[12px] text-[#605e5a]">New checkpoint</span>
                )}
              </li>
            </ol>
          </>
        )}

        {isAddingOpen && (
          <form onSubmit={handleAddMilestone} className="mt-2 flex flex-col gap-2 rounded-lg bg-[#f4f3f1]/70 p-3 sm:flex-row sm:items-center">
            <input
              value={newMilestoneTitle}
              onChange={(event) => setNewMilestoneTitle(event.target.value)}
              placeholder="Milestone title…"
              aria-label="Milestone title"
              autoFocus
              className="h-9 flex-1 rounded-lg border border-[#c2c8c4]/50 bg-white px-3 text-[13px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
            />
            <input
              type="date"
              value={newMilestoneDate}
              onChange={(event) => setNewMilestoneDate(event.target.value)}
              aria-label="Milestone target date (optional)"
              className="h-9 rounded-lg border border-[#c2c8c4]/50 bg-white px-2 text-[13px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isAddingMilestone || !newMilestoneTitle.trim()}
                className="flex h-9 items-center justify-center rounded-lg bg-[#162c26] px-3.5 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {isAddingMilestone ? "Adding…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingOpen(false);
                  setNewMilestoneTitle("");
                  setNewMilestoneDate("");
                  setMilestoneError("");
                }}
                className="flex h-9 items-center justify-center rounded-lg px-3 text-[12px] font-medium text-[#605e5a] hover:bg-[#e9e8e5]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {milestoneError && <p className="mt-2 text-[12px] font-medium text-[#ba1a1a]">{milestoneError}</p>}
      </div>

      {isEditing && (
        <GoalFormPanel
          mode="edit"
          goalId={goal.id}
          initialValues={{
            title: goal.title,
            description: goal.description,
            startDate: goal.startDate,
            targetDate: goal.targetDate,
            reminderAt: goal.reminderAt ? new Date(goal.reminderAt).toISOString() : null,
          }}
          onClose={() => setIsEditing(false)}
        />
      )}

      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-[16px] font-semibold text-[#1a1c1a]">Delete goal?</h2>
            <p className="pt-2 text-[13px] text-[#605e5a]">
              &ldquo;{goal.title}&rdquo; and its milestones will be permanently deleted. This can&apos;t be undone.
            </p>
            {deleteError && <p className="pt-2 text-[13px] text-[#b3462c]">{deleteError}</p>}
            <div className="flex justify-end gap-2 pt-5">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
                className="flex h-9 items-center justify-center rounded-lg px-4 text-[13px] font-medium text-[#605e5a] hover:bg-[#f4f3f1] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGoal}
                disabled={isDeleting}
                className="flex h-9 items-center justify-center rounded-lg bg-[#b3462c] px-4 text-[13px] font-semibold text-white disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}