"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <path
        d="M2 7 8 2l6 5v6.5a1 1 0 0 1-1 1h-3v-4H6v4H3a1 1 0 0 1-1-1V7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckSquareIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 8.2 7 10.2 11 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.2 5.8 8.9 8.9l-3.1 1.3 1.3-3.1 3.1-1.3Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <path d="M3 7V5.5A2.5 2.5 0 0 1 5.5 3H12M12 3l-2-2M12 3l-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9v1.5A2.5 2.5 0 0 1 10.5 13H4M4 13l2 2M4 13l2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <path d="M3 13.5V8M8 13.5V3M13 13.5V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function MobileNav({
  activeTaskCount,
  activeGoalCount,
  activeHabitCount,
}: {
  activeTaskCount: number;
  activeGoalCount: number;
  activeHabitCount: number;
}) {
  const pathname = usePathname();
  const isTasksActive = pathname.startsWith("/dashboard/tasks");
  const isGoalsActive = pathname.startsWith("/dashboard/goals");
  const isHabitsActive = pathname.startsWith("/dashboard/habits");
  const isInsightsActive = pathname.startsWith("/dashboard/insights");
  const isHomeActive =
    pathname === "/dashboard" &&
    !isTasksActive &&
    !isGoalsActive &&
    !isHabitsActive &&
    !isInsightsActive;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-[#e7e5e4]/80 bg-[#faf9f6]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      <Link
        href="/dashboard"
        className={`flex min-w-11 flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold ${
          isHomeActive ? "text-[#162c26]" : "text-[#424845]/70"
        }`}
      >
        <span className="size-4">
          <HomeIcon />
        </span>
        Home
      </Link>

      <Link
        href="/dashboard/tasks"
        className={`relative flex min-w-11 flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold ${
          isTasksActive ? "text-[#162c26]" : "text-[#424845]/70"
        }`}
      >
        <span className="relative size-4">
          <CheckSquareIcon />
          {activeTaskCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#e3dfda] px-1 text-[9px] font-semibold text-[#64625f]">
              {activeTaskCount}
            </span>
          )}
        </span>
        Tasks
      </Link>

      <Link
        href="/dashboard/goals"
        className={`relative flex min-w-11 flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold ${
          isGoalsActive ? "text-[#162c26]" : "text-[#424845]/70"
        }`}
      >
        <span className="relative size-4">
          <CompassIcon />
          {activeGoalCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#e3dfda] px-1 text-[9px] font-semibold text-[#64625f]">
              {activeGoalCount}
            </span>
          )}
        </span>
        Goals
      </Link>

      <Link
        href="/dashboard/habits"
        className={`relative flex min-w-11 flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold ${
          isHabitsActive ? "text-[#162c26]" : "text-[#424845]/70"
        }`}
      >
        <span className="relative size-4">
          <RepeatIcon />
          {activeHabitCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#e3dfda] px-1 text-[9px] font-semibold text-[#64625f]">
              {activeHabitCount}
            </span>
          )}
        </span>
        Habits
      </Link>

      <Link
        href="/dashboard/insights"
        className={`flex min-w-11 flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold ${
          isInsightsActive ? "text-[#162c26]" : "text-[#424845]/70"
        }`}
      >
        <span className="size-4">
          <BarChartIcon />
        </span>
        Insights
      </Link>
    </nav>
  );
}
