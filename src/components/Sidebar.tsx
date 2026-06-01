"use client";

import {
  PanelLeft,
  Plus,
  MessageSquare,
  Folder,
  LayoutGrid,
  Code,
  Briefcase,
  Download,
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
        {/* Install / Download App Button with blue dot indicator */}
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg text-claude-muted transition-colors hover:bg-claude-surface-2 hover:text-claude-text"
          aria-label="Install app"
        >
          <Download className="size-[20px] stroke-[1.8]" />
          <span className="absolute top-[6px] right-[6px] size-2 rounded-full border-2 border-claude-surface bg-claude-accent" />
        </button>

        {/* RP Profile Circle avatar */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full bg-claude-surface-2 text-[12px] font-semibold text-claude-text transition-transform hover:scale-105"
          aria-label="User Profile"
        >
          RP
        </button>
      </div>
    </aside>
  );
}
