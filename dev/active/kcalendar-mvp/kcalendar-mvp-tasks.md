# Kcalendar MVP — Task Checklist

> Last Updated: 2026-04-18
> Status: 🟡 In Progress — Phase 3 시작 대기 중

---

## Phase 0: 모노레포 스캐폴딩 ✅

- [x] **P0-1** pnpm 설치 확인 + `pnpm init` 루트 초기화
- [x] **P0-2** Turborepo 설정 (`turbo.json`, build/dev/lint/typecheck 파이프라인)
- [x] **P0-3** `apps/web` Next.js 16 (App Router) + TypeScript 생성
- [x] **P0-4** `packages/types` 초기화 + `@kcalendar/types` workspace 참조
- [x] **P0-5** Husky + lint-staged 설정
- [x] **P0-6** Commitlint 설정 (`commitlint.config.js`)
- [x] **P0-7** `.gitignore` + `.env.local` 제외 설정
- [x] **P0-8** 첫 커밋 완료 (`f380ece`) ← GitHub repo 연결 대기 중

---

## Phase 1: 디자인 시스템 + 타입 정의 ✅

- [x] **P1-1** Tailwind CSS v4 `globals.css` `@theme` 블록으로 디자인 토큰 등록
- [x] **P1-2** Google Fonts (Manrope + Inter) `next/font`로 로드, CSS 변수 연결
- [x] **P1-3** 전역 CSS — 배경 `#f8f9fa`, 텍스트 `#191c1d`, dark mode 비활성화
- [x] **P1-4** `packages/types` — 모든 타입 export, `version: 1` 포함
- [x] **P1-5** `apps/web/lib/storage.ts` — getStorage/setStorage/addFoodEntries/updateFoodEntryCalories/migrateIfNeeded
- [x] **P1-6** `apps/web/lib/calorie.ts` — `calculateBMR(gender, height, weight)`, 25세 고정, ×1.2 활동 계수
- [x] **P1-7** `apps/web/lib/date.ts` — `formatDate`, `getWeekDates`, `formatDisplayDate`, `isToday`
- [x] **P1-8** 커밋 완료 (`f380ece`)

---

## Phase 2: 온보딩 + 탭1 화면 ✅

- [x] **P2-1** `app/onboarding/page.tsx` — 성별/키/몸무게 입력, 실시간 BMR 프리뷰, profile 저장 → /today
- [x] **P2-2** `app/page.tsx` — 진입점 분기 로직
- [x] **P2-3** `app/(tabs)/layout.tsx` — 하단 탭바 공통 레이아웃
- [x] **P2-4** `components/tab-bar.tsx` — Material Symbols, active FILL 상태, safe-area inset
- [x] **P2-5** `components/summary-card.tsx` — 3단 카드, hasRecords 미기입 처리, 상태 반응형 배경
- [x] **P2-6** `components/food-list.tsx` — 인라인 수정(✏️→check), 추정 불가 처리
- [x] **P2-7** `components/food-input.tsx` — 자연어 입력창, loading spinner, 에러 표시
- [x] **P2-8** `app/(tabs)/today/page.tsx` — 날짜 헤더, localStorage reload 패턴
- [x] **P2-9** 커밋 완료 (`92d8f6d`)

### Phase 2 이후 버그픽스 (커밋 `0f760e3`, `be748d8`)
- [x] summary-card 3열 overflow 수정 — kcal 숫자 아래로 이동, `min-w-0`, `text-2xl`
- [x] 기록 전 섭취/기준 대비 `—` 미기입 표시 (`hasRecords` prop)
- [x] 데스크탑 모바일 뷰 — `max-w-[430px]` 중앙 컨테이너, tab-bar `left-1/2 -translate-x-1/2`
- [x] 온보딩 BMR 계산식 표시 — 기초대사량 × 1.2 분해 표기

---

## Phase 3: AI 파싱 연동 ← 다음 단계

> Goal: 자연어 입력 → GPT-4o-mini → 칼로리 파싱 동작. Rate Limit 적용.
> Effort: M
> Deps: **OPENAI_API_KEY 필요**, Upstash 계정 필요

