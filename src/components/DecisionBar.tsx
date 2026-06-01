"use client";

import type { UserDecision } from "@/types/evaluator";
import { cn } from "@/lib/utils";

interface DecisionBarProps {
  onDecide: (decision: UserDecision) => void;
  disabled?: boolean;
  activeDecision?: UserDecision;
  className?: string;
}

const options: {
  id: UserDecision;
  label: string;
}[] = [
  { id: "keep", label: "Keep answer" },
  { id: "revise", label: "Revise using findings" },
  { id: "alternate", label: "Try different approach" },
];

export function DecisionBar({
  onDecide,
  disabled = false,
  activeDecision,
  className,
}: DecisionBarProps) {
  return (
    <div className={cn("ml-11 space-y-3 py-4", className)}>
      <p className="text-sm text-claude-muted font-medium">What would you like to do?</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onDecide(opt.id)}
            disabled={disabled}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-claude-accent/50",
              activeDecision === opt.id
                ? "border-claude-accent/60 bg-claude-accent/10 text-claude-accent font-medium"
                : "border-claude-border bg-claude-surface text-claude-text hover:bg-claude-surface-2 hover:border-claude-border/80",
              disabled && "opacity-40 pointer-events-none"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
