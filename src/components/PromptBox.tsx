"use client";

import { useRef, useEffect } from "react";
import { Plus, ChevronDown, Mic, ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  isCenteredState?: boolean;
  placeholder?: string;
}

export function PromptBox({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
  className,
  isCenteredState = false,
  placeholder = "How can I help you today?",
}: PromptBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = value.trim().length > 0 && !disabled && !isLoading;

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  };

  return (
    <div className={cn("w-full transition-all", className)}>
      {/* Spacious Outer Card Box matching Claude's prompt box */}
      <div className="w-full rounded-[24px] border border-claude-border bg-claude-surface p-5 shadow-sm transition-shadow focus-within:border-claude-accent/40 focus-within:ring-1 focus-within:ring-claude-accent/10">
        
        {/* Text Input area - spacious with min-height */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={2}
          className="w-full max-h-[220px] min-h-[64px] resize-none border-0 bg-transparent px-1 py-1 text-[17px] leading-relaxed text-claude-text outline-none shadow-none placeholder:text-claude-muted focus:ring-0 focus:outline-none"
        />

        {/* Bottom Control Bar Row - perfectly spaced */}
        <div className="mt-4 flex items-center justify-between">
          
          {/* Left Actions - Simple, standalone thin + icon */}
          <button
            type="button"
            className="flex items-center justify-center text-claude-muted transition-colors hover:text-claude-text"
            aria-label="Attach file"
          >
            <Plus className="size-6 stroke-[1.8]" />
          </button>

          {/* Right Actions - Model label, Mic, Soundwave, and conditional submit */}
          <div className="flex items-center gap-4">
            
            {/* Model & Low Indicator dropdown */}
            <div className="flex items-center gap-1.5 text-[13px] text-claude-muted hover:text-claude-text cursor-pointer transition-colors">
              <span className="font-normal text-claude-text">Sonnet 4.6</span>
              <span className="opacity-55 text-xs">Low</span>
              <ChevronDown className="size-3.5 opacity-60" />
            </div>

            {/* Microphone Icon */}
            <button
              type="button"
              className="flex items-center justify-center text-claude-muted transition-colors hover:text-claude-text"
              aria-label="Voice input"
            >
              <Mic className="size-[18px]" />
            </button>

            {/* High-Fidelity Custom Soundwave Indicator matching screenshot */}
            <div className="flex items-center gap-[2.5px] h-4 px-0.5" aria-label="Audio wave">
              <div className="w-[1.8px] h-2.5 bg-claude-muted opacity-80 rounded-full" />
              <div className="w-[1.8px] h-4 bg-claude-muted opacity-80 rounded-full" />
              <div className="w-[1.8px] h-3 bg-claude-muted opacity-80 rounded-full" />
              <div className="w-[1.8px] h-[18px] bg-claude-muted opacity-80 rounded-full" />
              <div className="w-[1.8px] h-2 bg-claude-muted opacity-80 rounded-full" />
            </div>

            {/* Conditional Send Arrow Button inside prompt box */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn(
                "flex size-7 items-center justify-center rounded-full transition-all duration-200 ease-in-out",
                canSubmit
                  ? "bg-claude-accent text-background hover:bg-claude-accent-hover hover:scale-105 shadow-sm"
                  : "bg-claude-surface-2 text-claude-muted/40 cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ArrowUp className="size-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
