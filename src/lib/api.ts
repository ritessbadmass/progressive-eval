import { fetchMockAnswer } from "@/lib/mockApi";
import { clientDevLog } from "@/lib/clientDevLog";
import type { ChatRequestBody, ChatResponseBody } from "@/types/api";
import type { AnswerSource } from "@/types/evaluator";

export type { AnswerSource };

export function isLiveAnswerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_ANSWER === "true";
}

export interface GenerateAnswerResult {
  answer: string;
  source: AnswerSource;
}

async function requestAnswerFromApi(
  prompt: string
): Promise<GenerateAnswerResult> {
  const body: ChatRequestBody = { prompt };

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`Chat API error (${res.status}): ${message}`);
  }

  const data = (await res.json()) as ChatResponseBody;

  if (!data.answer || typeof data.answer !== "string") {
    throw new Error("Chat API returned an invalid response shape");
  }

  return {
    answer: data.answer,
    source: data.source === "live" ? "live" : "mock",
  };
}

export async function generateAnswer(
  prompt: string
): Promise<GenerateAnswerResult> {
  try {
    const result = await requestAnswerFromApi(prompt);
    clientDevLog(`client answer source: ${result.source}`);
    return result;
  } catch (error) {
    console.error(
      "[generateAnswer] Live call failed, using mock fallback:",
      error
    );
    const answer = await fetchMockAnswer(prompt);
    clientDevLog("client answer source: mock (API error fallback)");
    return { answer, source: "mock" };
  }
}