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

function GearIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-full">
      <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 2.2v1.3M8 12.5v1.3M13.8 8h-1.3M3.5 8H2.2M11.9 4.1l-.9.9M5 11l-.9.9M11.9 11.9l-.9-.9M5 5l-.9-.9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MobileNav({ activeTaskCount }: { activeTaskCount: number }) {
  const pathname = usePathname();
  const isTasksActive = pathname.startsWith("/dashboard/tasks");
  const isHomeActive = pathname === "/dashboard" && !isTasksActive;

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

      <div
        aria-disabled
        className="flex min-w-11 cursor-not-allowed flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold text-[#424845]/50"
      >
        <span className="size-4">
          <CompassIcon />
        </span>
        <span className="flex items-center gap-1">
          Goals <span className="text-[8px] uppercase">Soon</span>
        </span>
      </div>

      <div
        aria-disabled
        className="flex min-w-11 cursor-not-allowed flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold text-[#424845]/50"
      >
        <span className="size-4">
          <RepeatIcon />
        </span>
        <span className="flex items-center gap-1">
          Habits <span className="text-[8px] uppercase">Soon</span>
        </span>
      </div>

      <div
        aria-disabled
        className="flex min-w-11 cursor-not-allowed flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold text-[#424845]/50"
      >
        <span className="size-4">
          <GearIcon />
        </span>
        Settings
      </div>
    </nav>
  );
}
