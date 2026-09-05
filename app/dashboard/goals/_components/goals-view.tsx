"use client";

import { useState } from "react";
import { Newsreader } from "next/font/google";
import { GoalCard, type GoalCardData, type MilestoneCardData } from "./goal-card";
import { GoalFormPanel } from "./goal-form-panel";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

type Filter = "active" | "completed";

function PlusIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-full">
      <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  unit,
  percent,
}: {
  label: string;
  value: string;
  unit: string;
  percent: number;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#c2c8c4]/40 bg-white p-4 shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">{label}</span>
      <div className="flex items-baseline gap-1.5 pt-3">
        <span className={`${newsreader.className} text-[26px] font-medium leading-none text-[#162c26]`}>
          {value}
        </span>
        <span className="text-[12px] text-[#605e5a]">{unit}</span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#e9e8e5]">
        <div className="h-full rounded-full bg-[#2c423b]" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
    </div>
  );
}

export function GoalsView({
  goals,
  milestonesByGoalId,
}: {
  goals: GoalCardData[];
  milestonesByGoalId: Record<string, MilestoneCardData[]>;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<Filter>("active");

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const allMilestones = Object.values(milestonesByGoalId).flat();
  const completedMilestones = allMilestones.filter((m) => m.status === "completed").length;
  const overallProgress =
    allMilestones.length === 0 ? 0 : Math.round((completedMilestones / allMilestones.length) * 100);

  const visibleGoals = filter === "active" ? activeGoals : completedGoals;

  return (
    <div className="flex flex-col gap-8 p-5 sm:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2c423b]">
              Life Architecture
            </span>
            <span className="size-1 rounded-full bg-[#c2c8c4]" />
            <span className="text-[12px] text-[#605e5a]">
              {goals.length} strategic objective{goals.length === 1 ? "" : "s"}
            </span>
          </div>
          <h1
            className={`${newsreader.className} text-[28px] font-medium leading-[34px] tracking-[-0.015em] text-[#162c26] sm:text-[32px] sm:leading-[40px]`}
          >
            Intentional Pursuits
          </h1>
          <p className="max-w-xl text-[13.5px] leading-[20px] text-[#605e5a]">
            Long-range arcs, broken into milestones you can actually finish. Steady progress over urgency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-[#c2c8c4]/40 bg-[#f4f3f1] p-0.5">
            {(
              [
                { key: "active", label: `Active ${activeGoals.length}` },
                { key: "completed", label: `Completed ${completedGoals.length}` },
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
            Create Goal
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active Trajectory"
          value={String(activeGoals.length)}
          unit={activeGoals.length === 1 ? "goal in motion" : "goals in motion"}
          percent={goals.length === 0 ? 0 : (activeGoals.length / goals.length) * 100}
        />
        <StatCard
          label="Completed"
          value={String(completedGoals.length)}
          unit={completedGoals.length === 1 ? "goal" : "goals"}
          percent={goals.length === 0 ? 0 : (completedGoals.length / goals.length) * 100}
        />
        <StatCard
          label="Milestones Met"
          value={`${completedMilestones}/${allMilestones.length}`}
          unit="checkpoints"
          percent={overallProgress}
        />
        <StatCard
          label="Milestone Progress"
          value={`${overallProgress}%`}
          unit="on track"
          percent={overallProgress}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className={`${newsreader.className} text-[20px] font-medium text-[#162c26]`}>
            {filter === "active" ? "Active Goals" : "Completed Goals"}
          </h2>
          <span className="rounded-full bg-[#cfe8de]/60 px-2 py-0.5 text-[11px] font-semibold text-[#162c26]">
            {visibleGoals.length} tracked
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#c2c8c4]/50 p-8">
            <p className="text-[13px] text-[#605e5a]">
              No goals yet. Create your first one to start laying down milestones.
            </p>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[#162c26] px-4 text-[12px] font-semibold text-white"
            >
              <span className="size-2.5">
                <PlusIcon />
              </span>
              Create Goal
            </button>
          </div>
        ) : visibleGoals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#c2c8c4]/50 p-8 text-center text-[13px] text-[#a8a29e]">
            {filter === "active" ? "No active goals right now." : "No completed goals yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {visibleGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} milestones={milestonesByGoalId[goal.id] ?? []} />
            ))}
          </div>
        )}
      </div>

      {isCreating && <GoalFormPanel mode="create" onClose={() => setIsCreating(false)} />}
    </div>
  );
}
