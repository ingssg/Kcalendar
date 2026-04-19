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

  const showWeeklyBanner =
    isReady &&
    !isLoggedIn &&
    !dismissedWeeklyBanner &&
    shouldShowNudge("weekly", { ignoreSession: true });

  return (
    <main className="w-full max-w-md mx-auto px-6 pt-8 pb-8">
      <header className="mb-8 flex flex-col gap-5">
        <AppTopBar
          logoPriority
          logoSize="md"
          rightSlot={<AuthMenuButton profileHref="/onboarding" />}
        />
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
      <div className="relative mb-10">
        <div className="flex flex-col gap-3">
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
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-32 shadow-[0_12px_32px_rgba(25,28,29,0.04)]">
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
        <div className="col-span-2 bg-surface-container p-6 rounded-xl flex flex-col justify-between h-32">
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
