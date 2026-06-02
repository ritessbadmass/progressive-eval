/** Client- and server-safe mock answer text (no network, no secrets). */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function buildMockAnswer(prompt: string): string {
  const topic = prompt.trim() || "your question";
  const shortTopic = topic.slice(0, 72) + (topic.length > 72 ? "…" : "");

  return `Here is a first-pass answer to: **${shortTopic}**

**Overview**
This is a fast, unverified response — generated without specialist review. It covers the most likely interpretation of your question based on common patterns, but it may miss nuance specific to your context.

**Key points**
- The core answer addresses the most direct reading of your prompt
- Recommendations here are based on general best practices, not verified against your specific constraints
- Some claims may rely on assumptions about your domain, goals, or available resources

**Where this answer is likely solid**
General framing, standard approaches, and well-established concepts in this area are covered with reasonable confidence.

**Where to be cautious**
Any claim involving specific numbers, regulations, technical edge cases, or domain expertise should be verified before acting on it. This answer has not been checked for logical consistency, factual accuracy, or risk.

**What to do next**
Use the **Evaluate this answer** button below to route this through one or more specialist lenses — Reasoning, Research, Writing, Risk, Code, or Career. Each evaluator will tell you exactly what it checked, what looks solid, and what to verify before use. You stay in control of the final decision.`;
}

/** Mock first answer with simulated latency (used for client-side fallback). */
export async function fetchMockAnswer(prompt: string): Promise<string> {
  await delay(1400);
  return buildMockAnswer(prompt);
}
