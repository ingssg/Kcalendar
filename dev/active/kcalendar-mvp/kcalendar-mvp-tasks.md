# Kcalendar MVP — Task Checklist

> Last Updated: 2026-04-18
> Status: 🟡 In Progress — Phase 1 진행 중

---

## Phase 0: 모노레포 스캐폴딩

> Goal: `pnpm dev` 실행 시 빈 Next.js 앱이 뜬다. 모노레포 구조 완성.
> Branch: `feat/phase-0-scaffold`
> Effort: S

- [x] **P0-1** pnpm 설치 확인 + `pnpm init` 루트 초기화
- [x] **P0-2** Turborepo 설정 (`turbo.json`, build/dev/lint/typecheck 파이프라인)
- [x] **P0-3** `apps/web` Next.js 16 (App Router) + TypeScript 생성
- [x] **P0-4** `packages/types` 초기화 + `@kcalendar/types` workspace 참조
- [x] **P0-5** Husky + lint-staged 설정
- [x] **P0-6** Commitlint 설정 (`commitlint.config.js`)
- [x] **P0-7** `.gitignore` + `.env.local` 제외 설정
- [x] **P0-8** 첫 커밋 완료 (`f380ece`) ← GitHub repo 연결 대기 중

---

## Phase 1: 디자인 시스템 + 타입 정의

> Goal: Tailwind 토큰 등록 완료. 공유 타입 정의 완료.
> Branch: `feat/phase-1-design-system`
> Effort: S
> Deps: Phase 0 완료

- [x] **P1-1** Tailwind CSS v4 + `globals.css` `@theme` 블록으로 디자인 토큰 등록 (v4는 CSS-first, config 파일 불필요)
- [x] **P1-2** Google Fonts (Manrope + Inter) `next/font`로 로드, CSS 변수 연결
- [x] **P1-3** 전역 CSS — 배경 `#f8f9fa`, 텍스트 `#191c1d`, dark mode 비활성화
- [x] **P1-4** `packages/types` — 모든 타입 export, `version: 1` 포함
- [x] **P1-5** `apps/web/lib/storage.ts` — getStorage/setStorage/addFoodEntries/updateFoodEntryCalories/migrateIfNeeded
- [x] **P1-6** `apps/web/lib/calorie.ts` — `calculateBMR(gender, height, weight)`, 25세 고정, ×1.2 활동 계수
- [x] **P1-7** `apps/web/lib/date.ts` — `formatDate`, `getWeekDates`, `formatDisplayDate`, `isToday` 등
- [x] **P1-8** 커밋 완료 (`f380ece`) — 초기 커밋에 전부 포함

---

## Phase 2: 온보딩 + 탭1 화면

> Goal: 온보딩 입력 → 오늘의 기록 화면까지 동작. AI 없이 수동 입력 테스트 가능.
> Branch: `feat/phase-2-onboarding`, `feat/phase-2-today`
> Effort: M
> Deps: Phase 1 완료

### 온보딩 화면

- [x] **P2-1** `app/onboarding/page.tsx` — 성별/키/몸무게 입력, 실시간 BMR 프리뷰, profile 저장 → /today
- [x] **P2-2** `app/page.tsx` — 진입점 분기 로직 (profile 유무로 /today or /onboarding)

### 레이아웃 + 탭바

- [x] **P2-3** `app/(tabs)/layout.tsx` — 하단 탭바 공통 레이아웃, pb-[90px]
- [x] **P2-4** `components/tab-bar.tsx` — Material Symbols, active FILL 상태, safe-area inset

### 탭1: 오늘 화면

- [x] **P2-5** `components/summary-card.tsx` — 3단 카드 + 프로그레스바 + 상태 반응형 배경
- [x] **P2-6** `components/food-list.tsx` — 인라인 수정(✏️→check), 추정 불가 처리, No-Divider
- [x] **P2-7** `components/food-input.tsx` — 자연어 입력창, loading spinner, 에러 표시
- [x] **P2-8** `app/(tabs)/today/page.tsx` — 날짜 헤더, localStorage reload 패턴
- [x] **P2-9** 커밋 완료 (`92d8f6d`)

---

## Phase 3: AI 파싱 연동

> Goal: 자연어 입력 → GPT-4o-mini → 칼로리 파싱 동작. Rate Limit 적용.
> Branch: `feat/phase-3-ai-parsing`
> Effort: M
> Deps: Phase 2 완료, Upstash 계정 필요

- [ ] **P3-1** Vercel AI SDK + `@ai-sdk/openai` 설치
  - 조건: `pnpm --filter web add ai @ai-sdk/openai zod`
- [ ] **P3-2** Upstash Redis 세팅
  - 조건: Upstash 계정 생성, Redis DB 생성, 환경 변수 `.env.local` 저장
- [ ] **P3-3** `app/api/parse-food/route.ts` — Route Handler 구현
  - 조건: `POST /api/parse-food` 요청 수신
  - 조건: IP 기반 Rate Limit (10회/분) 초과 시 429 반환
  - 조건: `generateObject()` + Zod 스키마로 구조화 응답
  - 조건: 응답: `{ items: [{ name, calories, confidence }] }`
