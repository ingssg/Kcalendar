# Kcalendar MVP — Context & Key Decisions

> Last Updated: 2026-04-18

---

## Key Source Files

| 파일 | 역할 |
|---|---|
| `/Users/inseokkim/claude/kcalendar/PLAN.md` | 기획 + 디자인 시스템 전체 확정 문서 (기준점) |
| `stitch_kcalendar_ai_food_logger/linear_metric/DESIGN.md` | 디자인 원칙 상세 (컴포넌트, 타이포, 색상 규칙) |
| `stitch_kcalendar_ai_food_logger/onboarding/code.html` | 온보딩 화면 확정 HTML |
| `stitch_kcalendar_ai_food_logger/today_s_record/code.html` | 탭1 오늘 화면 확정 HTML |
| `stitch_kcalendar_ai_food_logger/weekly_record/code.html` | 탭2 주간 화면 확정 HTML |
| `stitch_kcalendar_ai_food_logger/date_detail_read_only/code.html` | 날짜 상세 화면 확정 HTML |
| `wireframe.html` | 와이어프레임 참고용 |

---

## Confirmed Design Tokens (Tailwind config 등록 대상)

```js
// tailwind.config.ts colors 섹션
{
  surface: '#f8f9fa',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f3f4f5',
  'surface-container-high': '#e7e8e9',
  'on-surface': '#191c1d',
  'on-surface-variant': '#474747',
  primary: '#000000',
  'primary-container': '#3c3b3b',
  secondary: '#1b6d24',    // 기준 이하 (칼로리 부족)
  tertiary: '#7d000c',     // 기준 초과 (칼로리 과잉)
}
```

### 폰트
- Manrope: 숫자/헤드라인 (Google Fonts)
- Inter: 본문/레이블 (Google Fonts or next/font)

### 섀도우
```css
box-shadow: 0 12px 32px rgba(25,28,29,0.04);
```

### 애니메이션
```css
transition: all 200ms linear;
/* bounce 금지, ease-in-out 금지 */
```

---

## Critical Design Rules (구현 시 체크)

- **No-Line Rule**: `border` 클래스 사용 금지. 배경색 변화로만 구분
- **No-Divider Rule**: `divide-*` 클래스 사용 금지. 여백으로만 리스트 구분
- 카드 배경: 기준 이하 → `rgba(27,109,36,0.05)`, 기준 초과 → `rgba(125,0,12,0.05)`
- 상태 색상은 수치 텍스트에만 적용 — 배경/아이콘 과용 금지
- 스피너(숫자 상승/하락 버튼) 없음 — 숫자 직접 입력

---

## Key Technical Decisions

### 왜 Next.js인가 (App Router)
OpenAI API 키를 클라이언트에 노출하면 안 되므로 서버 사이드 Route Handler 필요.
Vercel AI SDK가 Next.js App Router와 최적화되어 있음.

### 왜 Vercel AI SDK인가 (직접 OpenAI SDK 대신)
- `generateObject()`로 Zod 스키마 기반 Structured Output 제공
- 추후 Claude/Gemini 로 프로바이더 교체 시 코드 변경 최소화
- Vercel 환경 최적화 (스트리밍 등)

### 왜 Upstash Redis인가
- Vercel 서버리스 환경에서 메모리 공유 불가 → 외부 상태 저장소 필요
- Upstash는 serverless-first, Vercel 마켓플레이스 통합 지원
- 무료 티어로 MVP 충분히 커버

### 칼로리 계산: Mifflin-St Jeor 수식
나이 미입력 → 25세 고정, 활동 계수 1.2 (좌식)
```
남성: (10 × kg) + (6.25 × cm) − (5 × 25) + 5
여성: (10 × kg) + (6.25 × cm) − (5 × 25) − 161
```

### localStorage 스키마 버전 관리
`AppStorage.version = 1` 필드 포함. 스키마 변경 시 마이그레이션 함수를 `lib/storage.ts`에 추가.
앱 초기화 시 버전 체크 → 구버전이면 마이그레이션 실행.

### 날짜 경계
"자정 경계: 일어난 날 기준" → 자정 이후에도 취침 전이면 당일로 처리.
MVP에서는 단순히 `new Date()` 기준 날짜 사용 (사용자 설정 불가).

---

## External Dependencies (설치 필요)

```json
// apps/web dependencies
{
  "ai": "^4.x",
  "@ai-sdk/openai": "^1.x",
  "@upstash/ratelimit": "^2.x",
  "@upstash/redis": "^1.x",
  "zod": "^3.x"
}

// apps/web devDependencies
{
  "typescript": "^5.x",
  "tailwindcss": "^4.x",
  "@types/node": "^22.x",
  "@types/react": "^19.x",
  "eslint": "^9.x",
  "eslint-config-next": "^15.x"
}

// root devDependencies
{
  "turbo": "^2.x",
  "husky": "^9.x",
  "lint-staged": "^15.x",
  "@commitlint/cli": "^19.x",
  "@commitlint/config-conventional": "^19.x"
}
```

---

## Environment Variables

```bash
# apps/web/.env.local (git 제외)
OPENAI_API_KEY=sk-...

# Upstash (Vercel 대시보드 또는 .env.local)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## API Rate Limit 설계

```typescript
// apps/web/app/api/parse-food/route.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),  // IP당 10회/분
  analytics: true,
})

// identifier: IP 주소 (Vercel: request.headers.get('x-forwarded-for'))
```

---

## MVP 범위 재확인 (제외 목록)

구현하지 않을 것들:
- 로그인 / 인증
- 서버 DB (백엔드 없음)
- 활동 칼로리
- 음식 DB / 검색
- 영양소 분석
- AI 코멘트
- 월간 캘린더
- 체중 그래프
- 식사 구분 (아침/점심/저녁)

---

## References

- Vercel AI SDK 문서: https://sdk.vercel.ai/docs
- Upstash Ratelimit: https://github.com/upstash/ratelimit-js
- Turborepo 시작 가이드: https://turbo.build/repo/docs
- Mifflin-St Jeor 수식: PLAN.md 참조
- 디자인 스크린: `stitch_kcalendar_ai_food_logger/*/screen.png`
