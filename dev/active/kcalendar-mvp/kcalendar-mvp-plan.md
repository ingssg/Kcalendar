# Kcalendar MVP — Implementation Plan

> Last Updated: 2026-04-18

---

## Executive Summary

Kcalendar는 자연어 입력 기반의 칼로리 기록 웹 서비스다. 사용자가 "바나나 2개, 제육덮밥"처럼 자유롭게 입력하면 AI가 칼로리를 파싱해 일별/주별 섭취량을 보여준다. 판단 없는 순수 기록 도구를 지향하며, 첫 번째 릴리즈는 로컬스토리지 기반 4개 화면 MVP다.

---

## Current State Analysis

| 항목 | 상태 |
|---|---|
| 기획 문서 | ✅ PLAN.md 확정 |
| 디자인 시스템 | ✅ DESIGN.md + 4개 화면 HTML/PNG 완성 |
| 기술 스택 결정 | ✅ 이번 플랜에서 확정 |
| 코드베이스 | ❌ 없음 (greenfield) |
| CI/CD | ❌ 없음 |
| 배포 환경 | ❌ 없음 |

---

## Proposed Future State

```
[사용자] 자연어 입력
    ↓
[Next.js API Route] /api/parse-food
    ↓
[Vercel AI SDK + GPT-4o-mini] 구조화된 JSON 응답
    ↓
[클라이언트] localStorage에 저장 + 화면 렌더링
```

### 화면 흐름
```
앱 첫 진입
  └─ localStorage.profile 없음 → ① 온보딩
  └─ localStorage.profile 있음 → ② 탭1 (오늘)
      └─ 하단 탭 전환 → ③ 탭2 (주간)
          └─ 날짜 클릭 → ④ 날짜 상세 (읽기 전용)
```

---

## Tech Stack (확정)

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 15 (App Router) + TypeScript | API Route로 키 격리 |
| 스타일 | Tailwind CSS v4 | 디자인 토큰 config 등록 |
| AI | Vercel AI SDK + `@ai-sdk/openai` + GPT-4o-mini | 프로바이더 교체 용이 |
| Rate Limit | Upstash Redis (`@upstash/ratelimit`) | 비용 폭탄 방지 |
| 모노레포 | pnpm workspaces + Turborepo | future backend 대비 |
| 배포 | Vercel | Next.js 네이티브 |
| CI/CD | GitHub Actions (lint/typecheck) + Vercel (배포) | 역할 분리 |
| pre-commit | Husky + lint-staged | 로컬 품질 게이트 |
| 커밋 규칙 | Conventional Commits | 히스토리 추적 용이 |

---

## Repository Structure

```
kcalendar/                          ← 모노레포 루트
├── apps/
│   └── web/                        ← Next.js 15 앱
│       ├── app/
│       │   ├── layout.tsx          ← 전역 레이아웃 (폰트, 메타)
│       │   ├── page.tsx            ← 진입점 (온보딩 vs 탭1 분기)
│       │   ├── (tabs)/
│       │   │   ├── layout.tsx      ← 하단 탭바 공통 레이아웃
│       │   │   ├── today/
│       │   │   │   └── page.tsx    ← 탭1: 오늘의 기록
│       │   │   └── weekly/
│       │   │       ├── page.tsx    ← 탭2: 주간 기록
│       │   │       └── [date]/
│       │   │           └── page.tsx ← 날짜 상세 (읽기 전용)
│       │   ├── onboarding/
│       │   │   └── page.tsx        ← 온보딩
│       │   └── api/
│       │       └── parse-food/
│       │           └── route.ts    ← AI 파싱 엔드포인트
│       ├── components/
│       │   ├── ui/                 ← 재사용 기본 컴포넌트
│       │   ├── summary-card.tsx    ← 3단 요약 카드
│       │   ├── food-list.tsx       ← 음식 항목 리스트
│       │   ├── tab-bar.tsx         ← 하단 탭바
│       │   └── weekly-row.tsx      ← 주간 날짜 행
│       ├── lib/
│       │   ├── storage.ts          ← localStorage 읽기/쓰기 유틸
│       │   ├── calorie.ts          ← 기준 칼로리 계산 (Mifflin-St Jeor)
│       │   └── date.ts             ← 날짜 유틸 (주간 범위 등)
│       └── ...
├── packages/
│   └── types/                      ← 공유 TypeScript 타입
│       └── src/
│           └── index.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json                    ← 루트 (devDeps: husky, commitlint)
```

---

## Implementation Phases

### Phase 0: 모노레포 스캐폴딩 (기반)
목표: 빌드되는 빈 Next.js 앱이 모노레포 안에 존재한다.

### Phase 1: 디자인 시스템 + 타입 정의
목표: Tailwind에 디자인 토큰 등록, 공유 타입 패키지 완성.

### Phase 2: 핵심 화면 — 온보딩 + 탭1
목표: 프로필 입력 → 오늘 기록 흐름이 로컬에서 동작한다.

### Phase 3: AI 파싱 연동
목표: 자연어 입력 → GPT-4o-mini → 칼로리 파싱 동작, Rate Limit 적용.

### Phase 4: 주간 + 날짜 상세 화면
목표: 4개 화면 완성, 탭 네비게이션 동작.

