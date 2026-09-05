"use client";

import { useState } from "react";
import { Newsreader } from "next/font/google";
import type { InsightsData, InsightsPeriod } from "@/features/insights/lib/compute";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

const PERIOD_LABELS: Record<InsightsPeriod, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

function MetricTile({
  label,
  value,
  sub,
  percent,
}: {
  label: string;
  value: string;
  sub: string;
  percent: number;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#c2c8c4]/40 bg-white p-4 shadow-sm sm:p-5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">{label}</span>
      <div>
        <div className={`${newsreader.className} text-[26px] font-medium leading-none text-[#162c26]`}>{value}</div>
        <div className="pt-1.5 text-[12px] text-[#605e5a]">{sub}</div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#efeeeb]">
        <div
          className="h-full rounded-full bg-[#2c423b]"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#c2c8c4]/40 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-0.5">
        <h3 className={`${newsreader.className} text-[17px] font-medium text-[#162c26]`}>{title}</h3>
        {subtitle && <p className="text-[12px] text-[#605e5a]">{subtitle}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function RateRow({
  name,
  rate,
  completed,
  applicable,
  tone,
}: {
  name: string;
  rate: number;
  completed: number;
  applicable: number;
  tone: "positive" | "attention";
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="min-w-0 truncate text-[#1a1c1a]">{name}</span>
      <span
        className={`shrink-0 text-[12px] font-medium tabular-nums ${
          tone === "attention" ? "text-[#8a3a24]" : "text-[#2c423b]"
        }`}
      >
        {rate}% · {completed}/{applicable}
      </span>
    </div>
  );
}

export function InsightsView({
  byPeriod,
  hasAnyData,
}: {
  byPeriod: Record<InsightsPeriod, InsightsData>;
  hasAnyData: boolean;
}) {
  const [period, setPeriod] = useState<InsightsPeriod>("30d");
  const data = byPeriod[period];

  const weekdayMax = Math.max(1, ...data.weekdayActivity.map((day) => day.completed));
  const totalCompletions = data.weekdayActivity.reduce((sum, day) => sum + day.completed, 0);
  const heatmapMax = Math.max(1, ...data.habitHeatmap.map((cell) => cell.total));

  return (
    <div className="flex flex-col gap-8 p-5 sm:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2c423b]">
              Retrospective &amp; Patterns
            </span>
            <span className="size-1 rounded-full bg-[#c2c8c4]" />
            <span className="text-[12px] text-[#605e5a]">{data.rangeLabel}</span>
          </div>
          <h1
            className={`${newsreader.className} text-[28px] font-medium leading-[34px] tracking-[-0.015em] text-[#162c26] sm:text-[32px] sm:leading-[40px]`}
          >
            Insights
          </h1>
          <p className="max-w-xl text-[13.5px] leading-[20px] text-[#605e5a]">
            Understand your progress, consistency, and patterns over time. Derived from your logged tasks, goals, and
            habits.
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-[#c2c8c4]/40 bg-[#f4f3f1] p-0.5">
          {(Object.keys(PERIOD_LABELS) as InsightsPeriod[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                period === key ? "bg-white text-[#162c26] shadow-sm" : "text-[#605e5a] hover:text-[#1a1c1a]"
              }`}
            >
              {PERIOD_LABELS[key]}
            </button>
          ))}
        </div>
      </header>

      {!hasAnyData ? (
        <p className="rounded-xl border border-dashed border-[#c2c8c4]/50 p-10 text-center text-[13px] text-[#a8a29e]">
          Nothing to analyse yet. Add tasks, goals, or habits and your patterns will show up here.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricTile
              label="Task Completion"
              value={`${data.taskCompletion.rate}%`}
              sub={`${data.taskCompletion.completed} of ${data.taskCompletion.total} tracked`}
              percent={data.taskCompletion.rate}
            />
            <MetricTile
              label="Habit Consistency"
              value={`${data.habitConsistency.rate}%`}
              sub={
                data.habitConsistency.applicable > 0
                  ? `${data.habitConsistency.completed} of ${data.habitConsistency.applicable} occurrences`
                  : "No habits tracked yet"
              }
              percent={data.habitConsistency.rate}
            />
            <MetricTile
              label="Active Goals"
              value={String(data.goals.active)}
              sub={`${data.goals.completed} completed`}
              percent={data.goals.active + data.goals.completed > 0
                ? (data.goals.completed / (data.goals.active + data.goals.completed)) * 100
                : 0}
            />
            <MetricTile
              label="Milestone Progress"
              value={`${data.goals.milestoneRate}%`}
              sub={`${data.goals.completedMilestones} of ${data.goals.totalMilestones} milestones`}
              percent={data.goals.milestoneRate}
            />
          </div>

          {data.synthesis.length > 0 && (
            <SectionCard title={`Your ${PERIOD_LABELS[period]} synthesis`} subtitle="Drawn directly from your logged activity">
              <ul className="flex flex-col gap-2.5">
                {data.synthesis.map((line, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-[13.5px] leading-[20px] text-[#1a1c1a]">
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#2c423b]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-7">
              <SectionCard title="Task activity" subtitle="Completions by weekday">
                {totalCompletions === 0 ? (
                  <p className="text-[13px] text-[#a8a29e]">No tasks completed in this window yet.</p>
                ) : (
                  <>
                    <div className="flex h-40 items-end gap-2 rounded-lg bg-[#f4f3f1]/60 px-3 pt-4">
                      {data.weekdayActivity.map((day) => (
                        <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                          <span className="text-[11px] font-semibold text-[#2c423b]">{day.completed}</span>
                          <div
                            className="w-full max-w-[26px] rounded-t bg-[#2c423b]"
                            style={{ height: `${(day.completed / weekdayMax) * 100}%` }}
                          />
                          <span className="text-[10px] uppercase text-[#605e5a]">{day.label}</span>
                        </div>
                      ))}
                    </div>
                    {data.weekdayInsight && (
                      <p className="mt-3 flex items-center gap-2 rounded-lg bg-[#f4f3f1]/70 px-3 py-2 text-[12px] text-[#424845]">
                        {data.weekdayInsight}
                      </p>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(
                        [
                          ["To do", data.statusBreakdown.todo],
                          ["In progress", data.statusBreakdown.in_progress],
                          ["Completed", data.statusBreakdown.completed],
                          ["Cancelled", data.statusBreakdown.cancelled],
                        ] as const
                      ).map(([label, count]) => (
                        <div key={label} className="rounded-lg bg-[#f4f3f1]/60 p-2.5">
                          <div className="text-[15px] font-semibold text-[#162c26]">{count}</div>
                          <div className="text-[11px] text-[#605e5a]">{label}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </SectionCard>

              <SectionCard
                title="Habit consistency"
                subtitle={
                  data.habitConsistency.applicable > 0
                    ? `${data.habitConsistency.completed} / ${data.habitConsistency.applicable} occurrences · best current streak ${data.habitConsistency.bestStreak}`
                    : "No habits tracked yet"
                }
              >
                {data.activeDailyHabitCount === 0 ? (
                  <p className="text-[13px] text-[#a8a29e]">
                    Add a daily habit to see your day-by-day consistency grid.
                  </p>
                ) : (
                  <div className="grid grid-cols-10 gap-1.5 rounded-lg bg-[#f4f3f1]/60 p-3 sm:grid-cols-[repeat(15,minmax(0,1fr))]">
                    {data.habitHeatmap.map((cell) => {
                      const ratio = cell.total > 0 ? cell.done / heatmapMax : 0;
                      const bg =
                        cell.total === 0
                          ? "#e9e8e5"
                          : cell.done === 0
                            ? "#efeeeb"
                            : ratio >= 0.99
                              ? "#2c423b"
                              : ratio >= 0.5
                                ? "#7d9b90"
                                : "#cfe8de";
                      const day = Number(cell.date.slice(8, 10));
                      return (
                        <div
                          key={cell.date}
                          title={`${cell.date}: ${cell.done}/${cell.total} habits`}
                          className="flex aspect-square items-center justify-center rounded text-[9px] font-medium"
                          style={{ backgroundColor: bg, color: ratio >= 0.5 ? "#fff" : "#605e5a" }}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                )}

                {(data.mostConsistent.length > 0 || data.needsAttention.length > 0) && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-[#f4f3f1]/60 p-3.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2c423b]">
                        Most consistent
                      </span>
                      <div className="mt-2 flex flex-col gap-1.5">
                        {data.mostConsistent.length > 0 ? (
                          data.mostConsistent.map((habit) => (
                            <RateRow key={habit.id} {...habit} tone="positive" />
                          ))
                        ) : (
                          <p className="text-[12px] text-[#a8a29e]">Not enough history yet.</p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#ffe1d6]/40 p-3.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a3a24]">
                        Needs attention
                      </span>
                      <div className="mt-2 flex flex-col gap-1.5">
                        {data.needsAttention.length > 0 ? (
                          data.needsAttention.map((habit) => (
                            <RateRow key={habit.id} {...habit} tone="attention" />
                          ))
                        ) : (
                          <p className="text-[12px] text-[#a8a29e]">Everything above 60%.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-5">
              <SectionCard title="Goal trajectory" subtitle="Milestone progress across active goals">
                {data.goalTrajectory.length === 0 ? (
                  <p className="text-[13px] text-[#a8a29e]">No active goals right now.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {data.goalTrajectory.map((goal) => (
                      <div key={goal.id} className="rounded-lg bg-[#f4f3f1]/60 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="min-w-0 text-[13px] font-medium text-[#1a1c1a]">{goal.title}</span>
                          <span className="shrink-0 text-[12px] font-semibold text-[#2c423b]">{goal.rate}%</span>
                        </div>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#e3e2e0]">
                          <div className="h-full rounded-full bg-[#2c423b]" style={{ width: `${goal.rate}%` }} />
                        </div>
                        <div className="mt-1.5 text-[11px] text-[#605e5a]">
                          {goal.total > 0 ? `${goal.completed} of ${goal.total} milestones` : "No milestones yet"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Tasks needing attention" subtitle="Overdue and repeatedly-deferred work">
                {data.overdueTasks.length === 0 && data.avoidance.length === 0 ? (
                  <p className="text-[13px] text-[#a8a29e]">Nothing stalled or overdue. Nice.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.overdueTasks.map((task) => (
                      <div key={`overdue-${task.id}`} className="rounded-lg bg-[#f4f3f1]/60 p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate text-[13px] font-medium text-[#1a1c1a]">{task.title}</span>
                          <span className="shrink-0 rounded bg-[#ffe1d6]/70 px-1.5 py-0.5 text-[11px] font-semibold text-[#8a3a24]">
                            {task.daysOverdue}d overdue
                          </span>
                        </div>
                      </div>
                    ))}
                    {data.avoidance
                      .filter((item) => !data.overdueTasks.some((task) => task.id === item.id))
                      .map((item) => (
                        <div key={`avoid-${item.id}`} className="rounded-lg bg-[#f4f3f1]/60 p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="min-w-0 truncate text-[13px] font-medium text-[#1a1c1a]">{item.title}</span>
                            <span className="shrink-0 rounded bg-[#e9e8e5] px-1.5 py-0.5 text-[11px] font-semibold text-[#605e5a]">
                              {item.reason}
                            </span>
                          </div>
                          <div className="pt-0.5 text-[11px] text-[#605e5a]">{item.detail}</div>
                        </div>
                      ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Planning vs execution" subtitle="Planned work against what got done">
                <div className="flex items-end gap-6">
                  <div>
                    <div className={`${newsreader.className} text-[24px] font-medium text-[#162c26]`}>
                      {data.planningVsExecution.completed}
                    </div>
                    <div className="text-[11px] text-[#605e5a]">completed</div>
                  </div>
                  <div>
                    <div className={`${newsreader.className} text-[24px] font-medium text-[#605e5a]`}>
                      {data.planningVsExecution.planned}
                    </div>
                    <div className="text-[11px] text-[#605e5a]">planned</div>
                  </div>
                  {data.planningVsExecution.planned > 0 && (
                    <div className="ml-auto text-[12px] font-semibold text-[#2c423b]">
                      {Math.round(
                        (data.planningVsExecution.completed / data.planningVsExecution.planned) * 100,
                      )}
                      % follow-through
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          <section className="rounded-xl bg-[#162c26] p-6 text-white shadow-sm sm:p-7">
            <h3 className={`${newsreader.className} text-[17px] font-medium text-white`}>Quiet accomplishment</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 text-[13.5px] sm:grid-cols-2">
              {(
                [
                  [`${data.accomplishments.tasksCompleted} tasks`, "completed"],
                  [`${data.accomplishments.habitOccurrences} habit occurrences`, "logged"],
                  [`${data.accomplishments.milestonesCompleted} milestones`, "reached"],
                  [`${data.accomplishments.goalsCompleted} goals`, "closed out"],
                ] as const
              ).map(([value, suffix]) => (
                <div key={value} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#cfe8de]" />
                  <span>
                    <strong className="font-semibold">{value}</strong> {suffix}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-white/70">Consistency is measured in return, not perfection.</p>
          </section>
        </>
      )}
    </div>
  );
}
