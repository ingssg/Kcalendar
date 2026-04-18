"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { DayRecord, UserProfile } from "@kcalendar/types";
import { getStorage } from "@/lib/storage";
import { formatDisplayDate } from "@/lib/date";
import { SummaryCard } from "@/components/summary-card";
import { FoodList } from "@/components/food-list";

export default function DateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dateStr = params.date as string;

  const [profile] = useState<UserProfile | null>(() => getStorage().profile);
  const [dayRecord] = useState<DayRecord | null>(
    () => getStorage().records[dateStr] ?? null,
  );

  const bmr = profile?.bmr ?? 0;
  const totalCalories = dayRecord?.totalCalories ?? 0;
  const entries = dayRecord?.entries ?? [];

  return (
    <>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-107.5 z-50 bg-surface/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined text-on-surface">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold tracking-tight text-lg text-on-surface">
            {formatDisplayDate(dateStr)}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-md mx-auto px-6 pt-24 pb-8 flex flex-col gap-8">
        {profile && (
          <SummaryCard
            bmr={bmr}
            totalCalories={totalCalories}
            hasRecords={entries.length > 0}
          />
        )}

        {entries.length > 0 ? (
          <FoodList entries={entries} date={dateStr} readOnly />
        ) : (
          <p className="font-body text-sm text-on-surface-variant">
            이 날의 기록이 없습니다.
          </p>
        )}
      </main>
    </>
  );
}
