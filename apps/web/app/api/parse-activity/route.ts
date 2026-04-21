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
      unit_calories: z.number().nullable(),
      quantity: z.number(),
      confidence: z.enum(["high", "medium", "low"]),
      activityType: z
        .enum(["walk", "run", "cycling", "strength", "sports", "other"])
        .nullable(),
      durationMinutes: z.number().int().positive().nullable(),
    }),
  ),
});

const SYSTEM_PROMPT = `당신은 일상 활동과 운동의 소모 칼로리를 매우 보수적으로 추정하는 전문가입니다. 사용자가 자연어로 입력한 활동을 파싱하여 각 항목의 소모 칼로리를 추정합니다.

규칙:
- 입력에서 활동 항목을 모두 추출하세요 (시간/횟수 포함)
- 오타, 구어체, 비표준 표기를 유연하게 해석하세요 (예: "스커드" → 스쿼트, "팔굽혀펴기" → 푸쉬업, "윗몸이르키기" → 윗몸일으키기)
- activityType은 walk, run, cycling, strength, sports, other 중 하나로만 반환하세요
- unit_calories와 quantity를 반드시 분리하여 반환하세요. 총 칼로리를 unit_calories에 넣지 마세요
- 시간 기반 활동 (걷기, 달리기, 자전거, 수영 등):
  unit_calories = 분당 소모 칼로리, quantity = 총 분수 (= durationMinutes와 동일값)
  예: "걷기 40분" → unit_calories: 3.5, quantity: 40, durationMinutes: 40
- 횟수 기반 활동 (푸쉬업, 스쿼트 등):
  unit_calories = 1회 소모 칼로리, quantity = 총 횟수
  예: "푸쉬업 30회" → unit_calories: 0.4, quantity: 30, durationMinutes: null
- 세트×회 입력은 반드시 총 횟수로 변환하여 quantity에 반환하세요
  예: "스쿼트 10개 3세트" → unit_calories: 0.35, quantity: 30, durationMinutes: null
- "분", "시간"은 시간 기준으로만 해석하고 durationMinutes에 분 단위로 넣으세요
- "회"는 반복 횟수 기준으로만 해석하고 durationMinutes는 반드시 null로 반환하세요
- 시간 기준과 횟수 기준을 절대 혼동하지 마세요
- 시간이 명시되지 않았으면 durationMinutes를 임의로 추정하지 마세요
- 횟수 기반 운동도 칼로리 추정 가능 — durationMinutes가 null이어도 unit_calories는 반드시 추정하세요
- 푸쉬업, 스쿼트, 윗몸일으키기 같은 횟수 기반 운동은 특히 과대 추정하지 마세요
- 칼로리는 반드시 보수적으로(낮게) 추정하세요. 과대 추정 금지
- 불확실할 때는 낮은 값을 선택하세요
- 활동 강도는 별도 언급이 없으면 평균 성인 기준 가벼운~중간 강도로 가정하세요
- 속도, 강도, 체중 정보가 없으면 높은 값을 택하지 말고 낮은 편 값을 선택하세요
- 걷기, 자전거, 달리기 등 시간 기반 활동도 빠른 속도나 고강도를 임의로 가정하지 마세요
- 내부적으로는 먼저 현실적인 kcal 범위를 판단한 뒤, 그 범위의 하한에 가까운 보수적 단일값만 calories로 반환하세요
- 칼로리를 전혀 추정할 수 없는 경우에만 null을 반환하세요
- name은 간결하게 (예: "걷기 40분", "달리기 15분", "푸쉬업 20회")
- confidence: 칼로리 추정 신뢰도 (high=데이터 확실, medium=일반적 추정, low=불확실)
- 판단이나 평가 코멘트 없이 수치만 반환하세요
- 활동이 아닌 입력은 빈 배열 반환`;

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
      activityType: item.activityType,
      durationMinutes: item.durationMinutes,
    }));

    return Response.json({ items });
  } catch {
    return Response.json({ error: "AI parsing failed" }, { status: 500 });
  }
}
