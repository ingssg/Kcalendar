# Kcalendar MVP — Task Checklist

> Last Updated: 2026-04-18
> Status: 🔴 Not Started

---

## Phase 0: 모노레포 스캐폴딩

> Goal: `pnpm dev` 실행 시 빈 Next.js 앱이 뜬다. 모노레포 구조 완성.
> Branch: `feat/phase-0-scaffold`
> Effort: S

- [ ] **P0-1** pnpm 설치 확인 + `pnpm init` 루트 초기화
  - 조건: `pnpm-workspace.yaml` 생성, `apps/*` + `packages/*` 포함
- [ ] **P0-2** Turborepo 설정
  - 조건: `turbo.json` 생성, `build`, `dev`, `lint`, `typecheck` 파이프라인 정의
- [ ] **P0-3** `apps/web` Next.js 15 프로젝트 생성 (TypeScript)
  - 조건: `pnpm --filter web dev` 실행 시 localhost:3000 응답
- [ ] **P0-4** `packages/types` 패키지 초기화
  - 조건: `packages/types/src/index.ts` 존재, `apps/web`에서 import 가능
- [ ] **P0-5** Husky + lint-staged 설정
  - 조건: `git commit` 시 ESLint + TypeScript 체크 자동 실행
- [ ] **P0-6** Commitlint 설정
  - 조건: `feat: ...` 규칙 외 커밋 메시지 시 에러
- [ ] **P0-7** `.gitignore` + `.env.local` 제외 설정
  - 조건: `OPENAI_API_KEY` 포함된 파일이 git에 추적되지 않음
- [ ] **P0-8** 첫 커밋 + GitHub repo 연결
  - 커밋: `chore: init monorepo with pnpm and turborepo`

---

## Phase 1: 디자인 시스템 + 타입 정의

> Goal: Tailwind 토큰 등록 완료. 공유 타입 정의 완료.
> Branch: `feat/phase-1-design-system`
> Effort: S
> Deps: Phase 0 완료

- [ ] **P1-1** Tailwind CSS v4 설치 + `tailwind.config.ts` 생성
  - 조건: 커스텀 색상 토큰 9개 모두 Tailwind 클래스로 사용 가능
- [ ] **P1-2** Google Fonts 설정 (Manrope + Inter)
  - 조건: `next/font`로 로드, CSS 변수로 Tailwind에 연결
- [ ] **P1-3** 전역 CSS 변수 + 기본 스타일 설정
  - 조건: 기본 배경 `#f8f9fa`, 기본 텍스트 `#191c1d` 적용
- [ ] **P1-4** `packages/types` — `UserProfile`, `FoodEntry`, `DayRecord`, `AppStorage` 정의
  - 조건: 모든 타입 export, `version: 1` 필드 포함
- [ ] **P1-5** `apps/web/lib/storage.ts` — localStorage 읽기/쓰기 유틸 구현
  - 조건: `getStorage()`, `setStorage()`, `migrateIfNeeded()` 함수 존재
  - 조건: 버전 미스매치 시 마이그레이션 실행
- [ ] **P1-6** `apps/web/lib/calorie.ts` — Mifflin-St Jeor 계산 함수
  - 조건: `calculateBMR(gender, height, weight)` → 숫자 반환, 25세 고정
- [ ] **P1-7** `apps/web/lib/date.ts` — 날짜 유틸 함수
  - 조건: `getWeekDates(date)` → 해당 주 7일 배열, `formatDate(date)` → 'YYYY-MM-DD'
- [ ] **P1-8** 커밋
  - `feat(types): define localstorage schema v1`
  - `feat(web): add tailwind design tokens and fonts`
  - `feat(web): add storage, calorie, date utils`

---

## Phase 2: 온보딩 + 탭1 화면

> Goal: 온보딩 입력 → 오늘의 기록 화면까지 동작. AI 없이 수동 입력 테스트 가능.
> Branch: `feat/phase-2-onboarding`, `feat/phase-2-today`
> Effort: M
> Deps: Phase 1 완료

### 온보딩 화면

- [ ] **P2-1** `app/onboarding/page.tsx` — 온보딩 페이지 구현
  - 조건: 성별 버튼 2개 (남/여), 키/몸무게 숫자 입력 (스피너 없음)
  - 조건: 실시간 기준 칼로리 프리뷰 카드 (초록 포인트)
  - 조건: [시작하기] 클릭 시 profile 저장 → `/today` 리다이렉트
- [ ] **P2-2** `app/page.tsx` — 진입점 분기 로직
  - 조건: `profile` 있으면 `/today`, 없으면 `/onboarding` 리다이렉트

### 레이아웃 + 탭바

- [ ] **P2-3** `app/(tabs)/layout.tsx` — 탭바 공통 레이아웃
  - 조건: 하단 고정 탭바, [오늘] [주간] 탭 전환
  - 조건: 현재 탭 활성 표시
- [ ] **P2-4** `components/tab-bar.tsx` — 탭바 컴포넌트
  - 조건: No-Line Rule 준수 (border 없음)

### 탭1: 오늘 화면

- [ ] **P2-5** `components/summary-card.tsx` — 3단 요약 카드
  - 조건: 기준 / 섭취 / 기준 대비 3개 수치 + 단위(kcal)
  - 조건: 프로그레스 바 + "기준의 xx% 섭취" 텍스트
  - 조건: 기준 이하 → 초록 틴트 배경, 기준 초과 → 빨강 틴트 배경
- [ ] **P2-6** `components/food-list.tsx` — 음식 항목 리스트
  - 조건: 항목명 + 칼로리 + ✏️ 아이콘
  - 조건: ✏️ 클릭 → 인라인 칼로리 수정 가능
  - 조건: `calories: null` 항목은 "추정 불가" 회색 표시, 합산 제외, ✏️ 유지
  - 조건: No-Divider Rule 준수 (구분선 없음)
- [ ] **P2-7** 자연어 입력창 + 기록하기 버튼 UI
  - 조건: placeholder "바나나 2개, 제육덮밥, 콜라 1캔…" 표시
  - 조건: AI 미연동 상태에서 버튼 클릭 시 로딩 표시 (Phase 3에서 연동)
- [ ] **P2-8** `app/(tabs)/today/page.tsx` — 탭1 페이지 완성
  - 조건: 오늘 날짜 헤더 (예: 4월 18일 (금))
  - 조건: summary-card + food-list + 입력창 배치
  - 조건: localStorage에서 오늘 데이터 로드
- [ ] **P2-9** 커밋
  - `feat(onboarding): implement profile input with calorie preview`
  - `feat(today): implement summary card and food list components`
  - `feat(today): implement today page with local storage`

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
