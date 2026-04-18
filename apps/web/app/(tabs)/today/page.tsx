'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DayRecord, UserProfile } from '@kcalendar/types'
import { getStorage } from '@/lib/storage'
import { today as getToday, formatDisplayDate } from '@/lib/date'
import { SummaryCard } from '@/components/summary-card'
import { FoodList } from '@/components/food-list'
import { FoodInput } from '@/components/food-input'

export default function TodayPage() {
  const todayStr = getToday()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [dayRecord, setDayRecord] = useState<DayRecord | null>(null)

  const reload = useCallback(() => {
    const storage = getStorage()
    setProfile(storage.profile)
    setDayRecord(storage.records[todayStr] ?? null)
  }, [todayStr])

  useEffect(() => {
    reload()
  }, [reload])

  const bmr = profile?.bmr ?? 0
  const totalCalories = dayRecord?.totalCalories ?? 0
  const entries = dayRecord?.entries ?? []

  return (
    <main className="w-full max-w-md mx-auto px-6 pt-10 pb-8 flex flex-col gap-8">
      {/* 날짜 헤더 */}
      <section>
        <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
          {formatDisplayDate(todayStr)}
        </h2>
      </section>

      {/* 3단 요약 카드 */}
      {profile && <SummaryCard bmr={bmr} totalCalories={totalCalories} />}

      {/* 자연어 입력창 */}
      <FoodInput date={todayStr} onEntriesAdded={reload} />

      {/* 음식 항목 리스트 */}
      {entries.length > 0 && (
        <FoodList entries={entries} date={todayStr} onUpdate={reload} />
      )}
    </main>
  )
}
