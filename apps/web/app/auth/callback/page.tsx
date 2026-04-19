"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  applyMergeSelection,
  getMergePreview,
  type MergePreview,
} from "@/lib/migrate";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type CallbackState =
  | {
      status: "loading";
      userId: null;
      preview: null;
    }
  | {
      status: "prompt";
      userId: string;
      preview: MergePreview;
    }
  | {
      status: "applying";
      userId: string;
      preview: MergePreview;
    };

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({
    status: "loading",
    userId: null,
    preview: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function finalizeOAuth() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Failed to finalize Supabase OAuth callback", error);
        }

        if (cancelled) {
          return;
        }

        if (!data.session?.user) {
          router.replace("/");
          return;
        }

        const preview = await getMergePreview(data.session.user);

        if (cancelled) {
          return;
        }

        if (!preview) {
          router.replace("/today");
          return;
        }

        setState({
          status: "prompt",
          userId: data.session.user.id,
          preview,
        });
      } catch (error) {
        console.error("Unexpected OAuth callback error", error);

        if (!cancelled) {
          router.replace("/");
        }
      }
    }

    void finalizeOAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleMerge(options: {
    mergeProfile: boolean;
    mergeEntries: boolean;
  }) {
    if (state.status !== "prompt") {
      return;
    }

    setState({
      ...state,
      status: "applying",
    });

    await applyMergeSelection({ id: state.userId }, options);

    router.replace("/today");
  }

  function handleSkip() {
    router.replace("/today");
  }

  if (state.status === "prompt") {
    const { preview } = state;

    return (
      <div className="bg-surface text-on-surface min-h-dvh flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-surface-container p-6 shadow-[0_16px_40px_rgba(25,28,29,0.08)]">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            이 기기의 비로그인 데이터를 계정에 반영할까요?
          </h1>
          <div className="mt-4 flex flex-col gap-3 font-body text-sm text-on-surface-variant">
            {preview.pendingEntryCount > 0 ? (
              <p>
                이 기기에만 있는 기록 {preview.pendingEntryCount}개가 있습니다.
                원하면 현재 계정 기록에 합칠 수 있어요.
              </p>
            ) : null}
            {preview.hasPendingProfile ? (
              <p>
                이 기기의 프로필이 현재 계정 프로필과 다릅니다. 원하면 이 기기의
                프로필로 계정 프로필을 바꿀 수 있어요.
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {preview.pendingEntryCount > 0 && !preview.hasPendingProfile ? (
              <button
                type="button"
                onClick={() =>
                  void handleMerge({ mergeEntries: true, mergeProfile: false })
                }
                className="rounded-xl bg-primary px-4 py-3 font-body text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
              >
                기록 합치기
              </button>
            ) : null}

            {preview.hasPendingProfile && preview.pendingEntryCount === 0 ? (
              <button
                type="button"
                onClick={() =>
                  void handleMerge({ mergeEntries: false, mergeProfile: true })
                }
                className="rounded-xl bg-primary px-4 py-3 font-body text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
              >
                프로필 반영하기
              </button>
            ) : null}

            {preview.hasPendingProfile && preview.pendingEntryCount > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    void handleMerge({
                      mergeEntries: true,
                      mergeProfile: false,
                    })
                  }
                  className="rounded-xl bg-surface-container-high px-4 py-3 font-body text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-highest"
                >
                  기록만 합치기
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void handleMerge({ mergeEntries: true, mergeProfile: true })
                  }
                  className="rounded-xl bg-primary px-4 py-3 font-body text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
                >
                  기록 + 프로필 반영하기
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={handleSkip}
              className="rounded-xl bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              이번엔 건너뛰기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-dvh flex items-center justify-center p-6">
      <p className="font-body text-sm text-on-surface-variant">
        {state.status === "applying" ? "데이터 반영 중..." : "로그인 중..."}
      </p>
    </div>
  );
}
