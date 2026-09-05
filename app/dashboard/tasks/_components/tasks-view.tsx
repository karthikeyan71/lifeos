"use client";

import { useMemo, useState } from "react";
import { TaskCard, type TaskCardData } from "./task-card";
import { TaskFormPanel } from "./task-form-panel";

type Tab = "all" | "today" | "upcoming" | "completed";

function SearchIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-full">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.5 9.5 13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

function toDateOnly(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function bucketFor(task: TaskCardData, today: Date): "today" | "upcoming" | "completed" {
  if (task.status === "completed" || task.status === "cancelled") return "completed";

  const relevantDate = task.dueDate ?? task.scheduledDate;
  if (!relevantDate) return "upcoming";

  const date = toDateOnly(new Date(relevantDate + "T00:00:00"));
  return date.getTime() <= today.getTime() ? "today" : "upcoming";
}

export function TasksView({
  tasks,
  greetingName,
}: {
  tasks: TaskCardData[];
  greetingName: string;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "todo" | "in_progress" | "completed" | "cancelled"
  >("all");

  const today = useMemo(() => toDateOnly(new Date()), []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (query) {
        const haystack = `${task.title} ${task.description ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [tasks, priorityFilter, statusFilter, search]);

  const buckets = useMemo(() => {
    const result = { today: [] as TaskCardData[], upcoming: [] as TaskCardData[], completed: [] as TaskCardData[] };
    for (const task of filtered) {
      result[bucketFor(task, today)].push(task);
    }
    return result;
  }, [filtered, today]);

  const todaysAllTasks = useMemo(
    () => tasks.filter((task) => bucketFor(task, today) === "today"),
    [tasks, today],
  );
  const todaysCompletedCount = todaysAllTasks.filter((task) => task.status === "completed").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const groupsToShow: { key: Exclude<Tab, "all">; label: string; tasks: TaskCardData[] }[] = (
    [
      { key: "today", label: "Today", tasks: buckets.today },
      { key: "upcoming", label: "Upcoming", tasks: buckets.upcoming },
      { key: "completed", label: "Completed", tasks: buckets.completed },
    ] as const
  ).filter((group) => activeTab === "all" || activeTab === group.key);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-[18px] font-bold tracking-[-0.02em] text-[#162c26]">
            {greeting}
            {greetingName ? `, ${greetingName}` : ""}
          </h1>
          <span className="text-[14px] text-[#605e5a]">
            ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <p className="pt-0.5 text-[12px] font-medium text-[#605e5a]">
          {todaysAllTasks.length === 0
            ? "Nothing scheduled for today. Enjoy the calm."
            : `${todaysCompletedCount} of ${todaysAllTasks.length} priorities complete today. Keep the calm momentum.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#c2c8c4]/40 bg-white p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">
            Cadence
          </span>
          <p className="pt-3 text-[13px] text-[#a8a29e]">Streak tracking coming soon</p>
        </div>
        <div className="rounded-xl border border-[#c2c8c4]/40 bg-white p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">
            In flight
          </span>
          <p className="pt-2 text-[20px] font-semibold text-[#1a1c1a]">
            {todaysAllTasks.length - todaysCompletedCount} tasks remaining
          </p>
          <p className="pt-1 text-[12px] text-[#605e5a]">Scheduled or due today</p>
        </div>
        <div className="rounded-xl border border-[#c2c8c4]/40 bg-white p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">
            Next immediate focus
          </span>
          <p className="pt-2 truncate text-[15px] font-semibold text-[#1a1c1a]">
            {buckets.today.find((t) => t.status !== "completed")?.title ??
              buckets.upcoming[0]?.title ??
              "Nothing queued"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-[#c2c8c4]/40 bg-white p-4">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-[#605e5a]">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks by title or description..."
            className="h-10 w-full rounded-lg border border-[#c2c8c4]/40 bg-[#f4f3f1]/70 pl-10 pr-3 text-[14px] text-[#1a1c1a] outline-none focus:border-[#2c423b] focus:ring-1 focus:ring-[#2c423b]"
          />
        </div>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex h-10 items-center rounded-lg border border-[#c2c8c4]/40 bg-[#f4f3f1] px-4 text-[12px] font-semibold text-[#1a1c1a] opacity-60"
        >
          Export
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex h-10 items-center rounded-lg border border-[#c2c8c4]/40 bg-[#f4f3f1] px-4 text-[12px] font-semibold text-[#1a1c1a] opacity-60"
        >
          Group
        </button>
        <button
          type="button"
          onClick={() => setIsCreating((value) => !value)}
          className="flex h-10 items-center gap-1.5 rounded-lg bg-[#162c26] px-4 text-[12px] font-semibold text-white"
        >
          <span className="size-2.5">
            <PlusIcon />
          </span>
          New Task
        </button>
      </div>

      {isCreating && <TaskFormPanel mode="create" onDone={() => setIsCreating(false)} />}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-[#c2c8c4]/30 bg-[#f4f3f1] p-1">
            {(
              [
                { key: "all", label: "All", count: filtered.length },
                { key: "today", label: "Today", count: buckets.today.length },
                { key: "upcoming", label: "Upcoming", count: buckets.upcoming.length },
                { key: "completed", label: "Completed", count: buckets.completed.length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 py-1.5 text-[12px] font-semibold ${
                  activeTab === tab.key
                    ? "bg-[#162c26] text-white"
                    : "text-[#605e5a] hover:text-[#1a1c1a]"
                }`}
              >
                {tab.label} {tab.count}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#c2c8c4]/40 bg-white p-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#605e5a]">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as typeof priorityFilter)}
              className="h-8 rounded-lg bg-[#f4f3f1] px-2 text-[12px] text-[#1a1c1a] outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#605e5a]">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="h-8 rounded-lg bg-[#f4f3f1] px-2 text-[12px] text-[#1a1c1a] outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#a8a29e]">
              Category
            </label>
            <select disabled title="Coming soon" className="h-8 rounded-lg bg-[#f4f3f1] px-2 text-[12px] text-[#a8a29e]">
              <option>All Categories</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#a8a29e]">
              Order
            </label>
            <select disabled title="Coming soon" className="h-8 rounded-lg bg-[#f4f3f1] px-2 text-[12px] text-[#a8a29e]">
              <option>Sort by: Due date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {groupsToShow.map((group) => (
          <div key={group.key} className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 px-1">
              <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#162c26]">
                {group.label}
              </span>
              <span className="rounded-[6px] bg-[#e9e8e5] px-2 py-0.5 text-[11px] font-semibold text-[#424845]">
                {group.tasks.length}
              </span>
            </div>
            {group.tasks.length === 0 ? (
              <p className="px-1 text-[13px] text-[#a8a29e]">Nothing here.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {group.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start gap-1 rounded-2xl border border-[#c2c8c4]/40 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#605e5a]">
            Archival Reflection
          </span>
          <p className="pt-1 font-serif text-[18px] italic text-[#162c26]">
            &ldquo;Simplicity is about subtracting the obvious and adding the meaningful.&rdquo;
          </p>
          <p className="pt-1 text-[12px] text-[#605e5a]">— John Maeda, The Laws of Simplicity</p>
        </div>
      </div>
    </div>
  );
}
