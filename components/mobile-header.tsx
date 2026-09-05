"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Newsreader } from "next/font/google";
import { logout } from "@/features/auth/actions/logout";
import sidebarLogo from "@/public/brand/lifeos-sidebar-logo.png";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["500"] });

export function MobileHeader({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pageLabel = pathname.startsWith("/dashboard/tasks") ? "Tasks" : "Dashboard";
  const initials = (userName || userEmail).slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#e7e5e4]/60 bg-[#faf9f6]/85 px-4 backdrop-blur-md sm:hidden">
      <div className="flex items-center gap-2">
        <Image src={sidebarLogo} alt="" width={32} height={32} className="rounded-md" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className={`${newsreader.className} text-[18px] font-medium tracking-[-0.02em] text-[#162c26]`}>
              LifeOS
            </span>
            <span className="text-[12px] text-[#424845]">· {pageLabel}</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#605e5a]">
            Quiet Edition
          </span>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-label="Account menu"
          className="flex size-9 items-center justify-center rounded-full bg-[#2c423b] text-[12px] font-semibold text-white"
        >
          {initials}
        </button>

        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[#e7e5e4]/80 bg-white shadow-lg">
              <div className="border-b border-[#e7e5e4]/70 px-3.5 py-3">
                <p className="truncate text-[13px] font-semibold text-[#1c1917]">
                  {userName || "LifeOS user"}
                </p>
                <p className="truncate text-[11px] text-[#78716c]">{userEmail}</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full px-3.5 py-2.5 text-left text-[13px] font-medium text-[#b3462c] hover:bg-[#ffdad6]/20"
                >
                  Log out
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
