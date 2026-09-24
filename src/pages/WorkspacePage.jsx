import React from 'react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';
import GraphCanvas from '../components/graph/GraphCanvas';
import NodePanel from '../components/panel/NodePanel';
import ChatSidebar from '../components/chat/ChatSidebar';
import { Sun, Moon, ArrowLeft, GitBranch, Sparkles } from 'lucide-react';

export default function WorkspacePage() {
  const { repoName, resetToLanding } = useStore();
  const { toggleTheme, isDark } = useTheme();

  return (
    <div className="w-screen h-screen flex flex-col font-sans bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 overflow-hidden transition-colors">
      {/* Top Navbar */}
      <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={resetToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Analyze another repository"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change</span>
          </button>

          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />

          {/* Brand Logo */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-white">
              Repo<span className="text-airforce-500">Graph</span>
            </span>
          </div>

          {/* Repo Name pill */}
          {repoName && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <GitBranch className="w-3 h-3 text-airforce-500" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[200px] sm:max-w-none">
                {repoName}
              </span>
            </div>
          )}

          {/* Status pill */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Analyzed</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-neutral-300" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Body: 70–75% Graph, 25–30% Chat */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Graph Area (~70% width) */}
        <div className="flex-1 md:w-[70%] lg:w-[73%] h-full relative overflow-hidden">
          <GraphCanvas />
          <NodePanel />
        </div>

        {/* Chat Sidebar (~30% width) */}
        <div className="w-full md:w-[30%] lg:w-[27%] h-[45vh] md:h-full shrink-0">
          <ChatSidebar />
        </div>
      </div>
    </div>
  );
}
