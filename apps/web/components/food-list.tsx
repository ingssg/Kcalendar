"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createPortal } from "react-dom";
import type { FoodEntry, MealType } from "@kcalendar/types";
import { ButtonGroup } from "@/components/button-group";
import { useFoodMutations } from "@/lib/hooks/use-food-mutations";
import { isActivityEntry } from "@/lib/entries";

interface FoodListProps {
  entries: FoodEntry[];
  date: string;
  readOnly?: boolean;
  onUpdate?: () => void;
  title?: string;
}

type RecordFilter = "all" | MealType | "activity";
type GroupKey = MealType | "activity";

const FILTER_OPTIONS: { value: RecordFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "breakfast", label: "아침" },
  { value: "lunch", label: "점심" },
  { value: "dinner", label: "저녁" },
  { value: "activity", label: "활동" },
];

const GROUP_LABEL: Record<GroupKey, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  activity: "활동",
};

const SUMMARY_LABEL: Record<GroupKey, string> = {
  breakfast: "아침 섭취량",
  lunch: "점심 섭취량",
  dinner: "저녁 섭취량",
  activity: "활동 소모량",
};

const GROUP_ORDER: Record<GroupKey, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
  activity: 3,
};

const EMPTY_FILTER_MESSAGE: Partial<Record<RecordFilter, string>> = {
  breakfast: "아침 식사를 하지 않았어요.",
  lunch: "점심 식사를 하지 않았어요.",
  dinner: "저녁 식사를 하지 않았어요.",
  activity: "활동을 하지 않았어요.",
};

const MENU_WIDTH = 112;
const MENU_HEIGHT = 104;
const MENU_VIEWPORT_GAP = 12;
const MENU_OFFSET = 4;

function getEntryGroup(entry: FoodEntry): GroupKey {
  if (isActivityEntry(entry)) {
    return "activity";
  }

  return entry.mealType ?? "lunch";
}

function formatCalories(
  value: number | null,
  options?: { forcePlus?: boolean; asBurn?: boolean },
) {
  if (value === null) {
    return null;
  }

  if (options?.asBurn) {
    return `-${Math.abs(value).toLocaleString()}`;
  }

  const display =
    options?.forcePlus && value > 0
      ? `+${value.toLocaleString()}`
      : value.toLocaleString();
  return display;
}

function getSummaryValue(entries: FoodEntry[]) {
  return entries.reduce((sum, entry) => sum + (entry.calories ?? 0), 0);
}

