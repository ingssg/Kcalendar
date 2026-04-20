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
      calories: z.number().nullable(),
      confidence: z.enum(["high", "medium", "low"]),
      activityType: z
        .enum(["walk", "run", "cycling", "strength", "sports", "other"])
        .nullable(),
      durationMinutes: z.number().int().positive().nullable(),
    }),
  ),
});

const SYSTEM_PROMPT = `당신은 일상 활동과 운동의 소모 칼로리를 추정하는 전문가입니다. 사용자가 자연어로 입력한 활동을 파싱하여 각 항목의 소모 칼로리를 추정합니다.

규칙:
- 입력에서 활동 항목을 모두 추출하세요 (시간/횟수 포함)
- activityType은 walk, run, cycling, strength, sports, other 중 하나로만 반환하세요
- 시간을 분 단위로 정규화할 수 있으면 durationMinutes에 넣고, 불가능하면 null을 반환하세요
- 칼로리는 반드시 보수적으로(낮게) 추정하세요. 과대 추정 금지
- 불확실할 때는 낮은 값을 선택하세요
- 활동 강도는 별도 언급이 없으면 일반 성인 기준 가벼운~중간 강도로 가정하세요
- 참고 기준값(체중 70kg 기준): 걷기 90kcal/30분, 조깅 200kcal/30분, 달리기 280kcal/30분, 자전거(중간) 130kcal/30분, 근력운동 100kcal/30분, 수영 180kcal/30분, 요가/스트레칭 60kcal/30분
- 칼로리를 전혀 추정할 수 없는 경우에만 null을 반환하세요
- name은 간결하게 (예: "걷기 40분", "달리기 15분")
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

    return Response.json(object);
  } catch {
    return Response.json({ error: "AI parsing failed" }, { status: 500 });
  }
}
