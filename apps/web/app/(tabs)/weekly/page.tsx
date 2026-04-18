"use client";

import { useState } from "react";
import type { DayRecord, UserProfile } from "@kcalendar/types";
import { getStorage } from "@/lib/storage";
import {
  today,
  getWeekDates,
  getWeekLabelKo,
  addDays,
  isToday,
} from "@/lib/date";
import { WeeklyRow } from "@/components/weekly-row";

export default function WeeklyPage() {
  const todayStr = today();
  const [anchorDate, setAnchorDate] = useState(todayStr);
  const [profile] = useState<UserProfile | null>(() => getStorage().profile);
  const [records] = useState<Record<string, DayRecord>>(
    () => getStorage().records,
  );

  const weekDates = getWeekDates(anchorDate);
  const weekLabel = getWeekLabelKo(weekDates);
  const bmr = profile?.bmr ?? 0;

  const recordedDays = weekDates.filter((d) => {
    const r = records[d];
    return r && r.entries.length > 0;
  }).length;

  const weekNetCalories = weekDates.reduce((sum, d) => {
    const r = records[d];
    if (!r || r.entries.length === 0) return sum;
    return sum + (r.totalCalories - bmr);
  }, 0);

  const netColor =
    weekNetCalories < 0
      ? "text-secondary"
      : weekNetCalories > 0
        ? "text-tertiary"
        : "text-on-surface";

  return (
    <main className="w-full max-w-md mx-auto px-6 pt-10 pb-8">
      {/* 주간 네비게이션 */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setAnchorDate(addDays(anchorDate, -7))}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-sm">
            arrow_back_ios_new
          </span>
        </button>
        <h2 className="font-headline font-bold text-lg tracking-tight text-on-surface">
          {weekLabel}
        </h2>
        <button
          onClick={() => setAnchorDate(addDays(anchorDate, 7))}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-sm">
            arrow_forward_ios
          </span>
        </button>
      </div>

      {/* 7일 행 */}
      <div className="flex flex-col gap-3 mb-10">
        {weekDates.map((d) => (
          <WeeklyRow
            key={d}
            dateStr={d}
            record={records[d] ?? null}
            bmr={bmr}
            isToday={isToday(d)}
          />
        ))}
      </div>

      {/* 주간 요약 카드 */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between h-32 shadow-[0_12px_32px_rgba(25,28,29,0.04)]">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-medium">
            주간 합계
          </span>
          <div className="flex items-end gap-1">
            <span
              className={`font-headline font-bold text-3xl tracking-tighter ${netColor}`}
            >
              {weekNetCalories === 0
                ? "—"
                : weekNetCalories > 0
                  ? `+${weekNetCalories.toLocaleString()}`
                  : weekNetCalories.toLocaleString()}
            </span>
            {weekNetCalories !== 0 && (
              <span className="font-label text-xs text-on-surface-variant mb-1">
                kcal
              </span>
            )}
          </div>
        </div>
        <div className="col-span-2 bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-32">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-medium">
            기록
          </span>
          <div className="flex items-end gap-1">
            <span className="font-headline font-bold text-3xl tracking-tighter text-on-surface">
              {recordedDays}
            </span>
            <span className="font-headline font-semibold text-lg text-surface-tint mb-0.5">
              /7
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
