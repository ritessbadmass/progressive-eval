"use client";

import { useCallback, useState } from "react";
import { AnswerCard } from "@/components/AnswerCard";
import { ClaudeAvatar } from "@/components/ClaudeAvatar";
import { ChatHeader } from "@/components/ChatHeader";
import { DecisionBar } from "@/components/DecisionBar";
import { EvaluateBar } from "@/components/EvaluateBar";
import { EvaluatorCard } from "@/components/EvaluatorCard";
import { EvaluatorPicker } from "@/components/EvaluatorPicker";
import { PromptBox } from "@/components/PromptBox";
import { SectionHeader } from "@/components/SectionHeader";
import { Sidebar } from "@/components/Sidebar";
import { UserMessage } from "@/components/UserMessage";
import { generateAnswer } from "@/lib/api";
import { isLiveEvaluatorsEnabled, runEvaluators } from "@/lib/evaluationApi";
import { reviseAnswer, generateAlternateAnswer } from "@/lib/reviseApi";
import { MAX_EVALUATORS } from "@/lib/evaluators";
import type {
  AnswerState,
  EvaluationState,
  EvaluatorType,
  UserDecision,
  EvaluationPlaybook,
} from "@/types/evaluator";

const initialEvaluation: EvaluationState = {
  phase: "idle",
  selectedEvaluators: [],
  results: [],
  playbook: "balanced",
};

