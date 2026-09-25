import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';
import GraphCanvas from '../components/graph/GraphCanvas';
import NodePanel from '../components/panel/NodePanel';
import ChatSidebar from '../components/chat/ChatSidebar';
import HistoryDrawer from '../components/history/HistoryDrawer';
import { Sun, Moon, ArrowLeft, GitBranch, History } from 'lucide-react';

export default function WorkspacePage() {
  const { repoName, resetToLanding, history, setHistoryOpen } = useStore();
  const { toggleTheme, isDark } = useTheme();

  // Resizable Chatbox & Graph state
  const [chatWidth, setChatWidth] = useState(380);
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      // Chat is on the right side
      const newWidth = window.innerWidth - e.clientX;
      // Clamped between 280px and 60% of screen width (max 850px)
      const minWidth = 280;
      const maxWidth = Math.min(window.innerWidth * 0.6, 850);
      const clamped = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setChatWidth(clamped);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isDragging) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="w-screen h-screen flex flex-col font-sans bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 overflow-hidden transition-colors">
      {/* Top Navbar */}
      <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Back button */}
          <button
            onClick={resetToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Analyze another repository"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change</span>
          </button>

          <div className="h-4 w-[1px] bg-neutral-200 dark:border-neutral-800 hidden sm:block" />

          {/* Brand Logo */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>Repo<span className="text-airforce-500">Graph</span></span>
              <span className="text-[11px] px-1.5 py-0.5 rounded font-mono font-bold bg-airforce-500/15 text-airforce-600 dark:text-airforce-400">AI</span>
            </span>
          </div>

          {/* Repo Name pill */}
          {repoName && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <GitBranch className="w-3 h-3 text-airforce-500" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[160px] sm:max-w-none">
                {repoName}
              </span>
            </div>
          )}

          {/* Status pill */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </div>
        </div>

        {/* Right actions: History button & Theme toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="View analysis history"
          >
            <History className="w-4 h-4 text-airforce-500" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-airforce-500/15 text-airforce-600 dark:text-airforce-400 font-mono text-[10px] font-bold">
                {history.length}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-neutral-300" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Body with Resizable Splitter */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Graph Area (expands to fill remaining width) */}
        <div className="flex-1 h-full relative overflow-hidden">
          <GraphCanvas />
          <NodePanel />
        </div>

        {/* Resizable Divider Slider (Desktop only) */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className={`hidden md:flex items-center justify-center w-2 hover:w-2.5 transition-all duration-150 cursor-col-resize select-none shrink-0 z-20 group ${
            isDragging ? 'bg-airforce-500' : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-airforce-500/60'
          }`}
          title="Drag to resize chatbox and graph"
        >
          {/* Subtle grab dots handle */}
          <div className="flex flex-col gap-1 items-center opacity-40 group-hover:opacity-100 transition-opacity">
            <span className="w-1 h-1 rounded-full bg-neutral-600 dark:bg-neutral-400 group-hover:bg-white" />
            <span className="w-1 h-1 rounded-full bg-neutral-600 dark:bg-neutral-400 group-hover:bg-white" />
            <span className="w-1 h-1 rounded-full bg-neutral-600 dark:bg-neutral-400 group-hover:bg-white" />
          </div>
        </div>

        {/* Chatbox Sidebar with Dynamic Width */}
        <div
          className="w-full h-[45vh] md:h-full shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800"
          style={{
            width: isDesktop ? `${chatWidth}px` : '100%'
          }}
        >
          <ChatSidebar />
        </div>
      </div>

      {/* Slide-Over History Sidebar */}
      <HistoryDrawer />
    </div>
  );
}
