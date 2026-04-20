"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TodayIcon, WeeklyIcon } from "@/components/icons";

export function TabBar() {
  const pathname = usePathname();
  const isToday = pathname === "/today";
  const isWeekly = pathname.startsWith("/weekly");

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex justify-around items-center bg-surface z-50 rounded-t-lg"
      style={{
        borderTop: "1px solid rgba(198,198,198,0.15)",
        paddingTop: "8px",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        paddingLeft: "24px",
        paddingRight: "24px",
      }}
    >
      <Link
        href="/today"
        className={`flex flex-1 flex-col items-center justify-center py-1 transition-opacity active:translate-y-0.5 duration-200 ${
          isToday
            ? "text-on-surface opacity-100"
            : "text-on-surface opacity-40 hover:opacity-60"
        }`}
      >
        <TodayIcon active={isToday} className="mb-1 h-6 w-6" />
        <span className="font-label text-[10px] uppercase tracking-[0.1em] font-medium">
          오늘
        </span>
      </Link>

      <Link
        href="/weekly"
        className={`flex flex-1 flex-col items-center justify-center py-1 transition-opacity active:translate-y-0.5 duration-200 ${
          isWeekly
            ? "text-on-surface opacity-100"
            : "text-on-surface opacity-40 hover:opacity-60"
        }`}
      >
        <WeeklyIcon active={isWeekly} className="mb-1 h-6 w-6" />
        <span className="font-label text-[10px] uppercase tracking-[0.1em] font-medium">
          주간
        </span>
      </Link>
    </nav>
  );
}
