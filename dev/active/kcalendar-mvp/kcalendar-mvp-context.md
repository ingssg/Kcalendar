# Kcalendar MVP — Context & Key Decisions

> Last Updated: 2026-04-18

---

## 현재 구현 상태

**Phase 0~2 완료. Phase 3(AI 파싱) 시작 대기 중.**

최신 커밋: `be748d8` — `feat(onboarding): show bmr calculation breakdown`

```
git log --oneline
be748d8 feat(onboarding): show bmr calculation breakdown below calorie card
0f760e3 fix(web): layout overflow, empty state, desktop mobile view
617fce1 chore: mark phase 2 tasks complete in checklist
92d8f6d feat(web): implement onboarding and today screen (phase 2)
f12978b chore: fix task checklist — mark P1-6, P1-7, P1-8 complete
b192a9f chore: update task checklist — phase 0 and 1 complete
f380ece chore: init monorepo with pnpm, turborepo, next.js 16
```

---

## 구현된 파일 목록

```
apps/web/
├── app/
│   ├── layout.tsx              ← Manrope+Inter 폰트, Material Symbols CDN, max-w-[430px] 래퍼
│   ├── globals.css             ← Tailwind v4 @theme 디자인 토큰 전체 등록
│   ├── page.tsx                ← 진입점: profile 유무로 /onboarding or /today
│   ├── onboarding/
│   │   └── page.tsx            ← 성별/키/몸무게 입력, BMR 실시간 계산, 계산식 표시
│   └── (tabs)/
│       ├── layout.tsx          ← TabBar + pb-[90px]
│       ├── today/
│       │   └── page.tsx        ← 날짜 헤더, SummaryCard, FoodInput, FoodList
│       └── weekly/
│           └── page.tsx        ← 플레이스홀더 (Phase 4에서 교체)
├── components/
│   ├── summary-card.tsx        ← 3단 요약 카드 (기준/섭취/기준 대비 + 프로그레스바)
│   ├── food-list.tsx           ← 음식 항목 리스트, 인라인 칼로리 수정
│   ├── food-input.tsx          ← 자연어 입력창, /api/parse-food 호출 구조 완성
│   └── tab-bar.tsx             ← 하단 탭바, fixed + centered on desktop
└── lib/
    ├── storage.ts              ← localStorage CRUD, 버전 마이그레이션
    ├── calorie.ts              ← calculateBMR (Mifflin-St Jeor × 1.2, 25세 고정)
    └── date.ts                 ← formatDate, getWeekDates, formatDisplayDate, isToday

packages/types/src/index.ts     ← UserProfile, FoodEntry, DayRecord, AppStorage, ParseFoodResponse
```

---

## 이번 세션 핵심 결정사항

### 1. Tailwind v4 CSS-first 설정
`tailwind.config.ts` 파일 없음. `globals.css`의 `@theme` 블록에서 직접 CSS 변수 정의.
- `--color-*` → 색상 유틸리티
- `--font-headline/body/label` → 폰트 패밀리 유틸리티

### 2. Next.js 버전
`create next-app`이 **Next.js 16.2.4**를 설치함 (15가 아님). 동작에 영향 없음.

### 3. 데스크탑 모바일 뷰
`body`에 `bg-surface-dim` + `flex justify-center`, 내부 `div`에 `max-w-[430px] bg-surface`.
탭바는 `fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px]`로 중앙 고정.

### 4. SummaryCard hasRecords 패턴
기록 없을 때 섭취/기준 대비를 `—`으로 표시. `today/page.tsx`에서 `entries.length > 0`을 prop으로 전달.
수정 버튼으로 칼로리 변경 → `onUpdate()` → `reload()` → localStorage 재읽기 → 자동 반영.

### 5. food-input.tsx API 호출 구조
`/api/parse-food`를 fetch하는 코드가 이미 완성됨. Phase 3에서 Route Handler만 구현하면 즉시 연동됨.

