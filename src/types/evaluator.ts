export type EvaluatorType = "reasoning" | "research" | "writing" | "risk" | "code" | "career";

export type Severity = "low" | "moderate" | "high";

export interface EvaluatorConfig {
  id: EvaluatorType;
  name: string;
  /** One-line description shown in the picker */
  tagline: string;
  /** What dimension this lens focuses on */
  dimension: string;
  /** Specific model to use (for specialized routing) */
  model?: string;
}

export interface EvaluatorResult {
  evaluatorId: EvaluatorType;
  name: string;
  summary: string;
  checkedFor: string[];
  strengths: string[];
  weaknesses: string[];
  verifyBeforeUse: string[];
  severity: Severity;
}

export type AnswerVariant = "initial" | "revised" | "alternate";

export type AnswerSource = "mock" | "live";

export interface AnswerState {
  prompt: string;
  content: string;
  variant: AnswerVariant;
  /** Short label for revised / alternate answers */
  label?: string;
  isLoading: boolean;
  /** First-answer provenance when live mode is enabled */
  source?: AnswerSource;
  comparison?: string;
  isFinalized?: boolean;
}

export type EvaluationPhase =
  | "idle"
  | "picker"
  | "running"
  | "results"
  | "complete";

export type UserDecision = "keep" | "revise" | "alternate";

export type EvaluationSource = "mock" | "live" | "mixed";

export type EvaluationPlaybook = "balanced" | "rigor" | "style";

export interface EvaluationState {
  phase: EvaluationPhase;
  selectedEvaluators: EvaluatorType[];
  results: EvaluatorResult[];
  decision?: UserDecision;
  /** Set when live evaluator mode is enabled */
  source?: EvaluationSource;
  playbook?: EvaluationPlaybook;
}
