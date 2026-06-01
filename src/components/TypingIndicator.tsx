export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-2" aria-label="Generating">
      <span className="typing-dot size-2 rounded-full bg-claude-muted" style={{ animationDelay: "0ms" }} />
      <span className="typing-dot size-2 rounded-full bg-claude-muted" style={{ animationDelay: "150ms" }} />
      <span className="typing-dot size-2 rounded-full bg-claude-muted" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
