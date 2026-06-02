import { fetchMockEvaluationResults } from "@/lib/mockData";
import { clientDevLog } from "@/lib/clientDevLog";
import type { EvaluateRequestBody, EvaluateResponseBody } from "@/types/api";
import type { EvaluatorResult, EvaluatorType } from "@/types/evaluator";

export type EvaluationSource = EvaluateResponseBody["source"];

export function isLiveEvaluatorsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_EVALUATORS === "true";
}

export interface RunEvaluatorsParams {
  prompt: string;
  answer: string;
  evaluatorTypes: EvaluatorType[];
}

export interface RunEvaluatorsResult {
  results: EvaluatorResult[];
  source: EvaluationSource;
}

async function requestEvaluatorsFromApi(
  params: RunEvaluatorsParams
): Promise<RunEvaluatorsResult> {
  const body: EvaluateRequestBody = {
    userPrompt: params.prompt,
    baseAnswer: params.answer,
    evaluatorTypes: params.evaluatorTypes,
  };

  const res = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`Evaluate API error (${res.status}): ${message}`);
  }

  const data = (await res.json()) as EvaluateResponseBody;

  if (!Array.isArray(data.results)) {
    throw new Error("Evaluate API returned an invalid response shape");
  }

  return {
    results: data.results,
    source: data.source ?? "mock",
  };
}

export async function runEvaluators(
  params: RunEvaluatorsParams
): Promise<RunEvaluatorsResult> {
  try {
    const result = await requestEvaluatorsFromApi(params);
    clientDevLog(`client evaluator source: ${result.source}`);
    return result;
  } catch (error) {
    console.error(
      "[runEvaluators] Live evaluation failed, using mock fallback:",
      error
    );
    const results = await fetchMockEvaluationResults(params.evaluatorTypes);
    clientDevLog("client evaluator source: mock (API error fallback)");
    return { results, source: "mock" };
  }
}