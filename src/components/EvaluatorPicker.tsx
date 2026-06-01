"use client";

import { Loader2 } from "lucide-react";
import { EVALUATORS, MAX_EVALUATORS } from "@/lib/evaluators";
import type { EvaluatorType } from "@/types/evaluator";
import { cn } from "@/lib/utils";

const EVALUATOR_CAPABILITIES: Record<string, string> = {
  reasoning: "Logical flaws, unstated assumptions, weak or skipped arguments, unaddressed alternatives, overconfident conclusions, and internal logical consistency.",
  research: "Unsupported factual claims, missing source verification, stale references, and checkable assertions requiring external grounding.",
  writing: "Clarity, logical structure, reader scannability, tone alignment, target audience fit, and removing unnecessary filler words.",
  risk: "Practical real-world harm if wrong, compliance/safety sensitivities, overconfident directives, and high-stakes steps requiring verification.",
  code: "Architectural design correctness, syntax validity, edge cases, error handling gaps, testability, and production readiness.",
  career: "Resume impact framing, ATS keyword relevance, metrics-driven achievements, coverage gaps, and professional culture signals.",
};

interface EvaluatorPickerProps {
  selected: EvaluatorType[];
  onToggle: (id: EvaluatorType) => void;
  onRun: () => void;
  onCancel: () => void;
  isRunning?: boolean;
}

export function EvaluatorPicker({
  selected,
  onToggle,
  onRun,
  onCancel,
  isRunning = false,
}: EvaluatorPickerProps) {
  const atMax = selected.length >= MAX_EVALUATORS;

  return (
    <div className="animate-in fade-in slide-up ml-11 space-y-4 border-l border-claude-border py-4 pl-5">
      <div>
        <p className="text-sm font-semibold text-claude-text">
          Choose specialist lenses
        </p>
        <p className="mt-1 text-sm text-claude-muted">
          Up to {MAX_EVALUATORS} — each reviews one dimension only.
        </p>
      </div>

      <div className="flex flex-wrap gap-3.5 pt-1.5">
        {EVALUATORS.map((evaluator) => {
          const isSelected = selected.includes(evaluator.id);
          const isDisabled = !isSelected && atMax;
          const capabilities = EVALUATOR_CAPABILITIES[evaluator.id] || evaluator.tagline;

          return (
            <div key={evaluator.id} className="group relative inline-block">
              <button
                type="button"
                disabled={isDisabled || isRunning}
                onClick={() => onToggle(evaluator.id)}
                className={cn(
                  "rounded-full border px-4 py-2.5 text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-claude-accent/50 cursor-pointer select-none",
                  isSelected
                    ? "border-claude-accent/60 bg-claude-accent/10 text-claude-accent font-semibold"
                    : "border-claude-border bg-claude-surface text-claude-text hover:bg-claude-surface-2 hover:border-claude-border/80",
                  isDisabled && "cursor-not-allowed opacity-40"
                )}
              >
                {evaluator.name.replace(" Evaluator", "")}
              </button>

              {/* Spacious, premium editorial hover tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 w-[310px] -translate-x-1/2 scale-95 opacity-0 transition-all duration-200 ease-out origin-bottom group-hover:scale-100 group-hover:opacity-100">
                <div className="rounded-xl border border-claude-border bg-claude-surface p-4 shadow-xl select-none text-left leading-normal">
                  {/* Header dot + name */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="size-2 rounded-full bg-claude-accent animate-pulse" />
                    <span className="text-[12px] font-bold uppercase tracking-wider text-claude-accent">
                      {evaluator.name}
                    </span>
                  </div>
                  {/* Dimension */}
                  <div className="text-[11px] font-medium text-claude-muted mb-2.5">
                    FOCUS: <span className="text-claude-text/90 font-semibold">{evaluator.dimension}</span>
                  </div>
                  {/* Capabilities */}
                  <div className="border-t border-claude-border/30 pt-2.5">
                    <p className="text-[11px] font-bold text-claude-text/80 uppercase tracking-wide mb-1">
                      Specifically trained to check:
                    </p>
                    <p className="text-[12.5px] leading-relaxed text-claude-muted font-normal">
                      {capabilities}
                    </p>
                  </div>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1.5 rotate-45 border-r border-b border-claude-border bg-claude-surface" />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-claude-muted font-medium">
        {selected.length} of {MAX_EVALUATORS} selected
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={selected.length === 0 || isRunning}
          className="inline-flex items-center gap-2 rounded-full bg-claude-accent px-5 py-2 text-sm font-semibold text-background transition-all duration-200 ease-in-out hover:bg-claude-accent-hover focus:outline-none focus:ring-2 focus:ring-claude-accent/50 disabled:opacity-40 disabled:pointer-events-none shadow-sm"
        >
          {isRunning ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Running…
            </>
          ) : (
            "Run evaluation"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isRunning}
          className="rounded-full px-4 py-2 text-sm text-claude-muted transition-all duration-200 ease-in-out hover:bg-claude-surface hover:text-claude-text focus:outline-none focus:ring-2 focus:ring-claude-accent/50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
