"use client";

import { severityLabel } from "@/lib/mockData";
import type { EvaluatorResult, Severity } from "@/types/evaluator";
import { cn } from "@/lib/utils";

interface EvaluatorCardProps {
  result: EvaluatorResult;
  className?: string;
}

function severityPill(severity: Severity) {
  switch (severity) {
    case "high":
      return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300";
    case "moderate":
      return "border-claude-accent/40 bg-claude-accent/10 text-claude-accent";
    default:
      return "border-claude-border bg-claude-surface text-claude-muted";
  }
}

function Block({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-claude-muted">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-claude-text">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EvaluatorCard({ result, className }: EvaluatorCardProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-up space-y-4 border-b border-claude-border/80 py-5 last:border-0",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-claude-text">{result.name}</h4>
          <p className="mt-1 text-sm text-claude-muted">{result.summary}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
            severityPill(result.severity)
          )}
        >
          {severityLabel(result.severity)}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Block title="Checked for" items={result.checkedFor} />
        <Block title="Strengths" items={result.strengths} />
        <Block title="Weaknesses" items={result.weaknesses} />
        <Block title="Verify before use" items={result.verifyBeforeUse} />
      </div>
    </div>
  );
}
