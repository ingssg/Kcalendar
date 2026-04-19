"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FoodEntry, MealType } from "@kcalendar/types";
import { useFoodMutations } from "@/lib/hooks/use-food-mutations";

interface FoodListProps {
  entries: FoodEntry[];
  date: string;
  readOnly?: boolean;
  onUpdate?: () => void;
  title?: string;
}

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

const MEAL_ORDER: Record<MealType, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
};

export function FoodList({
  entries,
  date,
  readOnly = false,
  onUpdate,
  title = "오늘의 기록",
}: FoodListProps) {
  const { updateMutation, deleteMutation } = useFoodMutations(date);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCalories, setEditCalories] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const sortedEntries = useMemo(
    () =>
      entries
        .map((entry, index) => ({ entry, index }))
        .sort((left, right) => {
          const leftOrder =
            left.entry.mealType !== undefined
              ? MEAL_ORDER[left.entry.mealType]
              : Number.MAX_SAFE_INTEGER;
          const rightOrder =
            right.entry.mealType !== undefined
              ? MEAL_ORDER[right.entry.mealType]
              : Number.MAX_SAFE_INTEGER;

          if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
          }

          return left.index - right.index;
        })
        .map(({ entry }) => entry),
    [entries],
  );

  useEffect(() => {
    if (!menuOpenId) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  function startEdit(entry: FoodEntry) {
    setMenuOpenId(null);
    setEditingId(entry.id);
    setEditName(entry.name);
    setEditCalories(entry.calories?.toString() ?? "");
  }

  function saveEdit(entryId: string) {
    const calories = editCalories === "" ? null : parseInt(editCalories, 10);
    updateMutation.mutate(
      {
        entryId,
        patch: {
          name: editName.trim() || undefined,
          calories: Number.isNaN(calories) ? null : calories,
        },
      },
      {
        onSuccess: () => {
          onUpdate?.();
          setEditingId(null);
        },
      },
    );
  }

  function handleDelete(entryId: string) {
    setMenuOpenId(null);
    deleteMutation.mutate(entryId, {
      onSuccess: () => {
        onUpdate?.();
      },
    });
  }

  if (entries.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <h3 className="font-headline text-xl font-bold text-on-surface tracking-tight">
        {title}
      </h3>
      <div className="flex flex-col gap-4">
        {sortedEntries.map((entry) => (
          <div
            key={entry.id}
            className="relative bg-surface-container-lowest rounded-xl px-5 shadow-[0_12px_32px_rgba(25,28,29,0.04)]"
          >
            {editingId === entry.id ? (
              <div className="flex flex-col gap-3 py-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="음식명"
                  className="w-full bg-surface-container-low rounded-md px-3 py-2 font-body text-sm text-on-surface focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editCalories}
                    onChange={(e) => setEditCalories(e.target.value)}
                    placeholder="칼로리"
                    className="w-28 bg-surface-container-low rounded-md px-3 py-2 font-headline text-sm text-on-surface focus:outline-none text-right"
                  />
                  <span className="font-label text-xs text-on-surface-variant">
                    kcal
                  </span>
                  <button
                    onClick={() => setEditingId(null)}
                    className="ml-auto font-label text-xs text-on-surface-variant px-3 py-2 rounded-md hover:bg-surface-container-high transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => saveEdit(entry.id)}
                    className="font-label text-xs font-medium text-on-primary bg-primary px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                  >
                    완료
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ⋮ 버튼 — 카드 우상단 고정 */}
                {!readOnly && (
                  <div
                    className="absolute top-3 right-3"
                    ref={menuOpenId === entry.id ? menuRef : undefined}
                  >
                    <button
                      data-shadow="none"
                      onClick={() =>
                        setMenuOpenId(menuOpenId === entry.id ? null : entry.id)
                      }
                      className="rounded-full p-1 text-on-surface-variant shadow-none transition-colors hover:bg-transparent hover:text-on-surface hover:shadow-none"
                      aria-label="더보기"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        more_vert
                      </span>
                    </button>

                    {menuOpenId === entry.id && (
                      <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_rgba(25,28,29,0.12)] z-10 overflow-hidden min-w-24">
                        <button
                          onClick={() => startEdit(entry)}
                          className="flex w-full items-center gap-2 px-4 py-3 font-body text-sm text-on-surface shadow-none transition-colors hover:bg-surface-container-low hover:shadow-none"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            edit
                          </span>
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="flex w-full items-center gap-2 px-4 py-3 font-body text-sm text-tertiary shadow-none transition-colors hover:bg-surface-container-low hover:shadow-none"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col py-4 pr-8">
                  {/* 식사 태그 */}
                  {entry.mealType && (
                    <span className="self-start mb-2 px-2.5 py-0.5 rounded-full bg-surface-container-high font-label text-[0.625rem] tracking-widest uppercase text-on-surface-variant font-medium">
                      {MEAL_LABEL[entry.mealType]}
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-body text-base font-medium text-on-surface truncate mr-4">
                      {entry.name}
                    </span>
                    {entry.calories !== null ? (
                      <span className="font-headline text-xl font-bold text-on-surface shrink-0">
                        {entry.calories.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-on-surface-variant">
                          kcal
                        </span>
                      </span>
                    ) : (
                      <span className="font-headline text-xl font-bold text-on-surface-variant opacity-30 shrink-0">
                        -- <span className="text-xs font-normal">kcal</span>
                      </span>
                    )}
                  </div>

                  {entry.calories === null && (
                    <span className="font-label text-[0.6875rem] text-on-surface-variant/50 font-medium tracking-wide mt-1">
                      추정 불가
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
