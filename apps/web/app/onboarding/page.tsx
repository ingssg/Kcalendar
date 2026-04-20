"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Gender } from "@kcalendar/types";
import { AppTopBar } from "@/components/app-top-bar";
import { AuthMenuButton } from "@/components/auth-menu-button";
import { calculateBMR } from "@/lib/calorie";
import { useProfile } from "@/lib/hooks/use-profile";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, saveMutation } = useProfile();
  const [genderOverride, setGenderOverride] = useState<
    Gender | null | undefined
  >(undefined);
  const [heightOverride, setHeightOverride] = useState<string | undefined>(
    undefined,
  );
  const [weightOverride, setWeightOverride] = useState<string | undefined>(
    undefined,
  );
  const [ageOverride, setAgeOverride] = useState<string | undefined>(undefined);

  const gender = genderOverride ?? profile?.gender ?? null;
  const height = heightOverride ?? (profile ? String(profile.height) : "");
  const weight = weightOverride ?? (profile ? String(profile.weight) : "");
  const age = ageOverride ?? (profile?.age ? String(profile.age) : "");

  const { bmr, rawBMR } = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age, 10);
    if (
      !gender ||
      !h ||
      !w ||
      !a ||
      h < 50 ||
      h > 300 ||
      w < 20 ||
      w > 500 ||
      a < 10 ||
      a > 100
    ) {
      return { bmr: null, rawBMR: null };
    }
    // Mifflin-St Jeor: 활동 계수 적용 전 기초대사량
    const base = 10 * w + 6.25 * h - 5 * a;
    const raw = Math.round(gender === "male" ? base + 5 : base - 161);
    return { bmr: calculateBMR(gender, h, w, a), rawBMR: raw };
  }, [gender, height, weight, age]);

  const canSubmit =
    gender !== null &&
    height !== "" &&
    weight !== "" &&
    age !== "" &&
    bmr !== null;

  function handleSubmit() {
    if (!gender || !bmr) return;
    saveMutation.mutate(
      {
        version: 1,
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age, 10),
        bmr,
      },
      {
        onSuccess: () => {
          router.push("/today");
        },
      },
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-dvh flex flex-col items-center p-6 pt-8">
      <div className="w-full max-w-md flex flex-col min-h-[680px]">
        <header className="mb-4 flex flex-col gap-6">
          <AppTopBar
            logoPriority
            logoSize="md"
            rightSlot={<AuthMenuButton profileHref="/onboarding" />}
          />
          <div>
            <h1 className="sr-only">Kcalendar</h1>
          </div>
        </header>
        <p className="font-body text-on-surface-variant text-lg tracking-wide mb-4">
          프로필을 입력해주세요.
        </p>
        <main className="flex-grow space-y-10">
          {/* 성별 선택 */}
          <section className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setGenderOverride("male")}
                className={`flex-1 py-4 rounded-md font-body text-sm font-medium transition-colors duration-200 ${
                  gender === "male"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                남
              </button>
              <button
                onClick={() => setGenderOverride("female")}
                className={`flex-1 py-4 rounded-md font-body text-sm font-medium transition-colors duration-200 ${
                  gender === "female"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
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
                className="w-full bg-surface-container-high text-on-surface font-headline text-2xl px-4 pt-8 pb-4 rounded-md focus:bg-surface-container-highest focus:outline-none transition-colors pr-12"
                placeholder="170"
                value={height}
                onChange={(e) => setHeightOverride(e.target.value)}
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
                className="w-full bg-surface-container-high text-on-surface font-headline text-2xl px-4 pt-8 pb-4 rounded-md focus:bg-surface-container-highest focus:outline-none transition-colors pr-12"
                placeholder="60"
                value={weight}
                onChange={(e) => setWeightOverride(e.target.value)}
              />
              <span className="absolute right-4 bottom-4 font-label text-sm font-medium text-on-surface-variant">
                kg
              </span>
            </div>

            <div className="relative">
              <label
                className="absolute left-4 top-3 font-label text-xs tracking-widest text-on-surface-variant uppercase"
                htmlFor="age"
              >
                나이{" "}
                <span className="normal-case tracking-normal">(만나이)</span>
              </label>
              <input
                id="age"
                type="number"
                inputMode="numeric"
                className="w-full bg-surface-container-high text-on-surface font-headline text-2xl px-4 pt-8 pb-4 rounded-md focus:bg-surface-container-highest focus:outline-none transition-colors pr-12"
                placeholder="25"
                value={age}
                onChange={(e) => setAgeOverride(e.target.value)}
              />
              <span className="absolute right-4 bottom-4 font-label text-sm font-medium text-on-surface-variant">
                세
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
                : "Mifflin-St Jeor 수식 · 좌식 활동 계수 ×1.2"}
            </p>
          </section>
        </main>

        <footer className="mt-8 pb-2">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || saveMutation.isPending}
            className="w-full bg-primary text-on-primary font-body font-medium text-lg py-4 rounded-md bg-gradient-to-b from-primary to-primary-container transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {saveMutation.isPending ? "저장 중..." : "시작하기"}
          </button>
        </footer>
      </div>
    </div>
  );
}
