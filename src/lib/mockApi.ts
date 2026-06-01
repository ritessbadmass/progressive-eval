/** Client- and server-safe mock answer text (no network, no secrets). */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function buildMockAnswer(prompt: string): string {
  const topic = prompt.trim() || "your question";

  return `Here is a concise first-pass answer to **${topic.slice(0, 80)}${topic.length > 80 ? "…" : ""}**.

**Overview**
Progressive evaluation lets you get a fast answer first, then optionally inspect it through specialist lenses when you are unsure—without forcing review on every turn.

**Suggested approach**
1. Start with the clearest framing of the problem and what “good enough” means for your context.
2. Identify 2–3 decision-critical assumptions the answer depends on.
3. Use targeted evaluators only on dimensions that matter for how you will use the output.
4. Revise or try a different approach based on explained findings—not opaque scores.

**Practical note**
This is a mocked response for demo purposes. In production, this slot would be filled by your model backend while keeping the same evaluation flow underneath.`;
}

/** Mock first answer with simulated latency (used for client-side fallback). */
export async function fetchMockAnswer(prompt: string): Promise<string> {
  await delay(1400);
  return buildMockAnswer(prompt);
}
