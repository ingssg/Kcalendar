"use client";

import { useState, useSyncExternalStore } from "react";
import {
  today,
  getWeekDates,
  getWeekLabelKo,
  addDays,
  isToday,
} from "@/lib/date";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProfile } from "@/lib/hooks/use-profile";
import { useWeeklyRecords } from "@/lib/hooks/use-weekly-records";
import { AppTopBar } from "@/components/app-top-bar";
import { AuthMenuButton } from "@/components/auth-menu-button";
import { LoginBanner } from "@/components/login-banner";
import { WeeklyRow } from "@/components/weekly-row";
import { dismissNudge, shouldShowNudge } from "@/lib/login-nudge";
import { calculateBurnCalories } from "@/lib/entries";

const subscribeNoop = () => () => {};

export default function WeeklyPage() {
  const todayStr = useSyncExternalStore(subscribeNoop, today, () => "");
  const { isLoggedIn, isReady } = useAuth();
  const { profile } = useProfile();
  const [weekOffset, setWeekOffset] = useState(0);
  const [dismissedWeeklyBanner, setDismissedWeeklyBanner] = useState(false);

  const anchorDate = todayStr ? addDays(todayStr, weekOffset * 7) : "";
  const weekDates = anchorDate ? getWeekDates(anchorDate) : [];
  const weekLabel = anchorDate ? getWeekLabelKo(weekDates) : "";
  const bmr = profile?.bmr ?? 0;
  const { records } = useWeeklyRecords(weekDates);

  const recordedDays = weekDates.filter((d) => !!records[d]).length;

  const weekNetCalories = weekDates.reduce((sum, d) => {
    const r = records[d];
    if (!r) return sum;
    const burn = calculateBurnCalories(r.entries);
    return sum + (r.totalCalories - burn - bmr);
  }, 0);

  const weekTotalNet = weekDates.reduce((sum, d) => {
    const r = records[d];
    if (!r) return sum;
    const burn = calculateBurnCalories(r.entries);
    return sum + (r.totalCalories - burn);
  }, 0);
  const avgDailyNet =
    recordedDays > 0 ? Math.round(weekTotalNet / recordedDays) : null;
  const avgColor =
    avgDailyNet === null
      ? "text-on-surface"
      : avgDailyNet < bmr
        ? "text-secondary"
        : "text-tertiary";

  const netColor =
    weekNetCalories < 0
      ? "text-secondary"
      : weekNetCalories > 0
        ? "text-tertiary"
        : "text-on-surface";

  const showWeeklyBanner =
    isReady &&
    !isLoggedIn &&
    !dismissedWeeklyBanner &&
    shouldShowNudge("weekly", { ignoreSession: true });

  return (
    <main className="w-full max-w-md mx-auto px-6 pt-5 pb-8">
      <header className="mb-5 flex flex-col gap-4">
        <AppTopBar logoPriority logoSize="md" rightSlot={<AuthMenuButton />} />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset((current) => current - 1)}
            disabled={!anchorDate}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back_ios_new
            </span>
          </button>
          <div>
            <h1 className="sr-only">주간 기록</h1>
            <h2 className="font-headline font-bold text-lg tracking-tight text-on-surface">
              {weekLabel}
            </h2>
          </div>
          <button
            onClick={() => setWeekOffset((current) => current + 1)}
            disabled={!anchorDate}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_forward_ios
            </span>
          </button>
        </div>
      </header>

      {/* 7일 행 */}
      <div className="relative mb-5">
        <div className="flex flex-col gap-2">
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

        {showWeeklyBanner && (
          <div className="absolute left-1/2 top-1/2 z-10 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2">
            <LoginBanner
              variant="card-cta"
              onDismiss={() => {
                dismissNudge("weekly");
                setDismissedWeeklyBanner(true);
              }}
            />
          </div>
        )}
      </div>

      {/* 주간 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-container p-3 rounded-xl flex flex-col justify-between h-20">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-medium">
            주간 합계
          </span>
          <div className="flex items-end gap-1">
            <span
              className={`font-headline font-bold text-xl tracking-tighter ${netColor}`}
            >
              {weekNetCalories === 0
                ? "—"
                : weekNetCalories > 0
                  ? `+${weekNetCalories.toLocaleString()}`
                  : weekNetCalories.toLocaleString()}
            </span>
            {weekNetCalories !== 0 && (
              <span className="font-label text-xs text-on-surface-variant mb-0.5">
                kcal
              </span>
            )}
          </div>
        </div>
        <div className="bg-surface-container p-3 rounded-xl flex flex-col justify-between h-20">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-medium">
            일평균
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`font-headline font-bold text-xl tracking-tighter ${avgColor}`}
            >
              {avgDailyNet !== null ? avgDailyNet.toLocaleString() : "—"}
            </span>
            {avgDailyNet !== null && bmr > 0 && (
              <span className={`font-label text-[12px] ${avgColor}`}>
                ({avgDailyNet - bmr > 0 ? "+" : ""}
                {(avgDailyNet - bmr).toLocaleString()} kcal)
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
