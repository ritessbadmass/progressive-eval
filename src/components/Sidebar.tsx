"use client";

import {
  PanelLeft,
  Plus,
  MessageSquare,
  Folder,
  LayoutGrid,
  Code,
  Briefcase,
} from "lucide-react";

interface SidebarProps {
  onNewChat?: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  return (
    <aside className="hidden w-[56px] shrink-0 flex-col items-center justify-between bg-claude-surface py-4.5 md:flex select-none border-r border-claude-border">
      
      {/* Top Navigation Group */}
      <div className="flex flex-col items-center gap-[18px]">
        {/* Collapse Sidebar Icon */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface-2 hover:text-claude-text"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="size-[20px] stroke-[1.8]" />
        </button>

        {/* Plus Start New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface-2 hover:text-claude-text"
          aria-label="New chat"
        >
          <Plus className="size-[20px] stroke-[1.8]" />
        </button>

        {/* Chat History Icon */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface-2 hover:text-claude-text"
          aria-label="Chats"
        >
          <MessageSquare className="size-[20px] stroke-[1.8]" />
        </button>

        {/* Artifacts/Documents Folder Icon */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface-2 hover:text-claude-text"
          aria-label="Artifacts"
        >
          <Folder className="size-[20px] stroke-[1.8]" />
        </button>

        {/* Workspace Compass Grid Icon */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface-2 hover:text-claude-text"
          aria-label="Workspaces"
        >
          <LayoutGrid className="size-[20px] stroke-[1.8]" />
        </button>

        {/* Developer Console Code Icon */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface-2 hover:text-claude-text"
          aria-label="Developer tools"
        >
          <Code className="size-[20px] stroke-[1.8]" />
        </button>

        {/* Bag/Briefcase Icon matching screenshot exactly */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface-2 hover:text-claude-text"
          aria-label="Account/Billing"
        >
          <Briefcase className="size-[20px] stroke-[1.8]" />
        </button>
      </div>

      {/* Bottom Profile Group */}
      <div className="flex flex-col items-center gap-[18px]">
        {/* Generic User Profile Icon - no initials, no name */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface-2 hover:text-claude-text"
          aria-label="User Profile"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-[20px]"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
