import Link from "next/link";
import type { ReactNode } from "react";
import { AppLogo } from "@/components/app-logo";

type AppTopBarProps = {
  className?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  logoPriority?: boolean;
  logoSize?: "sm" | "md" | "lg";
};

export function AppTopBar({
  className = "",
  leftSlot,
  rightSlot,
  logoPriority = false,
  logoSize = "md",
}: AppTopBarProps) {
  return (
    <div className={`relative flex min-h-14 items-center ${className}`.trim()}>
      <div className="pointer-events-none z-10 flex w-full items-center justify-between gap-4">
        <div className="pointer-events-auto flex min-w-10 items-center justify-start">
          {leftSlot ?? <div className="h-10 w-10" />}
        </div>
        <div className="pointer-events-auto flex min-w-10 items-center justify-end">
          {rightSlot ?? <div className="h-10 w-10" />}
        </div>
      </div>

      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <Link
          href="/today"
          aria-label="오늘 페이지로 이동"
          className="rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <AppLogo priority={logoPriority} size={logoSize} />
        </Link>
      </div>
    </div>
  );
}
