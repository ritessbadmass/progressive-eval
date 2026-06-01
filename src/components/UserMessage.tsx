"use client";

import { ClaudeAvatar } from "@/components/ClaudeAvatar";

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <article className="animate-in fade-in slide-up flex gap-4 py-6">
      <ClaudeAvatar variant="user" />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="mb-1 text-sm font-medium text-claude-text">You</p>
        <p className="text-[15px] leading-[1.7] text-claude-text whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </article>
  );
}
