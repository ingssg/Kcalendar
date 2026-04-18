문서 작성은 한글로 작성할 것.
큰 수정이 필요할 시 마음대로 수정하지 말고 물어보고 진행할 것.
기획 의도와 다른 점이 있다면 반드시 다시 물어보고 진행할 것.
git에 push하기 전에 항상 build를 먼저 한 후 빌드 에러를 제거하고 push할 것.

## 서비스 한 줄 정의

> **"자연어로 기록하고 주간 흐름을 보는, 판단 없는 순수 칼로리 기록 서비스"**

---

## 핵심 원칙

- AI는 수치 계산 도구일 뿐. 판단, 평가, 코멘트 없음
- 낮은 입력 마찰이 최우선
- 정확한 의료/영양 분석이 아니라 일일 칼로리 흐름을 빠르게 파악하는 도구

---

## 핵심 문제 정의

기존 칼로리 앱(MyFitnessPal 등)은 정확성을 요구하는 구조라 입력 마찰이 크고 지속 사용이 어렵다.
→ 자연어로 대충 적어도 기록이 가능한 구조로 이 문제를 해결한다.

---

## 타겟 사용자

- 다이어트 의식은 있지만 기존 앱이 번거로워서 포기한 경험이 있는 20-40대 일반인
- 정확한 영양 분석보다 "오늘 대략 어떻게 먹었나"를 빠르게 파악하고 싶은 사람

---

## 저장 방식

- 기본: 로컬스토리지
- 기록이 쌓이면 "영구 보관하려면 로그인" 유도 (강제 아님)
- 로그인은 v2 이후

---

## MVP 제외 목록

| 항목 | 처리 |
|---|---|
| 활동 기록 (걷기/운동 소모 칼로리) | v2 이후 |
| 로그인 | v2 이후 (유도만) |
| 메모 | 제거 |
| 월간 캘린더 | 제거 (주간으로 대체) |
| 상태 이모지 (좋음/나쁨 평가) | 제거 |
| AI 코멘트/피드백 | 제거 |
| 영양소 분석 (단백질/탄수/지방) | 제거 |
| 음식 검색/데이터베이스 | 제거 |
| 체중 그래프 | 제거 |
| 건강 면책 고지 | 제거 |
| 빠른 재입력 | 제거 |
| 식사 구분 자동 분류 (아침/점심/저녁) | 미정 — AI 추정 오류 가능성으로 보류 |

---

## 확정된 디자인 시스템

> 디자인 컨셉명: **"The Objective Monolith"**
> 파일 위치: `stitch_kcalendar_ai_food_logger/`

### 컬러 토큰

| 용도 | 토큰 | 값 |
|---|---|---|
| 배경 (base) | `surface` | `#f8f9fa` |
| 카드 (primary) | `surface-container-lowest` | `#ffffff` |
| 섹션 구분 | `surface-container-low` | `#f3f4f5` |
| 호버/액티브 | `surface-container-high` | `#e7e8e9` |
| 기준 이하 (−) | `secondary` | `#1b6d24` |
| 기준 초과 (+) | `tertiary` | `#7d000c` |
| 주요 텍스트 | `on-surface` | `#191c1d` |
| 보조 텍스트 | `on-surface-variant` | `#474747` |
| 버튼/강조 | `primary` | `#000000` |

### 상태 반응형 색상 규칙

- 기준 이하 (섭취 < 기준): 요약 카드 배경 `rgba(27,109,36,0.05)`, 프로그레스 바 초록
- 기준 초과 (섭취 > 기준): 요약 카드 배경 `rgba(125,0,12,0.05)`, 프로그레스 바 빨강
- 수치 자체에만 색상 적용 — 배경/아이콘에 과한 색상 금지

### 타이포그래피

- **헤드라인/숫자**: Manrope (Bold, ExtraBold)
- **본문/레이블**: Inter (Regular, Medium)
- 숫자는 항상 크고 굵게, 레이블은 작고 letter-spacing 넓게

### 디자인 원칙 요약

- 경계선 금지 → 배경색 변화로 구분 (No-Line Rule)
- 구분선 금지 → 여백과 톤 변화로 리스트 구분 (No-Divider Rule)
- 그림자: `0 12px 32px rgba(25,28,29,0.04)` — ambient light 효과
- 애니메이션: linear 200ms, 바운스 금지

---

## 디자인 파일 구조

```
stitch_kcalendar_ai_food_logger/
├── onboarding/
│   ├── code.html       ← 확정 HTML
│   └── screen.png      ← 스크린샷
├── today_s_record/
│   ├── code.html
│   └── screen.png
├── weekly_record/
│   ├── code.html
│   └── screen.png
├── date_detail_read_only/
│   ├── code.html
│   └── screen.png
└── linear_metric/
    └── DESIGN.md       ← 디자인 시스템 전문
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
