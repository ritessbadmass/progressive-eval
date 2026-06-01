import { cn } from "@/lib/utils";

export function ClaudeAvatar({
  className,
  variant = "assistant",
}: {
  className?: string;
  variant?: "assistant" | "user";
}) {
  if (variant === "user") {
    return (
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full bg-claude-surface-2 text-xs font-medium text-claude-muted border border-claude-border",
          className
        )}
      >
        RP
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md bg-claude-accent text-claude-bg",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.35C16.6 22.15 20 17.25 20 12V6l-8-4zm0 2.18 6 3v4.82c0 4.2-2.72 8.12-6 9.18-3.28-1.06-6-4.98-6-9.18V7.18l6-3z" />
      </svg>
    </div>
  );
}
