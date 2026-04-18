'use client'

import { useState } from 'react'
import type { FoodEntry } from '@kcalendar/types'
import { updateFoodEntryCalories } from '@/lib/storage'

interface FoodListProps {
  entries: FoodEntry[]
  date: string
  readOnly?: boolean
  onUpdate?: () => void
}

export function FoodList({ entries, date, readOnly = false, onUpdate }: FoodListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  function startEdit(entry: FoodEntry) {
    setEditingId(entry.id)
    setEditValue(entry.calories?.toString() ?? '')
  }

  function saveEdit(entryId: string) {
    const calories = parseInt(editValue, 10)
    if (!isNaN(calories) && calories >= 0) {
      updateFoodEntryCalories(date, entryId, calories)
      onUpdate?.()
    }
    setEditingId(null)
  }

  function handleKeyDown(e: React.KeyboardEvent, entryId: string) {
    if (e.key === 'Enter') saveEdit(entryId)
    if (e.key === 'Escape') setEditingId(null)
  }

  if (entries.length === 0) return null

  return (
    <section className="flex flex-col gap-6">
      <h3 className="font-headline text-xl font-bold text-on-surface tracking-tight">오늘의 기록</h3>
      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between py-4 bg-surface-container-lowest rounded-xl px-5 shadow-[0_12px_32px_rgba(25,28,29,0.04)]"
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0 mr-4">
              <span className="font-body text-base font-medium text-on-surface truncate">
                {entry.name}
              </span>
              {entry.calories === null && (
                <span className="font-label text-[0.6875rem] text-on-surface-variant/50 font-medium tracking-wide">
                  추정 불가
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {editingId === entry.id ? (
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit(entry.id)}
                  onKeyDown={(e) => handleKeyDown(e, entry.id)}
                  autoFocus
                  className="w-20 font-headline text-xl font-bold text-on-surface bg-surface-container-low rounded px-2 py-1 focus:outline-none text-right"
                />
              ) : entry.calories !== null ? (
                <span className="font-headline text-xl font-bold text-on-surface">
                  {entry.calories.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-on-surface-variant">kcal</span>
                </span>
              ) : (
                <span className="font-headline text-xl font-bold text-on-surface-variant opacity-30">
                  --{' '}
                  <span className="text-xs font-normal">kcal</span>
                </span>
              )}

              {!readOnly && (
                <button
                  onClick={() => (editingId === entry.id ? saveEdit(entry.id) : startEdit(entry))}
                  className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-high"
                  aria-label={editingId === entry.id ? '저장' : '수정'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {editingId === entry.id ? 'check' : 'edit'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
