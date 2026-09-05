"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Newsreader } from "next/font/google";
import { setOccurrence } from "@/features/habits/actions/set-occurrence";
import { setHabitActive } from "@/features/habits/actions/set-habit-active";
import { deleteHabit } from "@/features/habits/actions/delete-habit";
import type { HabitStats, OccurrenceStatus } from "@/features/habits/lib/stats";
import { weekdayLabel } from "@/features/habits/lib/dates";
import { HabitFormPanel, type HabitCategory } from "./habit-form-panel";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

export type HabitWithStats = {
  id: string;
  name: string;
  description: string | null;
  frequency: "daily" | "weekly";
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  todayCompletedAt: string | null;
  stats: HabitStats;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 10" fill="none" className="size-full">
      <path d="M1 5 4.3 8.3 11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

const cellStyles: Record<OccurrenceStatus | "none", string> = {
  completed: "bg-[#cfe8de] text-[#162c26]",
  missed: "bg-[#ffdad6] text-[#4a170c]",
  skipped: "bg-[#e3dfda] text-[#605e5a]",
  none: "bg-[#efeeeb] text-[#a8a29e]",
};

const cellGlyph: Record<OccurrenceStatus | "none", string> = {
  completed: "✓",
  missed: "✕",
  skipped: "–",
  none: "○",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function HabitCard({
  habit,
  today,
  categories,
}: {
  habit: HabitWithStats;
  today: string;
  categories: HabitCategory[];
}) {
  const router = useRouter();
  const { stats } = habit;

  const [isPending, setIsPending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function runOccurrence(date: string, status: OccurrenceStatus | null) {
    setIsPending(true);
    setError("");
    const result = await setOccurrence({ habitId: habit.id, date, status });
    setIsPending(false);
    if (!result.success) {
      setError(typeof result.error === "string" ? result.error : "Couldn't update the occurrence.");
      return;
    }
    router.refresh();
  }

  async function togglePause() {
    setIsMenuOpen(false);
    setError("");
    const result = await setHabitActive(habit.id, !habit.isActive);
    if (!result.success) {
      setError(typeof result.error === "string" ? result.error : "Couldn't update the habit.");
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError("");
    const result = await deleteHabit(habit.id);
    if (!result.success) {
      setIsDeleting(false);
      setError(typeof result.error === "string" ? result.error : "Couldn't delete the habit.");
      return;
    }
    router.refresh();
  }

  const frequencyLabel = habit.frequency === "daily" ? "Daily" : "Weekly";
  const sinceLabel = formatDate(habit.startDate ?? habit.createdAt.slice(0, 10));
  const completedToday = stats.todayStatus === "completed";

  return (
    <article
      className={`rounded-xl border p-5 sm:p-6 ${
        habit.isActive ? "border-[#c2c8c4]/40 bg-white shadow-sm" : "border-[#c2c8c4]/30 bg-[#f4f3f1]/50"
      }`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {habit.categoryName && (
              <span className="rounded-full bg-[#efeeeb] px-2 py-0.5 text-[11px] font-medium text-[#424845]">
                {habit.categoryName}
              </span>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">
              {frequencyLabel}
            </span>
            <span className="size-1 rounded-full bg-[#a8a29e]" />
            <span className="text-[12px] text-[#605e5a]">Since {sinceLabel}</span>
            {!habit.isActive && (
              <span className="rounded-full bg-[#e9e8e5] px-2 py-0.5 text-[11px] font-semibold text-[#605e5a]">
                Paused
              </span>
            )}
          </div>

          <h3 className={`${newsreader.className} pt-2 text-[20px] font-medium leading-[26px] tracking-[-0.01em] text-[#162c26]`}>
            {habit.name}
          </h3>
          {habit.description && (
            <p className="pt-1.5 max-w-2xl text-[13px] leading-[20px] text-[#605e5a]">{habit.description}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-[#f4f3f1]/70 p-3">
            {completedToday ? (
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#162c26]">
                <span className="flex size-4 items-center justify-center rounded-full bg-[#2c423b] text-white">
                  <span className="size-2">
                    <CheckIcon />
                  </span>
                </span>
                Completed today
                {habit.todayCompletedAt && (
                  <span className="font-normal text-[#605e5a]"> at {formatTime(habit.todayCompletedAt)}</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#424845]">
                <span className="size-2.5 rounded-full bg-[#a8a29e]" />
                {stats.todayStatus === "skipped"
                  ? "Skipped today"
                  : stats.todayStatus === "missed"
                    ? "Marked missed today"
                    : "Today's occurrence: not logged"}
              </div>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              {completedToday ? (
                <button
                  type="button"
                  onClick={() => runOccurrence(today, null)}
                  disabled={isPending}
                  className="flex h-7 items-center rounded-md px-2.5 text-[12px] font-medium text-[#605e5a] hover:bg-[#e9e8e5] disabled:opacity-50"
                >
                  Undo
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => runOccurrence(today, "completed")}
                    disabled={isPending}
                    className="flex h-7 items-center rounded-md bg-[#162c26] px-3 text-[12px] font-semibold text-white disabled:opacity-50"
                  >
                    {isPending ? "Saving…" : "Complete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => runOccurrence(today, stats.todayStatus === "skipped" ? null : "skipped")}
                    disabled={isPending}
                    className="flex h-7 items-center rounded-md px-2.5 text-[12px] font-medium text-[#605e5a] hover:bg-[#e9e8e5] disabled:opacity-50"
                  >
                    {stats.todayStatus === "skipped" ? "Unskip" : "Skip"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 rounded-lg bg-[#f4f3f1]/60 p-4 xl:w-80">
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">
                {stats.streakUnit === "week" ? "Week streak" : "Streak"}
              </span>
              <span className="text-[16px] font-semibold text-[#162c26]">
                {stats.currentStreak} {stats.streakUnit === "week" ? "wk" : "days"}
              </span>
              <span className="block text-[11px] text-[#605e5a]">
                Best {stats.longestStreak} {stats.streakUnit === "week" ? "wk" : "days"}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">
                Last 7 days
              </span>
              <span className="text-[16px] font-semibold text-[#162c26]">{stats.consistency7}%</span>
              <span className="block text-[11px] text-[#605e5a]">{stats.completedLast7} / 7 completed</span>
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">
              Past 7 occurrences
            </span>
            <div className="grid grid-cols-7 gap-1.5">
              {stats.last7.map((cell) => {
                const key = (cell.status ?? "none") as OccurrenceStatus | "none";
                return (
                  <div key={cell.date} className="flex flex-col items-center gap-1">
                    <span className={`text-[10px] ${cell.isToday ? "font-bold text-[#162c26]" : "text-[#605e5a]"}`}>
                      {weekdayLabel(cell.date)}
                    </span>
                    <button
                      type="button"
                      onClick={() => runOccurrence(cell.date, cell.status === "completed" ? null : "completed")}
                      disabled={isPending}
                      aria-label={`${formatDate(cell.date)}: ${
                        cell.status ?? "not logged"
                      }. ${cell.status === "completed" ? "Clear" : "Mark completed"}`}
                      className={`flex size-7 items-center justify-center rounded text-[11px] font-bold disabled:opacity-50 ${cellStyles[key]} ${
                        cell.isToday ? "ring-1 ring-[#2c423b]" : ""
                      }`}
                    >
                      {cellGlyph[key]}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#e9e8e5] pt-3">
        <span className="text-[12px] text-[#605e5a]">
          {habit.endDate ? `Ends ${formatDate(habit.endDate)}` : "No end date"}
          {habit.frequency === "weekly" && ` · ${stats.weekCompletedCount} this week`}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md px-2.5 py-1 text-[12px] font-medium text-[#605e5a] hover:bg-[#f4f3f1]"
          >
            Edit
          </button>
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
                <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-[#c2c8c4]/40 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={togglePause}
                    className="flex w-full items-center px-3 py-2 text-left text-[13px] font-medium text-[#1a1c1a] hover:bg-[#f4f3f1]"
                  >
                    {habit.isActive ? "Pause habit" : "Resume habit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsConfirmingDelete(true);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-[13px] font-medium text-[#b3462c] hover:bg-[#ffdad6]/30"
                  >
                    Delete habit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-[12px] font-medium text-[#ba1a1a]">{error}</p>}

      {isEditing && (
        <HabitFormPanel
          mode="edit"
          habitId={habit.id}
          categories={categories}
          initialValues={{
            name: habit.name,
            description: habit.description,
            frequency: habit.frequency,
            categoryId: habit.categoryId,
            startDate: habit.startDate,
            endDate: habit.endDate,
            isActive: habit.isActive,
          }}
          onClose={() => setIsEditing(false)}
        />
      )}

      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-[16px] font-semibold text-[#1a1c1a]">Delete habit?</h2>
            <p className="pt-2 text-[13px] text-[#605e5a]">
              &ldquo;{habit.name}&rdquo; and its full occurrence history will be permanently deleted. This can&apos;t be
              undone.
            </p>
            {error && <p className="pt-2 text-[13px] text-[#b3462c]">{error}</p>}
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
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex h-9 items-center justify-center rounded-lg bg-[#b3462c] px-4 text-[13px] font-semibold text-white disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
