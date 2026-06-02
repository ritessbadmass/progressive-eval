"use client";

import { ClaudeAvatar } from "@/components/ClaudeAvatar";
import { TypingIndicator } from "@/components/TypingIndicator";
import { isLiveAnswerEnabled } from "@/lib/api";
import type { AnswerState } from "@/types/evaluator";
import { cn } from "@/lib/utils";

interface AnswerCardProps {
  answer: AnswerState;
  modelLabel?: string;
  className?: string;
  hideLabel?: boolean;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-claude-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function AnswerBody({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-3 text-[15px] leading-[1.7] text-claude-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        if (
          trimmed.startsWith("**") &&
          trimmed.endsWith("**") &&
          !trimmed.slice(2, -2).includes("**")
        ) {
          return (
            <h3
              key={idx}
              className="pt-1 text-[15px] font-semibold text-claude-text"
            >
              {trimmed.slice(2, -2)}
            </h3>
          );
        }

        if (trimmed.startsWith("|")) {
          return (
            <p
              key={idx}
              className="overflow-x-auto font-mono text-xs text-claude-muted bg-claude-surface px-2 py-1 rounded"
            >
              {trimmed}
            </p>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <li key={idx} className="ml-4 list-disc text-claude-text">
              {renderInline(trimmed.slice(2))}
            </li>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const text = trimmed.replace(/^\d+\.\s/, "");
          return (
            <li key={idx} className="ml-4 list-decimal text-claude-text">
              {renderInline(text)}
            </li>
          );
        }

        if (
          trimmed.startsWith("*") &&
          trimmed.endsWith("*") &&
          !trimmed.startsWith("**")
        ) {
          return (
            <p key={idx} className="text-sm italic text-claude-muted">
              {trimmed.slice(1, -1)}
            </p>
          );
        }

        return <p key={idx}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

const variantLabels: Record<AnswerState["variant"], string> = {
  initial: "Assistant",
  revised: "Revised",
  alternate: "Alternate approach",
};

export function AnswerCard({
  answer,
  modelLabel = "Llama 3.1 8B",
  className,
  hideLabel = false,
}: AnswerCardProps) {
  const label = answer.label ?? variantLabels[answer.variant];
  const showSource =
    isLiveAnswerEnabled() &&
    answer.variant === "initial" &&
    !answer.isLoading &&
    answer.source;

  return (
    <article
      className={cn(
        "animate-in fade-in slide-up group flex gap-4 py-6",
        className
      )}
    >
      <ClaudeAvatar />
      <div className="min-w-0 flex-1">
        {!hideLabel && (
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-claude-text">{label}</span>
            <span className="text-xs text-claude-muted">{modelLabel}</span>
            {answer.variant !== "initial" && (
              <span className="rounded-full bg-claude-surface-2 px-2 py-0.5 text-[11px] text-claude-muted border border-claude-border">
                Updated
              </span>
            )}
            {showSource && (
              <span className="text-[11px] text-claude-muted">
                · {answer.source === "live" ? "Live" : "Mock"}
              </span>
            )}
          </div>
        )}
        {answer.isLoading ? (
          <TypingIndicator />
        ) : (
          <AnswerBody content={answer.content} />
        )}
      </div>
    </article>
  );
}
