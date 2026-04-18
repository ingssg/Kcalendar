"use client";

import { useState, useCallback } from "react";
import type { DayRecord, UserProfile } from "@kcalendar/types";
import { getStorage } from "@/lib/storage";
import { today as getToday, formatDisplayDate } from "@/lib/date";
import { AppLogo } from "@/components/app-logo";
import { SummaryCard } from "@/components/summary-card";
import { FoodList } from "@/components/food-list";
import { FoodInput } from "@/components/food-input";

export default function TodayPage() {
  const todayStr = getToday();
  const [profile, setProfile] = useState<UserProfile | null>(
    () => getStorage().profile,
  );
  const [dayRecord, setDayRecord] = useState<DayRecord | null>(
    () => getStorage().records[todayStr] ?? null,
  );

  const reload = useCallback(() => {
    const storage = getStorage();
    setProfile(storage.profile);
    setDayRecord(storage.records[todayStr] ?? null);
  }, [todayStr]);

  const bmr = profile?.bmr ?? 0;
  const totalCalories = dayRecord?.totalCalories ?? 0;
  const entries = dayRecord?.entries ?? [];

  return (
    <main className="w-full max-w-md mx-auto px-6 pt-8 pb-8 flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <AppLogo priority size="md" />
        <section>
          <h1 className="sr-only">오늘 기록</h1>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
            {formatDisplayDate(todayStr)}
          </h2>
        </section>
      </header>

      {/* 3단 요약 카드 */}
      {profile && (
        <SummaryCard
          bmr={bmr}
          totalCalories={totalCalories}
          hasRecords={entries.length > 0}
        />
      )}

      {/* 자연어 입력창 */}
      <FoodInput date={todayStr} onEntriesAdded={reload} />

      {/* 음식 항목 리스트 */}
      {entries.length > 0 && (
        <FoodList entries={entries} date={todayStr} onUpdate={reload} />
      )}
    </main>
  );
}