### Phase 5: CI/CD + 배포
목표: main 머지 시 Vercel 자동 배포, PR 시 GitHub Actions 통과.

---

## localStorage Data Schema (v1)

```typescript
// packages/types/src/index.ts

export interface UserProfile {
  version: 1;
  gender: 'male' | 'female';
  height: number;   // cm
  weight: number;   // kg
  bmr: number;      // 계산된 기준 칼로리 (kcal)
}

export interface FoodEntry {
  id: string;         // crypto.randomUUID()
  name: string;
  calories: number | null;  // null = 추정 불가
  isEstimated: boolean;     // AI 추정 여부
}

export interface DayRecord {
  date: string;       // 'YYYY-MM-DD'
  entries: FoodEntry[];
  totalCalories: number;   // null 제외 합산
  createdAt: string;  // ISO 8601
  updatedAt: string;
}

export interface AppStorage {
  version: 1;
  profile: UserProfile | null;
  records: Record<string, DayRecord>;  // key: 'YYYY-MM-DD'
}
```

---

## AI 파싱 API 설계

### Request
```
POST /api/parse-food
Content-Type: application/json
{ "input": "바나나 2개, 제육덮밥, 콜라 1캔" }
```

### Response (Vercel AI SDK generateObject)
```typescript
const schema = z.object({
  items: z.array(z.object({
    name: z.string(),
    calories: z.number().nullable(),  // null = 추정 불가
    confidence: z.enum(['high', 'medium', 'low']),
  }))
});
```

### System Prompt 방향
- 한국 음식 칼로리 추정에 특화
- 정확도보다 응답 속도 우선
- 불확실하면 null 반환 (hallucination 방지)
- 그램 단위 환산은 일반적인 1인분 기준

---

## Calorie Calculation: Mifflin-St Jeor

```
남성: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × 25) + 5
여성: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × 25) − 161
```

나이 미입력(MVP 제외)이므로 25세 고정. 하루 기준 칼로리 = BMR × 1.2 (좌식 활동 계수).

---

## Risk Assessment

| 리스크 | 가능성 | 영향 | 대응 |
|---|---|---|---|
| OpenAI API 비용 초과 | 중 | 높음 | Upstash Rate Limit (IP당 10회/분) |
| AI 칼로리 심하게 부정확 | 중 | 중 | confidence 표시, ✏️ 수정 UI |
| localStorage 스키마 충돌 | 낮 | 중 | `version` 필드 + 마이그레이션 함수 |
| Vercel 서버리스 콜드 스타트 | 낮 | 낮 | gpt-4o-mini 자체가 빠름 |
| 나이 미입력으로 BMR 부정확 | 확정 | 낮 | 25세 고정 명시, v2에서 개선 |

---

## Success Metrics (MVP)

- [ ] 온보딩 → 오늘 기록 → 주간 확인 전체 흐름 오류 없이 동작
- [ ] AI 파싱 응답 시간 < 3초 (p90)
- [ ] 자연어 10가지 입력 테스트에서 7개 이상 칼로리 추정 성공
- [ ] Vercel 배포 URL에서 모바일 브라우저 정상 렌더링
- [ ] GitHub Actions CI 통과 (lint + typecheck)
- [ ] Lighthouse Performance 점수 > 80

---

## Commit Strategy

### 브랜치 전략
```
main              ← production (보호된 브랜치)
feat/phase-0-scaffold
feat/phase-1-design-system
feat/phase-2-onboarding
feat/phase-2-today
feat/phase-3-ai-parsing
feat/phase-4-weekly
feat/phase-4-date-detail
feat/phase-5-cicd
```

### Conventional Commits 예시
```
chore: init monorepo with pnpm + turborepo
chore: add husky and lint-staged
feat(types): define localStorage schema v1
feat(web): add tailwind design tokens
feat(onboarding): implement profile input form
feat(today): implement summary card component
feat(api): add parse-food route with vercel ai sdk
feat(api): add upstash rate limiting
feat(weekly): implement weekly view with navigation
feat(date-detail): implement read-only date view
ci: add github actions workflow
```

---

## Dependencies & Order

```
Phase 0 (scaffold)
  └─ Phase 1 (design system + types)
      ├─ Phase 2 (onboarding + today screen)
      │    └─ Phase 3 (AI parsing)
      │         └─ Phase 4 (weekly + date detail)
      │              └─ Phase 5 (CI/CD + deploy)
      └─ Phase 5 (can start CI/CD config in parallel with Phase 2+)
```

---

## Timeline Estimate

| Phase | 범위 | 예상 노력 |
|---|---|---|
| Phase 0 | 모노레포 초기화 | S (1-2시간) |
| Phase 1 | 디자인 토큰 + 타입 | S (1-2시간) |
| Phase 2 | 온보딩 + 탭1 화면 | M (4-6시간) |
| Phase 3 | AI 파싱 + Rate Limit | M (3-4시간) |
| Phase 4 | 주간 + 날짜 상세 | M (4-5시간) |
| Phase 5 | CI/CD + 배포 | S (2-3시간) |

총 예상: **약 15-22시간** (풀타임 기준 2-3일)
