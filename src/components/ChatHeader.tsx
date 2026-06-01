"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ChatHeader() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between bg-transparent px-6 py-4">
      {/* Empty Left Box to balance flex layout */}
      <div className="w-9" />

      {/* Center Group - Free Plan & Upgrade Indicator */}
      <div className="flex items-center gap-1.5 rounded-full bg-claude-surface px-3.5 py-1 text-xs font-medium text-claude-muted border border-claude-border">
        <span>Free plan</span>
        <span className="opacity-40">•</span>
        <button
          type="button"
          className="text-claude-text underline underline-offset-2 hover:text-claude-accent font-medium cursor-pointer"
        >
          Upgrade
        </button>
      </div>

      {/* Right Group - Theme Toggle & Profile Icon */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface hover:text-claude-text"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="size-[20px] stroke-[1.8]" />
          ) : (
            <Moon className="size-[20px] stroke-[1.8]" />
          )}
        </button>

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface hover:text-claude-text"
          aria-label="Profile/Help"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-[22px]"
          >
            {/* Simple outline robot/brand face matching Claude's icon in screenshot */}
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            <path d="M8 11.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5-.5.2-.5.5.2.5.5.5zM16 11.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5-.5.2-.5.5.2.5.5.5z" />
            <path d="M12 16a3.5 3.5 0 0 0 3-1.5H9a3.5 3.5 0 0 0 3 1.5z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