- [ ] **P3-1** Vercel AI SDK + 의존성 설치
  - `pnpm --filter web add ai @ai-sdk/openai zod`
  - `pnpm --filter web add @upstash/ratelimit @upstash/redis`
- [ ] **P3-2** `apps/web/.env.local` 환경 변수 파일 생성
  - `OPENAI_API_KEY=sk-...`
  - `UPSTASH_REDIS_REST_URL=...`
  - `UPSTASH_REDIS_REST_TOKEN=...`
- [ ] **P3-3** `app/api/parse-food/route.ts` — Route Handler 구현
  - IP 기반 Rate Limit (10회/분), 429 반환
  - `generateObject()` + Zod 스키마로 구조화 응답
  - 응답: `{ items: [{ name, calories, confidence }] }`
- [ ] **P3-4** System Prompt 작성 (한국 음식 특화, null 반환 조건)
- [ ] **P3-5** food-input.tsx는 이미 `/api/parse-food` 호출 구조 완성 → API 구현만 하면 즉시 연동됨
- [ ] **P3-6** 커밋
  - `feat(api): add parse-food route with vercel ai sdk`
  - `feat(api): add upstash rate limiting`

---

## Phase 4: 주간 + 날짜 상세 화면

> Goal: 4개 화면 모두 완성. 전체 네비게이션 동작.
> Effort: M
> Deps: Phase 3 완료

### 주간 화면

- [ ] **P4-1** `components/weekly-row.tsx` — 날짜 행 (좌측 컬러 바, +/- kcal, 오늘 뱃지)
- [ ] **P4-2** 주간 하단 요약 카드 (주간 합계 + 기록 일수 x/7)
- [ ] **P4-3** `app/(tabs)/weekly/page.tsx` — 이전/다음 주 네비게이션, 7일 행 렌더링
  - 현재 플레이스홀더 존재 (`app/(tabs)/weekly/page.tsx`) — 교체 필요
- [ ] **P4-4** 커밋: `feat(weekly): implement weekly view with navigation`

### 날짜 상세 화면

- [ ] **P4-5** `app/(tabs)/weekly/[date]/page.tsx` — ← 뒤로가기, 읽기 전용 3단 카드 + food-list readOnly
- [ ] **P4-6** E2E 네비게이션 확인
- [ ] **P4-7** 커밋: `feat(date-detail): implement read-only date detail view`

---

## Phase 5: CI/CD + 배포

> Goal: main 머지 시 Vercel 자동 배포.
> Effort: S
> Deps: Phase 4 완료, GitHub repo + Vercel 계정

- [ ] **P5-1** GitHub Actions CI (`.github/workflows/ci.yml` 이미 작성됨 — repo 연결 후 자동 동작)
- [ ] **P5-2** Vercel 프로젝트 연결 + 환경 변수 등록
  - Root Directory: `apps/web`
  - 환경 변수: `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] **P5-3** main 브랜치 보호 규칙 (CI 통과 필수)
- [ ] **P5-4** 프로덕션 배포 확인 + 모바일 브라우저 테스트
- [ ] **P5-5** Lighthouse Performance > 80 확인

---

## Post-MVP

- [ ] 실제 사용자 5명 이상 피드백 수집
- [ ] AI 파싱 정확도 로그 분석
- [ ] v2 기능 우선순위 재정의 (로그인 / 활동 기록 / 영양소)
- [ ] 백엔드 추가 시 `apps/api` 디렉토리 생성

---

## Progress Tracker

| Phase | Status | 커밋 |
|---|---|---|
| Phase 0: 스캐폴딩 | ✅ 완료 | `f380ece` |
| Phase 1: 디자인 + 타입 | ✅ 완료 | `f380ece` |
| Phase 2: 온보딩 + 탭1 | ✅ 완료 | `92d8f6d`, `0f760e3`, `be748d8` |
| Phase 3: AI 파싱 | 🔴 시작 전 — API 키 필요 | - |
| Phase 4: 주간 + 상세 | 🔴 시작 전 | - |
| Phase 5: CI/CD + 배포 | 🔴 시작 전 — GitHub repo 연결 필요 | - |
