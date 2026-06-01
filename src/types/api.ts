export interface ChatRequestBody {
  prompt: string;
}

export type AnswerSource = "mock" | "live";

export interface ChatResponseBody {
  answer: string;
  source: AnswerSource;
}

export interface ChatErrorBody {
  error: string;
}

import type { EvaluatorResult, EvaluatorType } from "@/types/evaluator";

export type EvaluationSource = "mock" | "live" | "mixed";

export interface EvaluateRequestBody {
  userPrompt: string;
  baseAnswer: string;
  evaluatorTypes: EvaluatorType[];
}

export interface EvaluateResponseBody {
  results: EvaluatorResult[];
  source: EvaluationSource;
}

export interface EvaluateErrorBody {
  error: string;
}

export interface ReviseRequestBody {
  userPrompt: string;
  originalAnswer: string;
  evaluatorResults: EvaluatorResult[];
}

export interface ReviseResponseBody {
  answer: string;
  source: AnswerSource;
}

export interface ReviseErrorBody {
  error: string;
}

export interface AlternateRequestBody {
  userPrompt: string;
  originalAnswer: string;
  strategy: string;
}

export interface AlternateResponseBody {
  answer: string;
  source: AnswerSource;
}

export interface AlternateErrorBody {
  error: string;
}