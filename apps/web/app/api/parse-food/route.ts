import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { NextRequest } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const schema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      unit_name: z.string(),
      unit_calories: z.number().nullable(),
      quantity: z.number(),
      confidence: z.enum(["high", "medium", "low"]),
    }),
  ),
});

const SYSTEM_PROMPT = `당신은 한국 음식 칼로리 추정 전문가입니다. 사용자가 자연어로 입력한 음식을 파싱하여 각 항목의 칼로리를 추정합니다.

규칙:
- 입력에서 음식 항목을 모두 추출하세요 (수량/크기 포함)
- 오타, 구어체, 비표준 표기를 유연하게 해석하세요 (예: "라뽁이" → 라볶이, "삼격살" → 삼겹살, "후라이드" → 프라이드치킨)
- 각 항목을 다음 순서로 처리하세요:
  1. unit_name: 수량을 제거하고 기본 단위 1개 형태로 작성 (예: "참치꼬마김밥 1줄", "바나나 1개")
  2. quantity: 원래 입력의 수량 (수량 없으면 1)
  3. unit_calories: unit_name만 보고 칼로리 추정 — 원래 입력의 수량은 완전히 무시
  4. name: 표시용 이름 (수량 포함, 예: "참치꼬마김밥 3줄", "바나나 2개")
- 예시:
  "참치꼬마김밥 3줄" → unit_name: "참치꼬마김밥 1줄", quantity: 3, unit_calories: 150, name: "참치꼬마김밥 3줄"
  "바나나 2개"       → unit_name: "바나나 1개",        quantity: 2, unit_calories: 90,  name: "바나나 2개"
  "제육덮밥"         → unit_name: "제육덮밥 1인분",     quantity: 1, unit_calories: 650, name: "제육덮밥 1인분"
- 수량이 명시되지 않은 경우 quantity: 1로 반환하세요
- g(그램) 단위 입력의 경우 unit_name은 "음식명 1g" 형태로, quantity는 그램수로 반환하세요
  예: "닭가슴살 200g" → unit_name: "닭가슴살 1g", quantity: 200, unit_calories: 1.65, name: "닭가슴살 200g"
  예: "쌀밥 150g"     → unit_name: "쌀밥 1g",    quantity: 150, unit_calories: 1.4,  name: "쌀밥 150g"
- 수량이 명시되지 않은 경우 음식 종류에 따라 기본 단위로 가정하세요
  - 커피류(아메리카노, 라떼, 믹스커피 등) → 1잔
  - 주스/과일음료 → 1컵
  - 탄산음료/캔 음료 → 1캔
  - 우유 → 1팩(200ml)
  - 소주 → 1병, 맥주 → 1캔, 막걸리 → 1병
  - 치킨/통닭 → 1마리
  - 음식류(삼겹살, 족발, 보쌈, 찌개, 덮밥 등) → 1인분
  - 과자/스낵 → 1봉지
  - 빵/샌드위치/햄버거/핫도그 → 1개
  - 케이크 → 1조각, 쿠키/마카롱/아이스크림 → 1개
  - 삼각김밥/편의점 도시락 → 1개
  - 달걀/계란 → 1개
  - 바나나/사과/귤 등 낱개 과일 → 1개
  - 라면 → 1봉지, 밥 → 1공기, 김밥 → 1줄
  - 그 외 음식 → 1인분
- 한국 음식 기준으로 칼로리를 추정하세요
- 물, 무칼로리 음료(탄산수, 아메리카노 블랙 등), 차류(녹차, 홍차 등)는 calories를 0으로 반환하세요 (null이 아님)
- 칼로리를 전혀 추정할 수 없는 경우에만 null을 반환하세요
- name은 간결하게 (예: "바나나 2개", "제육덮밥 1인분")
- confidence: 칼로리 추정 신뢰도 (high=데이터 확실, medium=일반적 추정, low=불확실)
- 판단이나 평가 코멘트 없이 수치만 반환하세요
- 음식이 아닌 입력은 빈 배열 반환`;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "anonymous";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let input: string;
  try {
    const body = await req.json();
    input = body.input;
    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema,
      system: SYSTEM_PROMPT,
      prompt: input.trim(),
    });

    const items = object.items.map((item) => ({
      name: item.name,
      calories:
        item.unit_calories === null
          ? null
          : item.unit_calories * Math.max(1, item.quantity),
      confidence: item.confidence,
    }));

    return Response.json({ items });
  } catch {
    return Response.json({ error: "AI parsing failed" }, { status: 500 });
  }
}
