"use client";

import { ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluateBarProps {
  onEvaluate: () => void;
  disabled?: boolean;
  evaluationActive?: boolean;
  className?: string;
}

export function EvaluateBar({
  onEvaluate,
  disabled = false,
  evaluationActive = false,
  className,
}: EvaluateBarProps) {
  if (evaluationActive) return null;

  return (
    <div className={cn("ml-11 flex flex-wrap gap-2 py-2", className)}>
      <button
        type="button"
        onClick={onEvaluate}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full border border-claude-border bg-claude-surface px-4 py-2 text-sm text-claude-text transition-all duration-200 ease-in-out hover:bg-claude-surface-2 hover:border-claude-accent/40 focus:outline-none focus:ring-2 focus:ring-claude-accent/50 disabled:opacity-40 pointer-events-auto"
      >
        <ScanSearch className="size-4 text-claude-accent" />
        Evaluate this answer
      </button>
    </div>
  );
}
