"use client";

import { useState } from "react";
import type {
  FoodEntry,
  MealType,
  ParseActivityResponse,
  ParseFoodResponse,
} from "@kcalendar/types";
import { ButtonGroup } from "@/components/button-group";
import { useFoodMutations } from "@/lib/hooks/use-food-mutations";

interface FoodInputProps {
  date: string;
  onEntriesAdded: () => void;
}

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "아침" },
  { value: "lunch", label: "점심" },
  { value: "dinner", label: "저녁" },
];

type InputMode = "food" | "activity";

export function FoodInput({ date, onEntriesAdded }: FoodInputProps) {
  const { addMutation } = useFoodMutations(date);
  const [mode, setMode] = useState<InputMode>("food");
  const [inputText, setInputText] = useState("");
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const text = inputText.trim();
    if (!text || loading) return;

    if (mode === "food" && !mealType) {
      setError("식사 유형을 선택해 주세요!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint =
        mode === "food" ? "/api/parse-food" : "/api/parse-activity";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });

      if (res.status === 429) {
        setError("잠시 후 다시 시도해주세요 (요청 한도 초과)");
        return;
      }
      if (!res.ok) {
        setError("파싱에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      const data: ParseFoodResponse | ParseActivityResponse = await res.json();

      if (data.items.length === 0) {
        setError(
          mode === "food"
            ? "이해하기 쉬운 음식명을 입력해주세요!"
            : "이해하기 쉬운 활동명을 입력해주세요!",
        );
        return;
      }

      const newEntries: FoodEntry[] = data.items.map((item) => ({
        id: crypto.randomUUID(),
        entryType: mode,
        name: item.name,
        calories: item.calories,
        isEstimated: true,
        ...(mode === "food" && mealType ? { mealType } : {}),
        ...(mode === "activity"
          ? {
              activityType: "activityType" in item ? item.activityType : null,
              durationMinutes:
                "durationMinutes" in item ? item.durationMinutes : null,
            }
          : {}),
      }));

      await addMutation.mutateAsync(newEntries);
      onEntriesAdded();
      setInputText("");
      setMealType(null);
    } catch {
      setError("기록 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pt-1">
      <div className="relative z-0 -mb-2.5 flex gap-2">
        <button
          type="button"
          data-shadow="none"
          onClick={() => {
            setMode("food");
            setError(null);
          }}
          className={`relative flex-1 rounded-t-2xl px-4 pb-3.5 pt-2 text-center font-headline text-[0.9375rem] font-bold tracking-tight transition-colors ${
            mode === "food"
              ? "z-0 bg-surface-container text-on-surface"
              : "z-0 bg-[#d3d6d8] text-on-surface-variant"
          }`}
        >
          {mode === "food" && (
            <span className="pointer-events-none absolute inset-0 rounded-t-2xl border border-outline-variant border-b-0 [clip-path:inset(0_0_10px_0)]" />
          )}
          <span className="relative">음식</span>
        </button>
        <button
          type="button"
          data-shadow="none"
          onClick={() => {
            setMode("activity");
            setError(null);
          }}
          className={`relative flex-1 rounded-t-2xl px-4 pb-3.5 pt-2 text-center font-headline text-[0.9375rem] font-bold tracking-tight transition-colors ${
            mode === "activity"
              ? "z-0 bg-surface-container text-on-surface"
              : "z-0 bg-[#d3d6d8] text-on-surface-variant"
          }`}
        >
          {mode === "activity" && (
            <span className="pointer-events-none absolute inset-0 rounded-t-2xl border border-outline-variant border-b-0 [clip-path:inset(0_0_10px_0)]" />
          )}
          <span className="relative">활동</span>
        </button>
      </div>

      <section className="relative z-10 flex flex-col gap-4 rounded-b-[20px] border border-outline-variant bg-surface-container p-6">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-px h-[2px] bg-surface-container ${
            mode === "food"
              ? "left-0 w-[calc(50%-4px)]"
              : "right-0 w-[calc(50%-4px)]"
          }`}
        />
        <label
          className="font-label text-[0.875rem] tracking-widest uppercase text-on-surface-variant font-medium"
          htmlFor="food-input"
        >
          {mode === "food"
            ? "오늘 먹은 것을 입력하세요"
            : "오늘 한 활동을 입력하세요"}
        </label>

        {mode === "food" && (
          <ButtonGroup
            options={MEAL_OPTIONS}
            value={mealType}
            onChange={(v) => setMealType((prev) => (prev === v ? null : v))}
            size="pill"
            bordered
          />
        )}

        <textarea
          id="food-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          className="w-full bg-surface-container-highest focus:bg-surface-container-highest rounded-md p-4 font-body text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none transition-colors resize-none"
          placeholder={
            mode === "food"
              ? "바나나 2개, 제육덮밥, 콜라 1캔…"
              : "걷기 40분, 달리기 15분, 푸쉬업 20회…"
          }
          rows={3}
          disabled={loading}
        />
        {error && <p className="font-label text-xs text-tertiary">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={!inputText.trim() || loading}
          className="bg-primary text-on-primary font-headline font-bold text-sm tracking-wide rounded-md py-4 px-6 bg-gradient-to-b from-primary to-primary-container hover:opacity-90 transition-all active:scale-[0.98] shadow-[0_12px_32px_rgba(25,28,29,0.04)] flex justify-between items-center w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <span>
            {loading
              ? "분석 중…"
              : mode === "food"
                ? "기록하기"
                : "활동 기록하기"}
          </span>
          {!loading && (
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          )}
          {loading && (
            <span className="w-[18px] h-[18px] border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
          )}
        </button>
      </section>
    </section>
  );
}
