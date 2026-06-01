import type { EvaluatorConfig } from "@/types/evaluator";

export const EVALUATORS: EvaluatorConfig[] = [
  {
    id: "reasoning",
    name: "Reasoning Evaluator",
    tagline: "Logic, assumptions, and internal consistency",
    dimension: "Argument structure & inference quality",
  },
  {
    id: "research",
    name: "Research Evaluator",
    tagline: "Evidence, sources, and factual grounding",
    dimension: "Claims, citations, and recency",
  },
  {
    id: "writing",
    name: "Writing Evaluator",
    tagline: "Clarity, structure, and audience fit",
    dimension: "Tone, organization, and readability",
  },
  {
    id: "risk",
    name: "Risk Evaluator",
    tagline: "Harm, compliance, and decision sensitivity",
    dimension: "Downside exposure & verification needs",
  },
  {
    id: "code",
    name: "Code Evaluator",
    tagline: "Correctness, edge cases, testability, and errors",
    dimension: "Production readiness & syntax validity",
  },
  {
    id: "career",
    name: "Career Evaluator",
    tagline: "Impact framing, specificity, and tone signals",
    dimension: "ATS fit, recruiter relevance, & role alignment",
  },
];

export const MAX_EVALUATORS = 6;

export function getEvaluatorConfig(id: string): EvaluatorConfig | undefined {
  return EVALUATORS.find((e) => e.id === id);
}
