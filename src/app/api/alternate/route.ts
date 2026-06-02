import { NextResponse } from "next/server";
import { devLog } from "@/lib/devLog";
import { fetchMockAlternateAnswer } from "@/lib/mockData";
import type { AlternateErrorBody, AlternateRequestBody, AlternateResponseBody } from "@/types/api";

const DEFAULT_NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";
const ALTERNATE_MAX_TOKENS = 2048;
const NVIDIA_TIMEOUT_MS = 9_000; // Vercel Hobby limit is 10s

export const maxDuration = 30; // used if plan allows it

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
): Promise<{ answer: string; comparison: string }> {
  const apiKey = process.env.NVIDIA_API_KEY!.trim();
  const baseUrl = (
    process.env.NVIDIA_API_BASE?.trim() || DEFAULT_NVIDIA_BASE
  ).replace(/\/$/, "");
  const model = getAnswerModel();

  devLog(`NVIDIA alternate request model=${model} strategy=${strategy}`);

  const systemPrompt = `You are a specialist assistant.
Your task is to generate a fresh alternate answer to a user's prompt using a different strategy: "${strategy}", and write a brief description of how this strategy is conceptually different from the previous answer.

You MUST respond with a JSON object containing exactly two keys:
1. "answer": The string containing the fresh alternate answer in markdown format. Do not include conversational introduction or transition text (e.g. "Here is an alternate approach using a more cautious strategy").
2. "comparison": A string containing a concise explanation (2-3 sentences) detailing exactly how this approach conceptually or structurally differs from the original answer to highlight the key changes.

Original Answer to pivot from:
${originalAnswer}

Response format must be valid JSON:
{
  "answer": "...",
  "comparison": "..."
}`;

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

  // Strip code fences if returned by the LLM
  let jsonText = content;
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  }

  try {
    const parsed = JSON.parse(jsonText) as { answer: string; comparison: string };
    if (parsed.answer) {
      return {
        answer: parsed.answer.trim().replace(/\\n/g, "\n"),
        comparison: parsed.comparison ? parsed.comparison.trim() : "Pivoted strategy compared to the previous version.",
      };
    }
  } catch (e) {
    // JSON.parse failed — try regex extraction as fallback
    const answerMatch = jsonText.match(/"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const compMatch = jsonText.match(/"comparison"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (answerMatch?.[1]) {
      return {
        answer: answerMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim(),
        comparison: compMatch?.[1]
          ? compMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim()
          : "Pivoted strategy compared to the previous version.",
      };
    }
  }

  // Last resort: return the raw content but clean up escaped newlines
  return {
    answer: content.replace(/\\n/g, "\n"),
    comparison: "Pivoted strategy compared to the previous version.",
  };
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
        const { answer, comparison } = await generateAlternateAnswerWithNvidia(
          userPrompt,
          originalAnswer,
          strategy
        );
        devLog("alternate source: live");
        return NextResponse.json<AlternateResponseBody>({ answer, comparison, source: "live" });
      } catch (error) {
        console.error("[api/alternate] NVIDIA call failed, using mock:", error);
        devLog("alternate source: mock (NVIDIA error fallback)");
      }
    } else {
      devLog(
        `alternate source: mock (${!isLiveAnswerEnabled() ? "live flag off" : "missing NVIDIA_API_KEY"})`
      );
    }

    const { answer, comparison } = await fetchMockAlternateAnswer(userPrompt);
    return NextResponse.json<AlternateResponseBody>({ answer, comparison, source: "mock" });
  } catch (error) {
    console.error("[api/alternate] Unexpected error:", error);
    devLog("alternate source: mock (unexpected error fallback)");

    const { answer, comparison } = await fetchMockAlternateAnswer(promptForFallback);
    return NextResponse.json<AlternateResponseBody>({
      answer,
      comparison,
      source: "mock",
    });
  }
}
