"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { today as getToday, formatDisplayDate } from "@/lib/date";
import { useAuth } from "@/lib/hooks/use-auth";
import { useDayRecord } from "@/lib/hooks/use-day-record";
import { useProfile } from "@/lib/hooks/use-profile";
import { AppTopBar } from "@/components/app-top-bar";
import { AuthMenuButton } from "@/components/auth-menu-button";
import { IosToast } from "@/components/ios-toast";
import { LoginBanner } from "@/components/login-banner";
import { SummaryCard } from "@/components/summary-card";
import { FoodList } from "@/components/food-list";
import { FoodInput } from "@/components/food-input";
import { calculateBurnCalories } from "@/lib/entries";
import {
  dismissNudge,
  getRecordedDaysCount,
  isIosSafariBrowser,
  shouldShowNudge,
} from "@/lib/login-nudge";

const subscribeNoop = () => () => {};

export default function TodayPage() {
  const router = useRouter();
  const todayStr = useSyncExternalStore(subscribeNoop, getToday, () => "");
  const { isLoggedIn, isReady } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { record: dayRecord } = useDayRecord(todayStr);
  const [dismissedInlineBanner, setDismissedInlineBanner] = useState(false);
  const [dismissedIosToast, setDismissedIosToast] = useState(false);

  const foodListRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(() => {}, []);

  const handleEntriesAdded = useCallback(() => {
    requestAnimationFrame(() => {
      foodListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  useEffect(() => {
    if (isProfileLoading || profile) return;
    router.replace("/onboarding");
  }, [isProfileLoading, profile, router]);

  const canShowNudge =
    isReady &&
    !isLoggedIn &&
    !!profile &&
    shouldShowNudge("today", { ignoreSession: true });
  const recordedDaysCount = canShowNudge ? getRecordedDaysCount() : 0;
  const showInlineBanner =
    canShowNudge && recordedDaysCount >= 3 && !dismissedInlineBanner;
  const showIosToast =
    canShowNudge &&
    recordedDaysCount < 3 &&
    isIosSafariBrowser() &&
    !dismissedIosToast;

  const bmr = profile?.bmr ?? 0;
  const totalCalories = dayRecord?.totalCalories ?? 0;
  const entries = dayRecord?.entries ?? [];
  const burnCalories = calculateBurnCalories(entries);
  const hasIntakeRecords = entries.length > 0;

  if (isProfileLoading || !profile) {
    return null;
  }

  return (
    <main className="w-full max-w-md mx-auto px-6 pt-5 pb-8 flex flex-col gap-4">
      <header className="flex flex-col gap-4">
        <AppTopBar logoPriority logoSize="md" rightSlot={<AuthMenuButton />} />
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
          burnCalories={burnCalories}
          hasRecords={hasIntakeRecords}
        />
      )}

      <div className="relative">
        {/* 자연어 입력창 */}
        {todayStr && (
          <FoodInput date={todayStr} onEntriesAdded={handleEntriesAdded} />
        )}

        {/* 음식 항목 리스트 */}
        <div ref={foodListRef} className={entries.length > 0 ? "mt-4" : ""}>
          {todayStr && entries.length > 0 && (
            <FoodList entries={entries} date={todayStr} onUpdate={reload} />
          )}
        </div>

        {showInlineBanner && (
          <div className="absolute left-1/2 top-1/2 z-10 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 -translate-y-[calc(50%+50px)]">
            <LoginBanner
              variant="card-cta"
              onDismiss={() => {
                dismissNudge("today");
                setDismissedInlineBanner(true);
              }}
            />
          </div>
        )}
      </div>

      {showIosToast && (
        <IosToast
          onDismiss={() => {
            dismissNudge("today");
            setDismissedIosToast(true);
          }}
        />
      )}
    </main>
  );
}
