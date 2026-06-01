import { fetchMockRevisedAnswer, fetchMockAlternateAnswer } from "@/lib/mockData";
import { clientDevLog } from "@/lib/clientDevLog";
import type { EvaluatorResult } from "@/types/evaluator";
import type { ReviseRequestBody, ReviseResponseBody, AlternateRequestBody, AlternateResponseBody } from "@/types/api";

export function isLiveAnswerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_ANSWER === "true";
}

export async function reviseAnswer(
  userPrompt: string,
  originalAnswer: string,
  evaluatorResults: EvaluatorResult[]
): Promise<string> {
  if (!isLiveAnswerEnabled()) {
    clientDevLog("client revise source: mock (live flag off)");
    return fetchMockRevisedAnswer(userPrompt, evaluatorResults);
  }

  try {
    const body: ReviseRequestBody = {
      userPrompt,
      originalAnswer,
      evaluatorResults,
    };

    const res = await fetch("/api/revise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`Revise API error (${res.status}): ${msg}`);
    }

    const data = (await res.json()) as ReviseResponseBody;
    clientDevLog(`client revise source: ${data.source}`);
    return data.answer;
  } catch (error) {
    console.error("[reviseAnswer] Live call failed, using mock fallback:", error);
    clientDevLog("client revise source: mock (API error fallback)");
    return fetchMockRevisedAnswer(userPrompt, evaluatorResults);
  }
}

export async function generateAlternateAnswer(
  userPrompt: string,
  originalAnswer: string,
  strategy: string
): Promise<string> {
  if (!isLiveAnswerEnabled()) {
    clientDevLog("client alternate source: mock (live flag off)");
    return fetchMockAlternateAnswer(userPrompt);
  }

  try {
    const body: AlternateRequestBody = {
      userPrompt,
      originalAnswer,
      strategy,
    };

    const res = await fetch("/api/alternate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`Alternate API error (${res.status}): ${msg}`);
    }

    const data = (await res.json()) as AlternateResponseBody;
    clientDevLog(`client alternate source: ${data.source}`);
    return data.answer;
  } catch (error) {
    console.error("[generateAlternateAnswer] Live call failed, using mock fallback:", error);
    clientDevLog("client alternate source: mock (API error fallback)");
    return fetchMockAlternateAnswer(userPrompt);
  }
}
