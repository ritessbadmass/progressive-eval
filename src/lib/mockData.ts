import type {
  EvaluatorResult,
  EvaluatorType,
  Severity,
} from "@/types/evaluator";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchMockRevisedAnswer(
  prompt: string,
  findings: EvaluatorResult[]
): Promise<string> {
  await delay(1200);

  const themes = findings
    .flatMap((r) => r.weaknesses.slice(0, 1))
    .filter(Boolean)
    .join("; ");

  return `**Revised answer** (incorporating evaluator feedback)

**Overview**
This revision addresses concerns raised during evaluation—especially around ${themes || "clarity and verifiability"}—while preserving the core recommendation.

**Refined approach**
1. **Problem framing** — State the decision context, stakeholders, and what success looks like before recommending actions.
2. **Explicit assumptions** — List assumptions that would change the recommendation if wrong; mark which are unverified in this draft.
3. **Evidence boundaries** — Separate well-supported claims from reasonable inferences; flag where live data or domain review is required.
4. **Evaluation-on-demand** — Treat specialist evaluators as lenses for trust calibration, not automatic gates.

**What changed**
- Tightened logical flow and reduced unsupported generalizations.
- Added verification hooks aligned with Research and Risk findings.
- Improved scannability per Writing feedback.

*Mock revision for: ${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}*`;
}

export async function fetchMockAlternateAnswer(prompt: string): Promise<string> {
  await delay(1200);

  return `**Alternate approach**

Instead of a step-by-step plan, here is a **decision-first** framing for: *${prompt.slice(0, 70)}${prompt.length > 70 ? "…" : ""}*

**When to trust the fast answer**
Use the initial response as-is when stakes are low, the domain is familiar, and you can spot-check one or two critical claims quickly.

**When to evaluate**
Route through evaluators when the output informs money, safety, compliance, public communication, or irreversible commitments.

**Minimal evaluation set**
| Situation | Start with |
|-----------|------------|
| Logic-heavy | Reasoning |
| Facts & sources matter | Research |
| External audience | Writing |
| Downside matters | Risk |

**Next step**
Pick at most three lenses, read *what was checked* and *verify before use*, then choose: keep, revise with findings, or regenerate with a different angle—like this one.`;
}

const RESULT_TEMPLATES: Record<
  EvaluatorType,
  Omit<EvaluatorResult, "evaluatorId" | "name">
> = {
  reasoning: {
    summary: "The argument is coherent but leans on implicit assumptions.",
    checkedFor: [
      "Logical flow between sections",
      "Unsupported leaps from premise to conclusion",
      "Whether alternatives were fairly considered",
    ],
    strengths: [
      "Clear step-by-step structure",
      "Recommendations follow from stated goals",
    ],
    weaknesses: [
      "Several claims rely on unstated assumptions about user context",
      "Trade-offs between options are mentioned but not compared",
    ],
    verifyBeforeUse: [
      "Confirm the problem framing matches your actual constraints",
      "Challenge any step that feels obvious but lacks justification",
    ],
    severity: "moderate",
  },
  research: {
    summary: "Directionally plausible; several claims need external verification.",
    checkedFor: [
      "Specific factual claims and dates",
      "Whether sources would be expected for this topic",
      "Recency and domain-specific accuracy signals",
    ],
    strengths: [
      "High-level concepts align with common practice",
      "No obviously fabricated citations in this mock",
    ],
    weaknesses: [
      "No primary sources or links provided for checkable facts",
      "May not reflect the latest standards in your jurisdiction or industry",
    ],
    verifyBeforeUse: [
      "Cross-check any numbers, legal points, or medical claims",
      "Prefer authoritative sources for anything you will cite externally",
    ],
    severity: "moderate",
  },
  writing: {
    summary: "Readable and professional; could be tighter for executive use.",
    checkedFor: [
      "Headings, scannability, and paragraph length",
      "Jargon level vs intended audience",
      "Whether the opening states the bottom line",
    ],
    strengths: [
      "Consistent tone and clear section headers",
      "Actionable bullets are easy to skim",
    ],
    weaknesses: [
      "Opening paragraph delays the main recommendation",
      "Some phrases are generic (“practical note”) without adding substance",
    ],
    verifyBeforeUse: [
      "Adapt tone for your actual audience (internal vs external)",
      "Trim any section that does not change a decision",
    ],
    severity: "low",
  },
  risk: {
    summary: "Low direct harm in demo context; verify before high-stakes use.",
    checkedFor: [
      "Advice that could cause financial, legal, or safety harm if wrong",
      "Overconfidence or missing uncertainty language",
      "Sensitive topics requiring professional review",
    ],
    strengths: [
      "Framed as illustrative / mock where appropriate",
      "Encourages user judgment rather than blind reliance",
    ],
    weaknesses: [
      "Could be misapplied to regulated decisions without expert review",
      "Does not spell out org-specific compliance constraints",
    ],
    verifyBeforeUse: [
      "Run legal/compliance review before external or regulated use",
      "Treat as draft input, not authoritative guidance",
    ],
    severity: "low",
  },
  code: {
    summary: "The code is functional but lacks robust error handling and edge-case checks.",
    checkedFor: [
      "Syntax validity & platform keywords",
      "Error handling and exception safety",
      "Boundary conditions and edge cases",
      "Testability & modular structure",
    ],
    strengths: [
      "Logical flow matches the requirements",
      "Uses modern standard practices and APIs",
    ],
    weaknesses: [
      "No try-catch blocks or fallback logic for remote/async calls",
      "Fails to handle null, empty, or unexpected input types",
    ],
    verifyBeforeUse: [
      "Write unit tests covering zero, negative, and extreme inputs",
      "Add retry or graceful degradation rules for API endpoints",
    ],
    severity: "moderate",
  },
  career: {
    summary: "Good layout, but highlights tasks rather than accomplishments and metrics.",
    checkedFor: [
      "ATS keyword match against industry JDs",
      "Claim specificity (metrics, percentages, dollars)",
      "Vague buzzword filtering ('team player', 'motivated')",
      "Tone consistency & professional branding alignment",
    ],
    strengths: [
      "Strong action verbs are used at the start of bullets",
      "Formatting is highly readable and recruiter-friendly",
    ],
    weaknesses: [
      "Lacks concrete business impact or quantitative results",
      "ATS coverage gaps for advanced tools listed in modern JDs",
    ],
    verifyBeforeUse: [
      "Add specific dollar amounts, percentages, or time-saved figures",
      "Align technical skills list exactly with target job descriptions",
    ],
    severity: "moderate",
  },
};

const EVALUATOR_NAMES: Record<EvaluatorType, string> = {
  reasoning: "Reasoning Evaluator",
  research: "Research Evaluator",
  writing: "Writing Evaluator",
  risk: "Risk Evaluator",
  code: "Code Evaluator",
  career: "Career Evaluator",
};

export function getMockEvaluatorResult(id: EvaluatorType): EvaluatorResult {
  const template = RESULT_TEMPLATES[id];
  return {
    evaluatorId: id,
    name: EVALUATOR_NAMES[id],
    ...template,
  };
}

export async function fetchMockEvaluationResults(
  selected: EvaluatorType[]
): Promise<EvaluatorResult[]> {
  await delay(1600);
  return selected.map(getMockEvaluatorResult);
}

export function severityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    low: "Low concern",
    moderate: "Moderate concern",
    high: "High concern",
  };
  return labels[severity];
}