interface ChatTurn {
  id: string;
  submittedPrompt: string;
  answer: AnswerState;
  evaluation: EvaluationState;
}

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const [evaluation, setEvaluation] =
    useState<EvaluationState>(initialEvaluation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pastTurns, setPastTurns] = useState<ChatTurn[]>([]);

  const hasConversation = answer !== null || isSubmitting;
  const hasAnswer = answer !== null && !answer.isLoading && answer.content;
  const showEvaluateBar =
    hasAnswer &&
    evaluation.phase === "idle" &&
    answer?.variant === "initial";

  const handleSubmitPrompt = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isSubmitting) return;

    if (submittedPrompt && answer) {
      setPastTurns((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          submittedPrompt,
          answer,
          evaluation,
        },
      ]);
    }

    setIsSubmitting(true);
    setSubmittedPrompt(trimmed);
    setPrompt(""); // Clear the input box immediately!
    setEvaluation(initialEvaluation);
    setAnswer({
      prompt: trimmed,
      content: "",
      variant: "initial",
      isLoading: true,
    });

    try {
      const { answer: content, source } = await generateAnswer(trimmed);
      setAnswer({
        prompt: trimmed,
        content,
        variant: "initial",
        isLoading: false,
        source,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [prompt, isSubmitting, submittedPrompt, answer, evaluation]);

  const handleStartEvaluation = () => {
    setEvaluation((prev) => ({ ...prev, phase: "picker" }));
  };

  const handleToggleEvaluator = (id: EvaluatorType) => {
    setEvaluation((prev) => {
      const exists = prev.selectedEvaluators.includes(id);
      if (exists) {
        return {
          ...prev,
          selectedEvaluators: prev.selectedEvaluators.filter((e) => e !== id),
        };
      }
      if (prev.selectedEvaluators.length >= MAX_EVALUATORS) return prev;
      return {
        ...prev,
        selectedEvaluators: [...prev.selectedEvaluators, id],
      };
    });
  };

  const handlePlaybookChange = (playbook: EvaluationPlaybook) => {
    setEvaluation((prev) => ({ ...prev, playbook }));
  };

  const handleRunEvaluation = async () => {
    const selected = evaluation.selectedEvaluators;
    if (selected.length === 0 || !answer?.content || !submittedPrompt) return;

    setEvaluation((prev) => ({ ...prev, phase: "running" }));

    const { results, source } = await runEvaluators({
      prompt: submittedPrompt,
      answer: answer.content,
      evaluatorTypes: selected,
      playbook: evaluation.playbook || "balanced",
    });

    setEvaluation((prev) => ({
      ...prev,
      phase: "results",
      results,
      source,
    }));
  };

  const handleCancelEvaluation = () => {
    setEvaluation(initialEvaluation);
  };

  const handleDecision = async (decision: UserDecision) => {
    if (!answer || !submittedPrompt) return;

    setEvaluation((prev) => ({ ...prev, decision, phase: "complete" }));

    if (decision === "keep") return;

    setAnswer({
      prompt: submittedPrompt,
      content: "",
      variant: decision === "revise" ? "revised" : "alternate",
      label:
        decision === "revise"
          ? "Revised using findings"
          : "Different approach",
      isLoading: true,
    });

    const content =
      decision === "revise"
        ? await reviseAnswer(submittedPrompt, answer.content, evaluation.results)
        : await generateAlternateAnswer(submittedPrompt, answer.content, "different approach");

    setAnswer({
      prompt: submittedPrompt,
      content,
      variant: decision === "revise" ? "revised" : "alternate",
      label:
        decision === "revise"
          ? "Revised using findings"
          : "Different approach",
      isLoading: false,
    });
  };

  const handleNewQuestion = () => {
    setPrompt("");
    setSubmittedPrompt("");
    setAnswer(null);
    setEvaluation(initialEvaluation);
    setPastTurns([]);
  };

  return (
    <div className="flex h-full bg-claude-bg text-claude-text">
      <Sidebar onNewChat={handleNewQuestion} />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader />

        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* Scrollable message area */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[800px] px-4 pb-80 pt-4 md:px-6">
              {!hasConversation && (
                <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 pb-16">
                  {/* Good evening greeting with high-fidelity organic Claude starburst asterisk */}
                  <div className="mb-7 flex items-center justify-center gap-3.5 select-none">
                    <svg viewBox="0 0 100 100" className="size-[38px] text-claude-accent fill-claude-accent">
                      <g transform="translate(50, 50)">
                        {[...Array(11)].map((_, i) => (
                          <path
                            key={i}
                            d="M -3 -15 C -3 -35, 3 -35, 3 -15 C 3 -5, -3 -5, -3 -15 Z"
                            transform={`rotate(${i * (360 / 11)})`}
                          />
                        ))}
                        <circle cx="0" cy="0" r="10" className="fill-claude-accent" />
                      </g>
                    </svg>
                    <h1 className="font-serif text-[42px] font-normal tracking-normal text-claude-text">
                      Good evening, Ritesh
                    </h1>
                  </div>

                  {/* Centered Prompt Box for empty state */}
                  <div className="w-full max-w-[720px] pointer-events-auto">
                    <PromptBox
                      value={prompt}
                      onChange={setPrompt}
                      onSubmit={handleSubmitPrompt}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      isCenteredState={true}
                    />

                    {/* Action Pills exactly as in user's screenshot */}
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPrompt("Write a ")}
                        className="flex items-center gap-2 rounded-full border border-claude-border bg-claude-surface px-4 py-2 text-[13px] text-claude-muted transition-all hover:bg-claude-surface-2 hover:text-claude-text"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3.5"
                        >
                          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                        Write
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrompt("Explain ")}
                        className="flex items-center gap-2 rounded-full border border-claude-border bg-claude-surface px-4 py-2 text-[13px] text-claude-muted transition-all hover:bg-claude-surface-2 hover:text-claude-text"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3.5"
                        >
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                          <path d="M6 6h10M6 10h10" />
                        </svg>
                        Learn
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrompt("Review this code or write a function to ")}
                        className="flex items-center gap-2 rounded-full border border-claude-border bg-claude-surface px-4 py-2 text-[13px] text-claude-muted transition-all hover:bg-claude-surface-2 hover:text-claude-text"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3.5"
                        >
                          <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" />
                        </svg>
                        Code
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrompt("Give me ideas for ")}
                        className="flex items-center gap-2 rounded-full border border-claude-border bg-claude-surface px-4 py-2 text-[13px] text-claude-muted transition-all hover:bg-claude-surface-2 hover:text-claude-text"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3.5"
                        >
                          <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                          <path d="M6 2v2M10 2v2M14 2v2" />
                        </svg>
                        Life stuff
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrompt("Recommend a ")}
                        className="flex items-center gap-2 rounded-full border border-claude-border bg-claude-surface px-4 py-2 text-[13px] text-claude-muted transition-all hover:bg-claude-surface-2 hover:text-claude-text"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3.5"
                        >
                          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5M9 18h6M10 22h4" />
                        </svg>
                        Claude's choice
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {hasConversation && (
                <div className="animate-in fade-in">
                  {/* Past conversation history turns */}
                  {pastTurns.map((turn) => (
                    <div key={turn.id} className="border-b border-claude-border/20 pb-6 mb-6">
                      <UserMessage content={turn.submittedPrompt} />
                      <AnswerCard answer={turn.answer} />
                      {turn.evaluation.phase === "complete" && turn.evaluation.results.length > 0 && (
                        <div className="flex gap-4 py-4 opacity-85">
                          <ClaudeAvatar className="mt-1" />
                          <div className="min-w-0 flex-1">
                            <SectionHeader
                              title="Evaluator findings"
                              description="Transparent reasoning — no trust scores."
                              className="ml-0 border-t-0 pt-0"
                            />
                            <div className="mt-2">
                              {turn.evaluation.results.map((result) => (
                                <EvaluatorCard
                                  key={result.evaluatorId}
                                  result={result}
                                />
                              ))}
                            </div>
                            {turn.evaluation.decision && (
                              <p className="py-2 text-xs text-claude-muted font-medium">
                                {turn.evaluation.decision === "keep" &&
                                  "You kept this answer. Evaluation complete."}
                                {turn.evaluation.decision === "revise" &&
                                  "Revised answer shown above using evaluator findings."}
                                {turn.evaluation.decision === "alternate" &&
                                  "Alternate approach shown above."}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {submittedPrompt && <UserMessage content={submittedPrompt} />}

                  {answer && <AnswerCard answer={answer} />}

                  {showEvaluateBar && (
                    <EvaluateBar
                      onEvaluate={handleStartEvaluation}
                      disabled={answer.isLoading}
                      evaluationActive={
                        evaluation.phase !== "idle" &&
                        evaluation.phase !== "complete"
                      }
                    />
                  )}

                  {(evaluation.phase === "picker" ||
                    evaluation.phase === "running") && (
                    <EvaluatorPicker
                      selected={evaluation.selectedEvaluators}
                      onToggle={handleToggleEvaluator}
                      onRun={handleRunEvaluation}
                      onCancel={handleCancelEvaluation}
                      isRunning={evaluation.phase === "running"}
                      playbook={evaluation.playbook || "balanced"}
                      onPlaybookChange={handlePlaybookChange}
                    />
                  )}

                  {(evaluation.phase === "results" ||
                    evaluation.phase === "complete") && (
                    <div className="animate-in fade-in slide-up flex gap-4 py-4">
                      <ClaudeAvatar className="mt-1" />
                      <div className="min-w-0 flex-1">
                        <SectionHeader
                          title="Evaluator findings"
                          description={
                            isLiveEvaluatorsEnabled() && evaluation.source
                              ? `Evaluation source: ${
                                  evaluation.source === "live"
                                    ? "Live (NVIDIA)"
                                    : evaluation.source === "mixed"
                                      ? "Mixed (live + mock fallback)"
                                      : "Mock"
                                }`
                              : "Transparent reasoning — no trust scores."
                          }
                          className="ml-0 border-t-0 pt-0"
                        />
                        <div className="mt-2">
                          {evaluation.results.map((result) => (
                            <EvaluatorCard
                              key={result.evaluatorId}
                              result={result}
                            />
                          ))}
                        </div>

                        {evaluation.phase === "results" && (
                          <DecisionBar
                            onDecide={handleDecision}
                            className="ml-0"
                          />
                        )}

                        {evaluation.phase === "complete" &&
                          evaluation.decision && (
                            <p className="py-4 text-sm text-claude-muted font-medium">
                              {evaluation.decision === "keep" &&
                                "You kept this answer. Evaluation complete."}
                              {evaluation.decision === "revise" &&
                                "Revised answer shown above using evaluator findings."}
                              {evaluation.decision === "alternate" &&
                                "Alternate approach shown above."}
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                  {evaluation.phase === "complete" && (
                    <div className="ml-11 py-6">
                      <button
                        type="button"
                        onClick={handleNewQuestion}
                        className="text-sm text-claude-muted underline-offset-4 transition-colors hover:text-claude-text hover:underline"
                      >
                        Start a new conversation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fixed bottom input */}
          {hasConversation && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-claude-bg via-claude-bg/95 to-transparent pb-6 pt-16">
              <div className="pointer-events-auto mx-auto w-full max-w-[800px] px-4 md:px-6">
                <PromptBox
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={handleSubmitPrompt}
                  disabled={!!answer?.isLoading}
                  isLoading={isSubmitting || !!answer?.isLoading}
                  placeholder=""
                />
                <p className="mt-3 text-center text-[11px] text-claude-muted">
                  Evaluators are review lenses · You remain the decision-maker
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
