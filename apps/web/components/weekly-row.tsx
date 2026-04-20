import Link from "next/link";
import type { DayRecord } from "@kcalendar/types";
import { parseDate } from "@/lib/date";
import { calculateBurnCalories } from "@/lib/entries";

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

interface WeeklyRowProps {
  dateStr: string;
  record: DayRecord | null;
  bmr: number;
  isToday: boolean;
}

export function WeeklyRow({
  dateStr,
  record,
  bmr,
  isToday: isTodayDate,
}: WeeklyRowProps) {
  const date = parseDate(dateStr);
  const day = date.getDate();
  const dayName = DAYS_KO[date.getDay()];
  const hasRecord = !!record && record.entries.length > 0;
  const burnCalories = hasRecord ? calculateBurnCalories(record.entries) : 0;
  const diff = hasRecord ? record.totalCalories - burnCalories - bmr : null;
  const isDeficit = diff !== null && diff < 0;
  const isSurplus = diff !== null && diff >= 0;

  const diffDisplay =
    diff !== null
      ? diff >= 0
        ? `+${diff.toLocaleString()}`
        : diff.toLocaleString()
      : null;

  if (!hasRecord) {
    return (
      <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container text-left relative overflow-hidden">
        <div className="flex items-baseline gap-2">
          <span className="font-headline font-bold text-base text-surface-tint">
            {day}
          </span>
          <span className="font-label text-xs uppercase tracking-widest text-surface-tint">
            {dayName}
          </span>
          {isTodayDate && (
            <span className="bg-primary text-on-primary font-label text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-medium">
              오늘
            </span>
          )}
        </div>
        <div className="font-headline font-semibold text-base text-surface-tint">
          —
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/weekly/${dateStr}`}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container-low transition-colors hover:bg-surface-container text-left relative overflow-hidden active:scale-[0.98]"
    >
      {isDeficit && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
      )}
      {isSurplus && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary" />
      )}
      <div className="flex items-center gap-2 pl-2">
        <div className="flex items-baseline gap-2">
          <span className="font-headline font-bold text-base text-on-surface">
            {day}
          </span>
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
            {dayName}
          </span>
        </div>
        {isTodayDate && (
          <span className="bg-primary text-on-primary font-label text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-medium">
            오늘
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-headline font-bold text-base tracking-tight ${
            isDeficit ? "text-secondary" : "text-tertiary"
          }`}
        >
          {diffDisplay}
        </span>
        <span className="font-label text-[10px] text-on-surface-variant">
          kcal
        </span>
      </div>
    </Link>
  );
}
