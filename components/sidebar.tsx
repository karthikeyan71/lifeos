"use client";
// sidebar code
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newsreader } from "next/font/google";
import { logout } from "@/features/auth/actions/logout";
import sidebarLogo from "@/public/brand/lifeos-sidebar-logo.png";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["500"] });

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <rect
        x="2"
        y="2"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="9"
        y="2"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="2"
        y="9"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="9"
        y="9"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function CheckSquareIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5 8.2 7 10.2 11 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.2 5.8 8.9 8.9l-3.1 1.3 1.3-3.1 3.1-1.3Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <path
        d="M3 7V5.5A2.5 2.5 0 0 1 5.5 3H12M12 3l-2-2M12 3l-2 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 9v1.5A2.5 2.5 0 0 1 10.5 13H4M4 13l2 2M4 13l2-2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <rect
        x="2"
        y="3"
        width="12"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2 6.5h12M5 2v2.5M11 2v2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <path
        d="M3 13.5V8M8 13.5V3M13 13.5V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 2.2v1.3M8 12.5v1.3M13.8 8h-1.3M3.5 8H2.2M11.9 4.1l-.9.9M5 11l-.9.9M11.9 11.9l-.9-.9M5 5l-.9-.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <path
        d="M6.5 2H4a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 11 14 8l-3.5-3M14 8H6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const soonLinks = [{ label: "Calendar", icon: CalendarIcon }];

export function Sidebar({
  activeTaskCount,
  activeGoalCount,
  activeHabitCount,
  userName,
  userEmail,
}: {
  activeTaskCount: number;
  activeGoalCount: number;
  activeHabitCount: number;
  userName: string;
  userEmail: string;
}) {
  const initials = (userName || userEmail).slice(0, 2).toUpperCase();
  const pathname = usePathname();
  const isTasksActive = pathname.startsWith("/dashboard/tasks");
  const isGoalsActive = pathname.startsWith("/dashboard/goals");
  const isHabitsActive = pathname.startsWith("/dashboard/habits");
  const isInsightsActive = pathname.startsWith("/dashboard/insights");
  const isSettingsActive = pathname.startsWith("/dashboard/settings");
  const isDashboardActive =
    pathname === "/dashboard" &&
    !isTasksActive &&
    !isGoalsActive &&
    !isHabitsActive &&
    !isInsightsActive &&
    !isSettingsActive;

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-[#e7e5e4]/80 bg-[#faf9f6] px-4 py-6 sm:flex">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <Image
              src={sidebarLogo}
              alt=""
              width={28}
              height={28}
              className="rounded-lg shadow-sm"
            />
            <span
              className={`${newsreader.className} text-[20px] font-medium tracking-[-0.02em] text-[#2c423b]`}
            >
              LifeOS
            </span>
          </div>
          <span className="rounded-full bg-[#e7e5e4]/70 px-2 py-0.5 text-[11px] font-semibold tracking-[0.025em] text-[#57534e]">
            v1.0
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] ${
              isDashboardActive
                ? "bg-[#e7e5e4]/60 font-medium text-[#2c423b] shadow-sm"
                : "text-[#57534e] hover:bg-[#e7e5e4]/40"
            }`}
          >
            <span className="size-4">
              <GridIcon />
            </span>
            Dashboard
          </Link>

          <Link
            href="/dashboard/tasks"
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] ${
              isTasksActive
                ? "bg-[#e7e5e4]/60 font-medium text-[#2c423b] shadow-sm"
                : "text-[#57534e] hover:bg-[#e7e5e4]/40"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="size-4">
                <CheckSquareIcon />
              </span>
              Tasks
            </span>
            <span className="flex size-5 items-center justify-center rounded-full bg-[#e7e5e4] text-[11px] font-semibold text-[#2c423b]">
              {activeTaskCount}
            </span>
          </Link>

          <Link
            href="/dashboard/goals"
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] ${
              isGoalsActive
                ? "bg-[#e7e5e4]/60 font-medium text-[#2c423b] shadow-sm"
                : "text-[#57534e] hover:bg-[#e7e5e4]/40"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="size-4">
                <CompassIcon />
              </span>
              Goals
            </span>
            <span className="flex size-5 items-center justify-center rounded-full bg-[#e7e5e4] text-[11px] font-semibold text-[#2c423b]">
              {activeGoalCount}
            </span>
          </Link>

          <Link
            href="/dashboard/habits"
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] ${
              isHabitsActive
                ? "bg-[#e7e5e4]/60 font-medium text-[#2c423b] shadow-sm"
                : "text-[#57534e] hover:bg-[#e7e5e4]/40"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="size-4">
                <RepeatIcon />
              </span>
              Habits
            </span>
            <span className="flex size-5 items-center justify-center rounded-full bg-[#e7e5e4] text-[11px] font-semibold text-[#2c423b]">
              {activeHabitCount}
            </span>
          </Link>

          <Link
            href="/dashboard/insights"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] ${
              isInsightsActive
                ? "bg-[#e7e5e4]/60 font-medium text-[#2c423b] shadow-sm"
                : "text-[#57534e] hover:bg-[#e7e5e4]/40"
            }`}
          >
            <span className="size-4">
              <BarChartIcon />
            </span>
            Insights
          </Link>

          {soonLinks.map(({ label, icon: Icon }) => (
            <div
              key={label}
              aria-disabled
              className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] text-[#a8a29e]"
            >
              <span className="flex items-center gap-3">
                <span className="size-4">
                  <Icon />
                </span>
                {label}
              </span>
              <span className="rounded-[4px] bg-[#f5f5f4] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#a8a29e]">
                Soon
              </span>
            </div>
          ))}

          <div className="my-2 border-t border-[#e7e5e4]/70" />

          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] ${
              isSettingsActive
                ? "bg-[#e7e5e4]/60 font-medium text-[#2c423b] shadow-sm"
                : "text-[#57534e] hover:bg-[#e7e5e4]/40"
            }`}
          >
            <span className="size-4">
              <GearIcon />
            </span>
            Settings
          </Link>
        </nav>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#e7e5e4]/80 bg-white p-2.5 shadow-sm">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2c423b] text-[12px] font-semibold text-white ring-2 ring-[#e7e5e4]">
            {initials}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-[12px] font-semibold text-[#1c1917]">
              {userName || "LifeOS user"}
            </span>
            <span className="truncate text-[11px] text-[#78716c]">
              {userEmail}
            </span>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Log out"
            className="flex size-7 items-center justify-center rounded-lg text-[#57534e] hover:bg-[#f5f5f4]"
          >
            <span className="size-4">
              <LogoutIcon />
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}
