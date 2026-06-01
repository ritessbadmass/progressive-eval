import { NextResponse } from "next/server";
import { devLog } from "@/lib/devLog";
import { buildMockAnswer } from "@/lib/mockApi";
import type { ChatErrorBody, ChatRequestBody, ChatResponseBody } from "@/types/api";

const DEFAULT_NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";
const DEMO_MAX_TOKENS = 512;
const NVIDIA_TIMEOUT_MS = 25_000;

function isLiveAnswerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_ANSWER === "true";
}

function isNvidiaConfigured(): boolean {
  return Boolean(process.env.NVIDIA_API_KEY?.trim());
}

function shouldAttemptLiveCall(): boolean {
  return isLiveAnswerEnabled() && isNvidiaConfigured();
}

function getAnswerModel(): string {
  return process.env.NVIDIA_MODEL?.trim() || DEFAULT_NVIDIA_MODEL;
}

async function generateAnswerWithNvidia(prompt: string): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY!.trim();
  const baseUrl = (
    process.env.NVIDIA_API_BASE?.trim() || DEFAULT_NVIDIA_BASE
  ).replace(/\/$/, "");
  const model = getAnswerModel();

  devLog(`NVIDIA chat request model=${model}`);

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Give a clear, concise, neutral first-pass answer. Use short paragraphs or bullets when helpful. Do not invent citations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: DEMO_MAX_TOKENS,
    }),
    signal: AbortSignal.timeout(NVIDIA_TIMEOUT_MS),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`NVIDIA API error (${res.status}): ${errText}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("NVIDIA API returned no message content");
  }

  return content;
}

async function generateFirstAnswer(prompt: string): Promise<ChatResponseBody> {
  if (shouldAttemptLiveCall()) {
    try {
      const answer = await generateAnswerWithNvidia(prompt);
      devLog("answer source: live");
      return { answer, source: "live" };
    } catch (error) {
      console.error("[api/chat] NVIDIA call failed, using mock:", error);
      devLog("answer source: mock (NVIDIA error fallback)");
    }
  } else {
    devLog(
      `answer source: mock (${!isLiveAnswerEnabled() ? "live flag off" : "missing NVIDIA_API_KEY"})`
    );
  }

  return { answer: buildMockAnswer(prompt), source: "mock" };
}

export async function POST(request: Request) {
  let promptForFallback = "";

  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json<ChatErrorBody>(
        { error: "Missing or invalid `prompt` in request body" },
        { status: 400 }
      );
    }

    const trimmed = body.prompt.trim();
    promptForFallback = trimmed;

    if (!trimmed) {
      return NextResponse.json<ChatErrorBody>(
        { error: "Prompt cannot be empty" },
        { status: 400 }
      );
    }

    const result = await generateFirstAnswer(trimmed);
    return NextResponse.json<ChatResponseBody>(result);
  } catch (error) {
    console.error("[api/chat] Unexpected error:", error);
    devLog("answer source: mock (unexpected error fallback)");

    if (promptForFallback) {
      return NextResponse.json<ChatResponseBody>({
        answer: buildMockAnswer(promptForFallback),
        source: "mock",
      });
    }

    return NextResponse.json<ChatErrorBody>(
      { error: "Failed to generate answer" },
      { status: 500 }
    );
  }
}