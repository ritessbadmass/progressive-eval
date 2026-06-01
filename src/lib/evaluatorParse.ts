import { getEvaluatorConfig } from "@/lib/evaluators";
import type {
  EvaluatorResult,
  EvaluatorType,
  Severity,
} from "@/types/evaluator";

interface RawEvaluatorJson {
  summary?: string;
  checked_for?: unknown;
  strengths?: unknown;
  weaknesses?: unknown;
  verify_before_use?: unknown;
  severity?: string;
}

function toStringArray(value: unknown, max = 4): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function normalizeSeverity(value: string | undefined): Severity {
  const key = (value ?? "low").toLowerCase();
  if (key === "high") return "high";
  if (key === "medium" || key === "moderate") return "moderate";
  return "low";
}

export function extractJsonPayload(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(raw);
}

export function parseEvaluatorResponse(
  type: EvaluatorType,
  rawText: string
): EvaluatorResult {
  const parsed = extractJsonPayload(rawText) as RawEvaluatorJson;
  const config = getEvaluatorConfig(type);

  if (!parsed.summary || typeof parsed.summary !== "string") {
    throw new Error("Invalid evaluator JSON: missing summary");
  }

  return {
    evaluatorId: type,
    name: config?.name ?? `${type} Evaluator`,
    summary: parsed.summary.trim(),
    checkedFor: toStringArray(parsed.checked_for),
    strengths: toStringArray(parsed.strengths, 3),
    weaknesses: toStringArray(parsed.weaknesses, 3),
    verifyBeforeUse: toStringArray(parsed.verify_before_use, 3),
    severity: normalizeSeverity(parsed.severity),
  };
}