- [ ] **P3-4** System Prompt 작성
  - 조건: 한국 음식 칼로리 추정 특화
  - 조건: 1인분 기준 그램 환산 로직 포함
  - 조건: 추정 불가 시 `calories: null` 반환 명시
- [ ] **P3-5** 탭1 입력창과 API 연결
  - 조건: 기록하기 버튼 클릭 → API 호출 → 응답 항목 리스트에 추가
  - 조건: 로딩 중 스피너 또는 스켈레톤 표시
  - 조건: API 오류 시 에러 메시지 표시
- [ ] **P3-6** 파싱된 항목 localStorage 저장
  - 조건: 새 항목이 오늘 DayRecord에 추가됨
  - 조건: 총 칼로리 재계산
- [ ] **P3-7** 커밋
  - `feat(api): add parse-food route with vercel ai sdk`
  - `feat(api): add upstash rate limiting`
  - `feat(today): connect food input to ai parsing api`

---

## Phase 4: 주간 + 날짜 상세 화면

> Goal: 4개 화면 모두 완성. 전체 네비게이션 동작.
> Branch: `feat/phase-4-weekly`, `feat/phase-4-date-detail`
> Effort: M
> Deps: Phase 3 완료

### 주간 화면

- [ ] **P4-1** `components/weekly-row.tsx` — 날짜 행 컴포넌트
  - 조건: 기록 있는 날: 좌측 4px 컬러 바 + +/- kcal
  - 조건: 기록 없는 날: 컬러 바 없음, "+0" 회색
  - 조건: 오늘: "오늘" 뱃지
  - 조건: 클릭 → 날짜 상세로 이동
- [ ] **P4-2** 주간 하단 요약 카드
  - 조건: 주간 합계 kcal (기록한 날만) + 기록 일수 (x/7)
  - 조건: 비대칭 벤토 레이아웃
- [ ] **P4-3** `app/(tabs)/weekly/page.tsx` — 탭2 페이지
  - 조건: 이전/다음 주 네비게이션 버튼
  - 조건: 해당 주 7일 행 렌더링
  - 조건: localStorage에서 각 날짜 데이터 로드
- [ ] **P4-4** 커밋: `feat(weekly): implement weekly view with navigation`

### 날짜 상세 화면

- [ ] **P4-5** `app/(tabs)/weekly/[date]/page.tsx` — 날짜 상세 페이지
  - 조건: ← 뒤로가기 → 주간 복귀
  - 조건: 3단 요약 카드 (읽기 전용)
  - 조건: 음식 항목 리스트 (✏️ 없음)
  - 조건: "읽기 전용" 뱃지 없음 (수정 UI 부재로 인지)
- [ ] **P4-6** 전체 네비게이션 E2E 확인
  - 조건: 온보딩 → 탭1 → 탭2 → 날짜 상세 → 탭2 전체 흐름 오류 없음
- [ ] **P4-7** 커밋: `feat(date-detail): implement read-only date detail view`

---

## Phase 5: CI/CD + 배포

> Goal: main 머지 시 Vercel 자동 배포. PR 시 GitHub Actions 통과.
> Branch: `feat/phase-5-cicd`
> Effort: S
> Deps: Phase 4 완료, GitHub repo 연결, Vercel 계정

- [ ] **P5-1** GitHub Actions CI 워크플로우 작성
  - 파일: `.github/workflows/ci.yml`
  - 조건: push/PR 시 `pnpm lint` + `pnpm typecheck` 실행
  - 조건: Node.js 버전 고정, pnpm 캐시 설정
- [ ] **P5-2** Vercel 프로젝트 연결
  - 조건: GitHub repo 연결, `apps/web` 루트 디렉토리 설정
  - 조건: 환경 변수 Vercel 대시보드에 등록 (OPENAI_API_KEY, Upstash)
- [ ] **P5-3** main 브랜치 보호 규칙 설정
  - 조건: CI 통과 없이 merge 불가
- [ ] **P5-4** 프로덕션 배포 확인
  - 조건: Vercel URL에서 전체 흐름 동작
  - 조건: 모바일 브라우저 (iOS Safari, Android Chrome) 확인
- [ ] **P5-5** Lighthouse 점수 체크
  - 조건: Performance > 80
- [ ] **P5-6** 커밋
  - `ci: add github actions workflow for lint and typecheck`
  - `chore: connect vercel deployment`

---

## Post-MVP 체크리스트

- [ ] 실제 사용자 5명 이상 사용 후 피드백 수집
- [ ] AI 파싱 정확도 로그 분석
- [ ] v2 기능 목록 우선순위 재정의 (로그인 / 활동 기록 / 영양소 등)
- [ ] 백엔드 추가 시 `apps/api` 디렉토리 생성

---

## Progress Tracker

| Phase | Status | Branch | PR | 배포 |
|---|---|---|---|---|
| Phase 0: 스캐폴딩 | 🔴 Not Started | - | - | - |
| Phase 1: 디자인 + 타입 | 🔴 Not Started | - | - | - |
| Phase 2: 온보딩 + 탭1 | 🔴 Not Started | - | - | - |
| Phase 3: AI 파싱 | 🔴 Not Started | - | - | - |
| Phase 4: 주간 + 상세 | 🔴 Not Started | - | - | - |
| Phase 5: CI/CD + 배포 | 🔴 Not Started | - | - | - |
