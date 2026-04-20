"use client";

import { useRouter, useParams } from "next/navigation";
import { formatDisplayDate } from "@/lib/date";
import { useDayRecord } from "@/lib/hooks/use-day-record";
import { useProfile } from "@/lib/hooks/use-profile";
import { calculateBurnCalories } from "@/lib/entries";
import { AppTopBar } from "@/components/app-top-bar";
import { AuthMenuButton } from "@/components/auth-menu-button";
import { SummaryCard } from "@/components/summary-card";
import { FoodList } from "@/components/food-list";

export default function DateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dateStr = params.date as string;
  const { profile } = useProfile();
  const { record: dayRecord } = useDayRecord(dateStr);

  const bmr = profile?.bmr ?? 0;
  const totalCalories = dayRecord?.totalCalories ?? 0;
  const entries = dayRecord?.entries ?? [];
  const burnCalories = calculateBurnCalories(entries);
  const hasIntakeRecords = entries.length > 0;

  return (
    <>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-107.5 z-50 bg-surface/80 backdrop-blur-md">
        <div className="px-6 py-4">
          <AppTopBar
            logoPriority
            logoSize="md"
            leftSlot={
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200"
              >
                <span className="material-symbols-outlined text-on-surface">
                  arrow_back
                </span>
              </button>
            }
            rightSlot={<AuthMenuButton profileHref="/onboarding" />}
          />
        </div>
      </header>

      <main className="w-full max-w-md mx-auto px-6 pt-24 pb-8 flex flex-col gap-8">
        <section>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
            {formatDisplayDate(dateStr)}
          </h1>
        </section>

        {profile && (
          <SummaryCard
            bmr={bmr}
            totalCalories={totalCalories}
            burnCalories={burnCalories}
            hasRecords={hasIntakeRecords}
          />
        )}

        {entries.length > 0 ? (
          <FoodList entries={entries} date={dateStr} readOnly title="" />
        ) : (
          <p className="font-body text-sm text-on-surface-variant">
            이 날의 기록이 없습니다.
          </p>
        )}
      </main>
    </>
  );
}
