import { NextResponse } from "next/server";
import { devLog } from "@/lib/devLog";
import { fetchMockRevisedAnswer } from "@/lib/mockData";
import type { ReviseErrorBody, ReviseRequestBody, ReviseResponseBody } from "@/types/api";

const DEFAULT_NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";
const REVISE_MAX_TOKENS = 512;
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

async function generateRevisedAnswerWithNvidia(
  userPrompt: string,
  originalAnswer: string,
  evaluatorResults: any[]
): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY!.trim();
  const baseUrl = (
    process.env.NVIDIA_API_BASE?.trim() || DEFAULT_NVIDIA_BASE
  ).replace(/\/$/, "");
  const model = getAnswerModel();

  devLog(`NVIDIA revise request model=${model}`);

  const systemPrompt = `You are a specialist revision assistant.
Your task is to revise the original answer to a user's prompt based on structured feedback from specialized evaluators.

Guidelines for the revision:
1. Keep the strong, solid aspects identified by the evaluators.
2. Fix any flagged weaknesses or logical gaps.
3. Address missing context or unsupported claims.
4. Reduce overconfidence: speak with appropriate caution and calibrate certainty.
5. Explicitly note unresolved uncertainty and state what the user still needs to verify manually.

Provide the revised answer directly. Do not include introductory conversational filler (e.g. "Sure, here is the revised answer").`;

  const userMessage = `User Question:
${userPrompt}

Original Answer:
${originalAnswer}

Evaluator Feedback:
${JSON.stringify(evaluatorResults, null, 2)}`;

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
      temperature: 0.5,
      max_tokens: REVISE_MAX_TOKENS,
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
  let resultsForFallback: any[] = [];

  try {
    const body = (await request.json()) as ReviseRequestBody;

    if (
      !body.userPrompt ||
      typeof body.userPrompt !== "string" ||
      !body.originalAnswer ||
      typeof body.originalAnswer !== "string" ||
      !Array.isArray(body.evaluatorResults)
    ) {
      return NextResponse.json<ReviseErrorBody>(
        { error: "Invalid request body parameters" },
        { status: 400 }
      );
    }

    const userPrompt = body.userPrompt.trim();
    const originalAnswer = body.originalAnswer.trim();
    promptForFallback = userPrompt;
    resultsForFallback = body.evaluatorResults;

    if (!userPrompt || !originalAnswer) {
      return NextResponse.json<ReviseErrorBody>(
        { error: "userPrompt and originalAnswer cannot be empty" },
        { status: 400 }
      );
    }

    if (shouldAttemptLiveCall()) {
      try {
        const answer = await generateRevisedAnswerWithNvidia(
          userPrompt,
          originalAnswer,
          body.evaluatorResults
        );
        devLog("revise source: live");
        return NextResponse.json<ReviseResponseBody>({ answer, source: "live" });
      } catch (error) {
        console.error("[api/revise] NVIDIA call failed, using mock:", error);
        devLog("revise source: mock (NVIDIA error fallback)");
      }
    } else {
      devLog(
        `revise source: mock (${!isLiveAnswerEnabled() ? "live flag off" : "missing NVIDIA_API_KEY"})`
      );
    }

    const answer = await fetchMockRevisedAnswer(userPrompt, body.evaluatorResults);
    return NextResponse.json<ReviseResponseBody>({ answer, source: "mock" });
  } catch (error) {
    console.error("[api/revise] Unexpected error:", error);
    devLog("revise source: mock (unexpected error fallback)");

    const answer = await fetchMockRevisedAnswer(promptForFallback, resultsForFallback);
    return NextResponse.json<ReviseResponseBody>({
      answer,
      source: "mock",
    });
  }
}
