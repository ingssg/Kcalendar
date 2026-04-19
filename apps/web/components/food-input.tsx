"use client";

import { useState } from "react";
import type { FoodEntry, MealType, ParseFoodResponse } from "@kcalendar/types";
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

export function FoodInput({ date, onEntriesAdded }: FoodInputProps) {
  const { addMutation } = useFoodMutations(date);
  const [inputText, setInputText] = useState("");
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const text = inputText.trim();
    if (!text || loading) return;

    if (!mealType) {
      setError("식사 유형을 선택해 주세요!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parse-food", {
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

      const data: ParseFoodResponse = await res.json();

      if (data.items.length === 0) {
        setError("이해하기 쉬운 음식명을 입력해주세요!");
        return;
      }

      const newEntries: FoodEntry[] = data.items.map((item) => ({
        id: crypto.randomUUID(),
        name: item.name,
        calories: item.calories,
        isEstimated: true,
        ...(mealType ? { mealType } : {}),
      }));

      await addMutation.mutateAsync(newEntries);
      onEntriesAdded();
      setInputText("");
    } catch {
      setError("기록 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 bg-surface-container p-6 rounded-xl">
      <label
        className="font-label text-[0.6875rem] tracking-widest uppercase text-on-surface-variant font-medium"
        htmlFor="food-input"
      >
        오늘 먹은 것을 입력하세요
      </label>

      <div className="flex gap-2">
        {MEAL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              setMealType(mealType === opt.value ? null : opt.value)
            }
            className={`px-4 py-1.5 rounded-full font-label text-xs font-medium tracking-wide transition-all duration-200 ${
              mealType === opt.value
                ? "bg-on-surface-variant text-surface"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <textarea
        id="food-input"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
        className="w-full bg-surface-container-highest focus:bg-surface-container-highest rounded-md p-4 font-body text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none transition-colors resize-none"
        placeholder="바나나 2개, 제육덮밥, 콜라 1캔…"
        rows={3}
        disabled={loading}
      />
      {error && <p className="font-label text-xs text-tertiary">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!inputText.trim() || loading}
        className="bg-primary text-on-primary font-headline font-bold text-sm tracking-wide rounded-md py-4 px-6 bg-gradient-to-b from-primary to-primary-container hover:opacity-90 transition-all active:scale-[0.98] shadow-[0_12px_32px_rgba(25,28,29,0.04)] flex justify-between items-center w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        <span>{loading ? "분석 중…" : "기록하기"}</span>
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
  );
}
