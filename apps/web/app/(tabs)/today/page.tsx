"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { defaultStorage, getStorage, subscribeStorage } from "@/lib/storage";
import { today as getToday, formatDisplayDate } from "@/lib/date";
import { AppTopBar } from "@/components/app-top-bar";
import { SummaryCard } from "@/components/summary-card";
import { FoodList } from "@/components/food-list";
import { FoodInput } from "@/components/food-input";

const subscribeNoop = () => () => {};

export default function TodayPage() {
  const router = useRouter();
  const storage = useSyncExternalStore(
    subscribeStorage,
    getStorage,
    () => defaultStorage,
  );
  const todayStr = useSyncExternalStore(subscribeNoop, getToday, () => "");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profile = storage.profile;
  const dayRecord = todayStr ? (storage.records[todayStr] ?? null) : null;

  const reload = useCallback(() => {}, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (profile) return;
    router.replace("/onboarding");
  }, [profile, router]);

  const bmr = profile?.bmr ?? 0;
  const totalCalories = dayRecord?.totalCalories ?? 0;
  const entries = dayRecord?.entries ?? [];

  if (!profile) {
    return null;
  }

  return (
    <main className="relative w-full max-w-md mx-auto px-6 pt-8 pb-8 flex flex-col gap-4">
      <div className="absolute right-6 top-8 z-40" ref={menuRef}>
        <div className="flex justify-end">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container-high"
              aria-label="더보기"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="material-symbols-outlined text-[20px]">
                more_vert
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-28 overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_12px_32px_rgba(25,28,29,0.12)]">
                <Link
                  href="/onboarding"
                  className="block px-4 py-3 font-body text-sm text-on-surface transition-colors hover:bg-surface-container-low"
                  onClick={() => setMenuOpen(false)}
                >
                  프로필 수정
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

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
