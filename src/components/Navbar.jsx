import React from 'react';
import { Sun, Moon, History } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme();
  const { history, setHistoryOpen, resetToLanding } = useStore();

  return (
    <header className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetToLanding}>
          <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
            <span>Repo<span className="text-airforce-500">Graph</span></span>
            <span className="text-[11px] px-1.5 py-0.5 rounded font-mono font-bold bg-airforce-500/15 text-airforce-600 dark:text-airforce-400">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* History button */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-neutral-300" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>
        </div>
      </div>
    </header>
  );
}
