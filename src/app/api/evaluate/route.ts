import { NextResponse } from "next/server";
import {
  buildEvaluatorUserMessage,
  getEvaluatorSystemPrompt,
} from "@/lib/evaluatorPrompts";
import { parseEvaluatorResponse } from "@/lib/evaluatorParse";
import { devLog } from "@/lib/devLog";
import { MAX_EVALUATORS } from "@/lib/evaluators";
import { getMockEvaluatorResult } from "@/lib/mockData";
import type {
  EvaluateErrorBody,
  EvaluateRequestBody,
  EvaluateResponseBody,
  EvaluationSource,
} from "@/types/api";
import type { EvaluatorResult, EvaluatorType } from "@/types/evaluator";

const DEFAULT_NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";
const EVALUATOR_MAX_TOKENS = 400;
const NVIDIA_TIMEOUT_MS = 25_000;

const VALID_TYPES: EvaluatorType[] = [
  "reasoning",
  "research",
  "writing",
  "risk",
  "code",
  "career",
];

function isLiveEvaluatorsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_EVALUATORS === "true";
}

function isNvidiaConfigured(): boolean {
  return Boolean(process.env.NVIDIA_API_KEY?.trim());
}

function shouldAttemptLiveCall(): boolean {
  return isLiveEvaluatorsEnabled() && isNvidiaConfigured();
}

function getEvaluatorModel(): string {
  return (
    process.env.NVIDIA_EVALUATOR_MODEL?.trim() ||
    process.env.NVIDIA_MODEL?.trim() ||
    DEFAULT_NVIDIA_MODEL
  );
}

/** Dev-only: comma-separated types forced to mock, e.g. "research" */
function getDevForcedMockTypes(): Set<EvaluatorType> {
  if (process.env.NODE_ENV === "production") return new Set();
  const raw = process.env.DEV_FORCE_MOCK_EVALUATORS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is EvaluatorType => VALID_TYPES.includes(s as EvaluatorType))
  );
}

function shouldForceMockForType(type: EvaluatorType): boolean {
  return getDevForcedMockTypes().has(type);
}

async function callNvidiaEvaluator(
  type: EvaluatorType,
  userPrompt: string,
  baseAnswer: string
): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY!.trim();
  const baseUrl = (
    process.env.NVIDIA_API_BASE?.trim() || DEFAULT_NVIDIA_BASE
  ).replace(/\/$/, "");
  const model = getEvaluatorModel();

  devLog(`NVIDIA evaluate type=${type} model=${model}`);

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: getEvaluatorSystemPrompt(type) },
        {
          role: "user",
          content: buildEvaluatorUserMessage(userPrompt, baseAnswer),
        },
      ],
      temperature: 0.3,
      max_tokens: EVALUATOR_MAX_TOKENS,
    }),
    signal: AbortSignal.timeout(NVIDIA_TIMEOUT_MS),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`NVIDIA API error (${res.status}): ${errText}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("NVIDIA API returned no message content");
  }

  return content;
}

async function evaluateOne(
  type: EvaluatorType,
  userPrompt: string,
  baseAnswer: string,
  useLive: boolean
): Promise<{ result: EvaluatorResult; usedLive: boolean }> {
  if (useLive && !shouldForceMockForType(type)) {
    try {
      const raw = await callNvidiaEvaluator(type, userPrompt, baseAnswer);
      const result = parseEvaluatorResponse(type, raw);
      devLog(`evaluator ${type}: live`);
      return { result, usedLive: true };
    } catch (error) {
      console.error(`[api/evaluate] ${type} live call failed, using mock:`, error);
      devLog(`evaluator ${type}: mock (error fallback)`);
    }
  } else if (useLive && shouldForceMockForType(type)) {
    devLog(`evaluator ${type}: mock (DEV_FORCE_MOCK_EVALUATORS)`);
  }

  return { result: getMockEvaluatorResult(type), usedLive: false };
}

function resolveSource(flags: boolean[]): EvaluationSource {
  const liveCount = flags.filter(Boolean).length;
  if (liveCount === 0) return "mock";
  if (liveCount === flags.length) return "live";
  return "mixed";
}

function isValidEvaluatorType(value: string): value is EvaluatorType {
  return VALID_TYPES.includes(value as EvaluatorType);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EvaluateRequestBody;

    if (
      !body.userPrompt ||
      typeof body.userPrompt !== "string" ||
      !body.baseAnswer ||
      typeof body.baseAnswer !== "string" ||
      !Array.isArray(body.evaluatorTypes)
    ) {
      return NextResponse.json<EvaluateErrorBody>(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const userPrompt = body.userPrompt.trim();
    const baseAnswer = body.baseAnswer.trim();

    if (!userPrompt || !baseAnswer) {
      return NextResponse.json<EvaluateErrorBody>(
        { error: "userPrompt and baseAnswer cannot be empty" },
        { status: 400 }
      );
    }

    if (body.evaluatorTypes.length === 0) {
      return NextResponse.json<EvaluateErrorBody>(
        { error: "At least one evaluator type is required" },
        { status: 400 }
      );
    }

    if (body.evaluatorTypes.length > MAX_EVALUATORS) {
      return NextResponse.json<EvaluateErrorBody>(
        { error: `At most ${MAX_EVALUATORS} evaluators per run` },
        { status: 400 }
      );
    }

    const types = body.evaluatorTypes.filter(isValidEvaluatorType);
    if (types.length !== body.evaluatorTypes.length) {
      return NextResponse.json<EvaluateErrorBody>(
        { error: "Unknown evaluator type in request" },
        { status: 400 }
      );
    }

    const useLive = shouldAttemptLiveCall();
    if (!useLive) {
      devLog(
        `evaluator source: mock (${!isLiveEvaluatorsEnabled() ? "live flag off" : "missing NVIDIA_API_KEY"})`
      );
    }

    const outcomes = await Promise.all(
      types.map((type) => evaluateOne(type, userPrompt, baseAnswer, useLive))
    );

    const results = outcomes.map((o) => o.result);
    const source = resolveSource(outcomes.map((o) => o.usedLive));
    devLog(`evaluator source: ${source}`);

    return NextResponse.json<EvaluateResponseBody>({ results, source });
  } catch (error) {
    console.error("[api/evaluate] Unexpected error:", error);
    devLog("evaluator source: mock (unexpected route error)");
    return NextResponse.json<EvaluateErrorBody>(
      { error: "Failed to run evaluators" },
      { status: 500 }
    );
  }
}