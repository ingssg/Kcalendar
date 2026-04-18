"use client";

import { useCallback, useSyncExternalStore } from "react";
import { defaultStorage, getStorage, subscribeStorage } from "@/lib/storage";
import { today as getToday, formatDisplayDate } from "@/lib/date";
import { AppTopBar } from "@/components/app-top-bar";
import { SummaryCard } from "@/components/summary-card";
import { FoodList } from "@/components/food-list";
import { FoodInput } from "@/components/food-input";

const subscribeNoop = () => () => {};

export default function TodayPage() {
  const storage = useSyncExternalStore(
    subscribeStorage,
    getStorage,
    () => defaultStorage,
  );
  const todayStr = useSyncExternalStore(subscribeNoop, getToday, () => "");
  const profile = storage.profile;
  const dayRecord = todayStr ? (storage.records[todayStr] ?? null) : null;

  const reload = useCallback(() => {}, []);

  const bmr = profile?.bmr ?? 0;
  const totalCalories = dayRecord?.totalCalories ?? 0;
  const entries = dayRecord?.entries ?? [];

  return (
    <main className="w-full max-w-md mx-auto px-6 pt-8 pb-8 flex flex-col gap-4">
      <header className="flex flex-col gap-4">
        <AppTopBar logoPriority logoSize="md" />
        <section>
          <h1 className="sr-only">오늘 기록</h1>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
            {todayStr ? formatDisplayDate(todayStr) : ""}
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
      {todayStr && <FoodInput date={todayStr} onEntriesAdded={reload} />}

      {/* 음식 항목 리스트 */}
      {todayStr && entries.length > 0 && (
        <FoodList entries={entries} date={todayStr} onUpdate={reload} />
      )}
    </main>
  );
}