### 6. BMR 계산식 표시 (온보딩)
`rawBMR` (활동 계수 적용 전)을 useMemo에서 함께 계산해 카드 아래에 표시.
- 입력 전: `Mifflin-St Jeor 수식 · 25세 기준 · 좌식 활동 계수 ×1.2`
- 입력 후: `기초대사량 1,674 kcal × 1.2 (좌식 활동) = 2,009 kcal`

---

## Phase 3 즉시 시작을 위한 체크리스트

```bash
# 1. 의존성 설치
pnpm --filter web add ai @ai-sdk/openai zod @upstash/ratelimit @upstash/redis

# 2. 환경 변수 파일 생성
# apps/web/.env.local
OPENAI_API_KEY=sk-...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# 3. 구현 파일
apps/web/app/api/parse-food/route.ts
```

**food-input.tsx는 이미 아래 구조로 API를 호출함:**
```typescript
const res = await fetch('/api/parse-food', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: text }),
})
// 응답: { items: [{ name, calories, confidence }] }
// calories: number | null (null = 추정 불가)
```

---

## Key Source Files

| 파일 | 역할 |
|---|---|
| `PLAN.md` | 기획 + 디자인 시스템 전체 확정 문서 (기준점) |
| `stitch_kcalendar_ai_food_logger/linear_metric/DESIGN.md` | 디자인 원칙 (No-Line, No-Divider 등) |
| `stitch_kcalendar_ai_food_logger/*/code.html` | 4개 화면 확정 HTML 디자인 |
| `apps/web/app/globals.css` | 디자인 토큰 (@theme 블록) |
| `packages/types/src/index.ts` | 공유 TypeScript 타입 |

---

## 디자인 토큰 (현재 globals.css 등록 완료)

| 용도 | CSS 변수 | 값 |
|---|---|---|
| 배경 | `--color-surface` | `#f8f9fa` |
| 카드 | `--color-surface-container-lowest` | `#ffffff` |
| 섹션 | `--color-surface-container-low` | `#f3f4f5` |
| 호버 | `--color-surface-container-high` | `#e7e8e9` |
| 기준 이하 | `--color-secondary` | `#1b6d24` |
| 기준 초과 | `--color-tertiary` | `#7d000c` |
| 주요 텍스트 | `--color-on-surface` | `#191c1d` |
| 보조 텍스트 | `--color-on-surface-variant` | `#474747` |
| 버튼 | `--color-primary` | `#000000` |

---

## Critical Design Rules

- **No-Line Rule**: `border` 클래스 금지 → 배경색 변화로 구분
- **No-Divider Rule**: `divide-*` 금지 → 여백으로 리스트 구분
- 상태 색상은 수치 텍스트에만 적용 (배경 틴트는 5% opacity까지만)
- 애니메이션: `linear 200ms` 고정, bounce 금지
- 그림자: `0 12px 32px rgba(25,28,29,0.04)` (ambient light)
- 숫자 스피너 없음 (globals.css에 CSS로 제거됨)

---

## API Rate Limit 설계 (Phase 3 구현 시 참고)

```typescript
// apps/web/app/api/parse-food/route.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),  // IP당 10회/분
})

const schema = z.object({
  items: z.array(z.object({
    name: z.string(),
    calories: z.number().nullable(),
    confidence: z.enum(['high', 'medium', 'low']),
  }))
})
```

---

## 환경 변수

```bash
# apps/web/.env.local (git 제외 확인됨)
OPENAI_API_KEY=sk-...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 미해결 사항

| 항목 | 내용 |
|---|---|
| GitHub repo | 아직 remote 연결 안 됨. `git remote add origin <url>` 필요 |
| Upstash 계정 | Phase 3 시작 전 가입 + Redis DB 생성 필요 |
| weekly/page.tsx | 플레이스홀더 상태 — Phase 4에서 실제 구현으로 교체 |

---

## References

- Vercel AI SDK 문서: https://sdk.vercel.ai/docs
- Upstash Ratelimit: https://github.com/upstash/ratelimit-js
- Turborepo: https://turbo.build/repo/docs
- 디자인 스크린: `stitch_kcalendar_ai_food_logger/*/screen.png`
