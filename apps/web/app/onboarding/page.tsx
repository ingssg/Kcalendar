"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Gender } from "@kcalendar/types";
import { AppTopBar } from "@/components/app-top-bar";
import { calculateBMR } from "@/lib/calorie";
import { getStorage, setStorage } from "@/lib/storage";

export default function OnboardingPage() {
  const router = useRouter();
  const [gender, setGender] = useState<Gender | null>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const { bmr, rawBMR } = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!gender || !h || !w || h < 50 || h > 300 || w < 20 || w > 500) {
      return { bmr: null, rawBMR: null };
    }
    // Mifflin-St Jeor: 활동 계수 적용 전 기초대사량
    const base = 10 * w + 6.25 * h - 5 * 25;
    const raw = Math.round(gender === "male" ? base + 5 : base - 161);
    return { bmr: calculateBMR(gender, h, w), rawBMR: raw };
  }, [gender, height, weight]);

  const canSubmit =
    gender !== null && height !== "" && weight !== "" && bmr !== null;

  function handleSubmit() {
    if (!gender || !bmr) return;
    const storage = getStorage();
    storage.profile = {
      version: 1,
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmr,
    };
    setStorage(storage);
    router.push("/today");
  }

  return (
    <div className="bg-surface text-on-surface min-h-dvh flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col min-h-[680px] justify-between">
        <header className="mb-12 flex flex-col gap-6">
          <AppTopBar logoPriority logoSize="md" />
          <div>
            <h1 className="sr-only">Kcalendar</h1>
            <p className="font-body text-on-surface-variant text-sm tracking-wide">
              오늘 나는 얼마나 먹었을까?
            </p>
          </div>
        </header>

        <main className="flex-grow space-y-10">
          {/* 성별 선택 */}
          <section className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setGender("male")}
                className={`flex-1 py-4 rounded-md font-body text-sm font-medium transition-colors duration-200 ${
                  gender === "male"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                남
              </button>
              <button
                onClick={() => setGender("female")}
                className={`flex-1 py-4 rounded-md font-body text-sm font-medium transition-colors duration-200 ${
                  gender === "female"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                여
              </button>
            </div>
          </section>

          {/* 키 / 몸무게 입력 */}
          <section className="space-y-6">
            <div className="relative">
              <label
                className="absolute left-4 top-3 font-label text-xs tracking-widest text-on-surface-variant uppercase"
                htmlFor="height"
              >
                키
              </label>
              <input
                id="height"
                type="number"
                inputMode="numeric"
                className="w-full bg-surface-container-low text-on-surface font-headline text-2xl px-4 pt-8 pb-4 rounded-md focus:bg-surface-container-highest focus:outline-none transition-colors pr-12"
                placeholder="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <span className="absolute right-4 bottom-4 font-label text-sm font-medium text-on-surface-variant">
                cm
              </span>
            </div>

            <div className="relative">
              <label
                className="absolute left-4 top-3 font-label text-xs tracking-widest text-on-surface-variant uppercase"
                htmlFor="weight"
              >
                몸무게
              </label>
              <input
                id="weight"
                type="number"
                inputMode="numeric"
                className="w-full bg-surface-container-low text-on-surface font-headline text-2xl px-4 pt-8 pb-4 rounded-md focus:bg-surface-container-highest focus:outline-none transition-colors pr-12"
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className="absolute right-4 bottom-4 font-label text-sm font-medium text-on-surface-variant">
                kg
              </span>
            </div>
          </section>

          {/* 기준 칼로리 프리뷰 */}
          <section className="pt-8 pb-4">
            <div
              className="rounded-xl p-8 flex flex-col items-start justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(27,109,36,0.1) 0%, rgba(27,109,36,0.05) 100%)",
                border: "1px solid rgba(27,109,36,0.16)",
              }}
            >
              <p className="font-label text-xs tracking-widest text-on-surface-variant uppercase mb-2">
                하루 기준 칼로리
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline font-bold text-6xl tracking-tighter text-secondary transition-all duration-200">
                  {bmr ? bmr.toLocaleString() : "—"}
                </span>
                <span className="font-label text-sm text-secondary opacity-70">
                  kcal
                </span>
              </div>
            </div>

            {/* 계산식 안내 */}
            <p className="font-label text-[0.6875rem] text-on-surface-variant/60 mt-3 leading-relaxed">
              {rawBMR && bmr
                ? `기초대사량 ${rawBMR.toLocaleString()} kcal × 1.2 (좌식 활동) = ${bmr.toLocaleString()} kcal`
                : "Mifflin-St Jeor 수식 · 25세 기준 · 좌식 활동 계수 ×1.2"}
            </p>
          </section>
        </main>

        <footer className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-primary text-on-primary font-body font-medium text-lg py-4 rounded-md bg-gradient-to-b from-primary to-primary-container transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            시작하기
          </button>
        </footer>
      </div>
    </div>
  );
}