export function FoodList({
  entries,
  date,
  readOnly = false,
  onUpdate,
  title = "오늘의 기록",
}: FoodListProps) {
  const { updateMutation, deleteMutation } = useFoodMutations(date);
  const [filter, setFilter] = useState<RecordFilter>("all");
  const cardsRef = useRef<HTMLDivElement>(null);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCalories, setEditCalories] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const groupedEntries = useMemo(() => {
    const groups = new Map<GroupKey, FoodEntry[]>();

    entries.forEach((entry) => {
      const group = getEntryGroup(entry);
      const existing = groups.get(group) ?? [];
      existing.push(entry);
      groups.set(group, existing);
    });

    return Array.from(groups.entries())
      .sort((left, right) => GROUP_ORDER[left[0]] - GROUP_ORDER[right[0]])
      .map(([group, groupEntries]) => ({
        group,
        label: GROUP_LABEL[group],
        summaryLabel: SUMMARY_LABEL[group],
        entries: groupEntries,
        totalCalories: getSummaryValue(groupEntries),
      }));
  }, [entries]);

  const visibleGroups = useMemo(() => {
    if (filter === "all") {
      return groupedEntries;
    }

    return groupedEntries.filter((group) => group.group === filter);
  }, [filter, groupedEntries]);

  useEffect(() => {
    if (!menuOpenId) return;
    const activeMenuId = menuOpenId;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const activeButton = buttonRefs.current[activeMenuId];

      if (menuRef.current?.contains(target) || activeButton?.contains(target)) {
        return;
      }

      setMenuOpenId(null);
      setMenuPosition(null);
    }

    function updateMenuPosition() {
      const activeButton = buttonRefs.current[activeMenuId];
      if (!activeButton) {
        return;
      }

      const rect = activeButton.getBoundingClientRect();
      const maxLeft = Math.max(
        MENU_VIEWPORT_GAP,
        window.innerWidth - MENU_WIDTH - MENU_VIEWPORT_GAP,
      );
      const left = Math.min(
        Math.max(rect.right - MENU_WIDTH, MENU_VIEWPORT_GAP),
        maxLeft,
      );
      const hasSpaceBelow =
        window.innerHeight - rect.bottom >= MENU_HEIGHT + MENU_OFFSET;
      const top = hasSpaceBelow
        ? rect.bottom + MENU_OFFSET
        : Math.max(MENU_VIEWPORT_GAP, rect.top - MENU_HEIGHT - MENU_OFFSET);

      setMenuPosition({ left, top });
    }

    updateMenuPosition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuOpenId]);

  function startEdit(entry: FoodEntry) {
    setMenuOpenId(null);
    setMenuPosition(null);
    setEditingId(entry.id);
    setEditName(entry.name);
    setEditCalories(
      entry.calories === null ? "" : Math.abs(entry.calories).toString(),
    );
  }

  function saveEdit(entry: FoodEntry) {
    const parsedCalories =
      editCalories === "" ? null : parseInt(editCalories, 10);
    const nextCalories =
      parsedCalories === null || Number.isNaN(parsedCalories)
        ? null
        : parsedCalories;

    updateMutation.mutate(
      {
        entryId: entry.id,
        patch: {
          name: editName.trim() || undefined,
          calories: nextCalories,
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
    setMenuPosition(null);
    deleteMutation.mutate(entryId, {
      onSuccess: () => {
        onUpdate?.();
      },
    });
  }

  if (entries.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      {title ? (
        <h3 className="font-headline text-xl font-bold text-on-surface tracking-tight">
          {title}
        </h3>
      ) : null}

      <ButtonGroup
        options={FILTER_OPTIONS}
        value={filter}
        onChange={(v) => {
          flushSync(() => setFilter(v));
          if (!cardsRef.current) return;
          const rect = cardsRef.current.getBoundingClientRect();
          window.scrollTo({
            top: window.scrollY + rect.top - 8,
            behavior: "smooth",
          });
        }}
        size="pill"
        tone="strong"
      />

      <div ref={cardsRef} className="flex flex-col gap-3">
        {visibleGroups.length === 0 && filter !== "all" && (
          <p className="py-6 text-center font-body text-sm text-on-surface-variant">
            {EMPTY_FILTER_MESSAGE[filter]}
          </p>
        )}
        {visibleGroups.map((group) => (
          <section
            key={group.group}
            className="rounded-2xl bg-surface-container-lowest px-5 shadow-[0_12px_32px_rgba(25,28,29,0.04)]"
          >
            <header className="flex items-center gap-2 pt-4">
              <span
                className={`rounded-full px-2.5 py-0.5 font-label text-[0.625rem] font-medium tracking-widest ${
                  group.group === "activity"
                    ? "bg-secondary/12 text-secondary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {group.label}
              </span>
            </header>

            <div className="flex flex-col">
              {group.entries.map((entry, index) => {
                const isActivity = isActivityEntry(entry);
                const isEditing = editingId === entry.id;
                const showDivider = index > 0;

                if (isEditing) {
                  return (
                    <div
                      key={entry.id}
                      className={`flex flex-col gap-3 py-3.5 ${showDivider ? "border-t border-[#f0f0f0]" : ""}`}
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="기록명"
                        className="w-full rounded-md bg-surface-container-low px-3 py-2 font-body text-sm text-on-surface focus:outline-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editCalories}
                          onChange={(e) => setEditCalories(e.target.value)}
                          placeholder="칼로리"
                          className="w-28 rounded-md bg-surface-container-low px-3 py-2 text-right font-headline text-sm text-on-surface focus:outline-none"
                        />
                        <span className="font-label text-xs text-on-surface-variant">
                          kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="ml-auto rounded-md px-3 py-2 font-label text-xs text-on-surface-variant transition-colors hover:bg-surface-container-high"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(entry)}
                          className="rounded-md bg-primary px-4 py-2 font-label text-xs font-medium text-on-primary transition-opacity hover:opacity-90"
                        >
                          완료
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between gap-3 py-3.5 ${
                      showDivider ? "border-t border-[#f0f0f0]" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-body text-base font-medium text-on-surface">
                        {entry.name}
                      </p>
                      {entry.calories === null && (
                        <p className="mt-1 font-label text-[0.6875rem] font-medium tracking-wide text-on-surface-variant/60">
                          추정 불가
                        </p>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <span
                        className={`shrink-0 font-headline text-xl font-bold tracking-tight ${
                          isActivity ? "text-secondary" : "text-on-surface"
                        }`}
                      >
                        {entry.calories === null ? (
                          <>
                            --{" "}
                            <span className="text-xs font-normal text-on-surface-variant">
                              kcal
                            </span>
                          </>
                        ) : (
                          <>
                            {formatCalories(entry.calories, {
                              asBurn: isActivity,
                            })}{" "}
                            <span className="text-xs font-normal text-on-surface-variant">
                              kcal
                            </span>
                          </>
                        )}
                      </span>
                      {!readOnly && (
                        <button
                          type="button"
                          data-shadow="none"
                          ref={(node) => {
                            buttonRefs.current[entry.id] = node;
                          }}
                          onClick={(event) => {
                            if (menuOpenId === entry.id) {
                              setMenuOpenId(null);
                              setMenuPosition(null);
                              return;
                            }

                            const rect =
                              event.currentTarget.getBoundingClientRect();
                            const maxLeft = Math.max(
                              MENU_VIEWPORT_GAP,
                              window.innerWidth -
                                MENU_WIDTH -
                                MENU_VIEWPORT_GAP,
                            );
                            const left = Math.min(
                              Math.max(
                                rect.right - MENU_WIDTH,
                                MENU_VIEWPORT_GAP,
                              ),
                              maxLeft,
                            );
                            const hasSpaceBelow =
                              window.innerHeight - rect.bottom >=
                              MENU_HEIGHT + MENU_OFFSET;
                            const top = hasSpaceBelow
                              ? rect.bottom + MENU_OFFSET
                              : Math.max(
                                  MENU_VIEWPORT_GAP,
                                  rect.top - MENU_HEIGHT - MENU_OFFSET,
                                );

                            setMenuOpenId(entry.id);
                            setMenuPosition({ left, top });
                          }}
                          className="rounded-full p-1 text-on-surface-variant transition-colors hover:text-on-surface"
                          aria-label="더보기"
                        >
                          <span className="material-symbols-outlined text-[21px]">
                            more_vert
                          </span>
                        </button>
                      )}
                      {readOnly && <span className="h-7 w-7 shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 border-t-2 border-[rgba(104,104,104,0.62)] pt-3.5 pb-4">
              <span className="font-label text-[0.6875rem] tracking-widest text-on-surface-variant">
                {group.summaryLabel}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <span
                  className={`shrink-0 font-headline text-xl font-bold tracking-tight ${
                    group.group === "activity"
                      ? "text-secondary"
                      : "text-on-surface"
                  }`}
                >
                  {formatCalories(group.totalCalories, {
                    asBurn: group.group === "activity",
                  })}{" "}
                  <span className="text-xs font-normal text-on-surface-variant">
                    kcal
                  </span>
                </span>
                <span className="h-7 w-7 shrink-0" />
              </div>
            </div>
          </section>
        ))}
      </div>

      {menuOpenId &&
        menuPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_12px_32px_rgba(25,28,29,0.12)]"
            style={{
              left: `${menuPosition.left}px`,
              top: `${menuPosition.top}px`,
              width: `${MENU_WIDTH}px`,
              zIndex: 70,
            }}
          >
            <button
              onClick={() => {
                const activeEntry = entries.find(
                  (entry) => entry.id === menuOpenId,
                );
                if (activeEntry) {
                  startEdit(activeEntry);
                }
              }}
              className="flex w-full items-center gap-2 px-4 py-3 font-body text-sm text-on-surface shadow-none transition-colors hover:bg-surface-container-low hover:shadow-none"
            >
              <span className="material-symbols-outlined text-[16px]">
                edit
              </span>
              수정
            </button>
            <button
              onClick={() => handleDelete(menuOpenId)}
              className="flex w-full items-center gap-2 px-4 py-3 font-body text-sm text-tertiary shadow-none transition-colors hover:bg-surface-container-low hover:shadow-none"
            >
              <span className="material-symbols-outlined text-[16px]">
                delete
              </span>
              삭제
            </button>
          </div>,
          document.body,
        )}
    </section>
  );
}
