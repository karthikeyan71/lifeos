"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Newsreader } from "next/font/google";
import { setOccurrence } from "@/features/habits/actions/set-occurrence";
import { HabitCard, type HabitWithStats } from "./habit-card";
import { HabitFormPanel, type HabitCategory } from "./habit-form-panel";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

type Filter = "active" | "inactive";

function PlusIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-full">
      <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 10" fill="none" className="size-full">
      <path d="M1 5 4.3 8.3 11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuickRhythm({ habit, today }: { habit: HabitWithStats; today: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const completed = habit.stats.todayStatus === "completed";

  async function toggle() {
    setIsPending(true);
    await setOccurrence({ habitId: habit.id, date: today, status: completed ? null : "completed" });
    setIsPending(false);
    router.refresh();
  }

  return (
    <div
      className={`flex flex-col justify-between rounded-lg p-4 ${
        completed ? "bg-[#f4f3f1]" : "border border-[#c2c8c4]/40 bg-white shadow-sm"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">
            {habit.frequency === "daily" ? "Daily" : "Weekly"}
          </span>
          <span className="text-[11px] font-medium text-[#605e5a]">
            {habit.stats.currentStreak}
            {habit.stats.streakUnit === "week" ? "w" : "d"} streak
          </span>
        </div>
        <h3 className="pt-1 text-[14px] font-semibold text-[#162c26]">{habit.name}</h3>
        {habit.description && (
          <p className="truncate pt-0.5 text-[12px] text-[#605e5a]">{habit.description}</p>
        )}
      </div>

      <div className="pt-4">
        {completed ? (
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#162c26]">
            <span className="flex size-4 items-center justify-center rounded-full bg-[#2c423b] text-white">
              <span className="size-2">
                <CheckIcon />
              </span>
            </span>
            Completed today
            <button
              type="button"
              onClick={toggle}
              disabled={isPending}
              className="ml-auto text-[11px] font-medium text-[#605e5a] hover:text-[#1a1c1a] disabled:opacity-50"
            >
              Undo
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={toggle}
            disabled={isPending}
            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-[#e9e8e5] text-[12px] font-semibold text-[#162c26] transition-colors hover:bg-[#2c423b] hover:text-white disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Mark complete"}
          </button>
        )}
      </div>
    </div>
  );
}

export function HabitsView({
  habits,
  categories,
  today,
}: {
  habits: HabitWithStats[];
  categories: HabitCategory[];
  today: string;
}) {
  const [filter, setFilter] = useState<Filter>("active");
  const [isCreating, setIsCreating] = useState(false);

  const activeHabits = habits.filter((h) => h.isActive);
  const inactiveHabits = habits.filter((h) => !h.isActive);
  const visibleHabits = filter === "active" ? activeHabits : inactiveHabits;

  const pendingToday = activeHabits.filter((h) => h.stats.todayStatus !== "completed");
  const doneToday = activeHabits.length - pendingToday.length;

  const todayLabel = new Date(today + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-8 p-5 sm:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2c423b]">
              Rhythms &amp; Cadence
            </span>
            <span className="size-1 rounded-full bg-[#c2c8c4]" />
            <span className="text-[12px] text-[#605e5a]">
              {habits.length} habit{habits.length === 1 ? "" : "s"} tracked
            </span>
          </div>
          <h1
            className={`${newsreader.className} text-[28px] font-medium leading-[34px] tracking-[-0.015em] text-[#162c26] sm:text-[32px] sm:leading-[40px]`}
          >
            Habits
          </h1>
          <p className="max-w-xl text-[13.5px] leading-[20px] text-[#605e5a]">
            Build consistency through small actions repeated over time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-[#c2c8c4]/40 bg-[#f4f3f1] p-0.5">
            {(
              [
                { key: "active", label: `Active ${activeHabits.length}` },
                { key: "inactive", label: `Inactive ${inactiveHabits.length}` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  filter === tab.key ? "bg-white text-[#162c26] shadow-sm" : "text-[#605e5a] hover:text-[#1a1c1a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex h-10 items-center gap-1.5 rounded-lg bg-[#162c26] px-4 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <span className="size-2.5">
              <PlusIcon />
            </span>
            Create Habit
          </button>
        </div>
      </header>

      {activeHabits.length > 0 && (
        <section className="rounded-xl border border-[#c2c8c4]/40 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#2c423b]" />
              <h2 className={`${newsreader.className} text-[18px] font-medium text-[#162c26]`}>Today&apos;s Rhythms</h2>
              <span className="rounded bg-[#efeeeb] px-2 py-0.5 text-[11px] font-medium text-[#605e5a]">{todayLabel}</span>
            </div>
            <span className="text-[12px] text-[#605e5a]">
              {doneToday} of {activeHabits.length} logged today
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {activeHabits.map((habit) => (
              <QuickRhythm key={habit.id} habit={habit} today={today} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className={`${newsreader.className} text-[20px] font-medium text-[#162c26]`}>
            {filter === "active" ? "Active Habits Ledger" : "Inactive Habits"}
          </h2>
          <span className="rounded-full bg-[#cfe8de]/60 px-2 py-0.5 text-[11px] font-semibold text-[#162c26]">
            {visibleHabits.length}
          </span>
        </div>

        {habits.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#c2c8c4]/50 p-8">
            <p className="text-[13px] text-[#605e5a]">
              No habits yet. Start with one small action you want to repeat.
            </p>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[#162c26] px-4 text-[12px] font-semibold text-white"
            >
              <span className="size-2.5">
                <PlusIcon />
              </span>
              Create Habit
            </button>
          </div>
        ) : visibleHabits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#c2c8c4]/50 p-8 text-center text-[13px] text-[#a8a29e]">
            {filter === "active" ? "No active habits right now." : "No paused habits."}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {visibleHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} today={today} categories={categories} />
            ))}
          </div>
        )}
      </div>

      {isCreating && (
        <HabitFormPanel mode="create" categories={categories} onClose={() => setIsCreating(false)} />
      )}
    </div>
  );
}
