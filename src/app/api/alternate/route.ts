import { NextResponse } from "next/server";
import { devLog } from "@/lib/devLog";
import { fetchMockAlternateAnswer } from "@/lib/mockData";
import type { AlternateErrorBody, AlternateRequestBody, AlternateResponseBody } from "@/types/api";

const DEFAULT_NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";
const ALTERNATE_MAX_TOKENS = 512;
const NVIDIA_TIMEOUT_MS = 25_000;

function isLiveAnswerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_ANSWER === "true";
}

function isNvidiaConfigured(): boolean {
  return Boolean(process.env.NVIDIA_API_KEY?.trim());
}

function shouldAttemptLiveCall(): boolean {
  return isNvidiaConfigured();
}

function getAnswerModel(): string {
  return process.env.NVIDIA_MODEL?.trim() || DEFAULT_NVIDIA_MODEL;
}

async function generateAlternateAnswerWithNvidia(
  userPrompt: string,
  originalAnswer: string,
  strategy: string
): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY!.trim();
  const baseUrl = (
    process.env.NVIDIA_API_BASE?.trim() || DEFAULT_NVIDIA_BASE
  ).replace(/\/$/, "");
  const model = getAnswerModel();

  devLog(`NVIDIA alternate request model=${model} strategy=${strategy}`);

  const systemPrompt = `You are a specialist assistant.
Your task is to generate a fresh alternate answer to a user's prompt, using a different strategy: "${strategy}".

Guidelines for the alternate answer based on the strategy:
- If strategy is "more cautious": Speak with high uncertainty calibration, highlight caveats, downside risks, and what to verify before use.
- If strategy is "more structured": Use highly organized markdown tables, nested lists, bullet points, and clean separation of concepts.
- If strategy is "more concise": Keep it extremely short, brief, and to-the-point, eliminating any fluff.
- If strategy is "different approach" or other: Pivot to a completely different conceptual framework, paradigm, or angle compared to the original answer.

Original Answer to pivot from:
${originalAnswer}

Generate the fresh alternate answer directly. Do not include conversational introduction or transition text (e.g. "Here is an alternate approach using a more cautious strategy").`;

  const userMessage = `User Question:
${userPrompt}`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: ALTERNATE_MAX_TOKENS,
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

export async function POST(request: Request) {
  let promptForFallback = "";

  try {
    const body = (await request.json()) as AlternateRequestBody;

    if (
      !body.userPrompt ||
      typeof body.userPrompt !== "string" ||
      !body.originalAnswer ||
      typeof body.originalAnswer !== "string" ||
      !body.strategy ||
      typeof body.strategy !== "string"
    ) {
      return NextResponse.json<AlternateErrorBody>(
        { error: "Invalid request body parameters" },
        { status: 400 }
      );
    }

    const userPrompt = body.userPrompt.trim();
    const originalAnswer = body.originalAnswer.trim();
    const strategy = body.strategy.trim();
    promptForFallback = userPrompt;

    if (!userPrompt || !originalAnswer || !strategy) {
      return NextResponse.json<AlternateErrorBody>(
        { error: "userPrompt, originalAnswer, and strategy cannot be empty" },
        { status: 400 }
      );
    }

    if (shouldAttemptLiveCall()) {
      try {
        const answer = await generateAlternateAnswerWithNvidia(
          userPrompt,
          originalAnswer,
          strategy
        );
        devLog("alternate source: live");
        return NextResponse.json<AlternateResponseBody>({ answer, source: "live" });
      } catch (error) {
        console.error("[api/alternate] NVIDIA call failed, using mock:", error);
        devLog("alternate source: mock (NVIDIA error fallback)");
      }
    } else {
      devLog(
        `alternate source: mock (${!isLiveAnswerEnabled() ? "live flag off" : "missing NVIDIA_API_KEY"})`
      );
    }

    const answer = await fetchMockAlternateAnswer(userPrompt);
    return NextResponse.json<AlternateResponseBody>({ answer, source: "mock" });
  } catch (error) {
    console.error("[api/alternate] Unexpected error:", error);
    devLog("alternate source: mock (unexpected error fallback)");

    const answer = await fetchMockAlternateAnswer(promptForFallback);
    return NextResponse.json<AlternateResponseBody>({
      answer,
      source: "mock",
    });
  }
}
