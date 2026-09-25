import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import {
  History,
  X,
  Trash2,
  ArrowRight,
  GitBranch,
  Code2,
  FolderGit2,
  Clock,
  Search,
} from 'lucide-react';

export default function HistoryDrawer() {
  const {
    history,
    isHistoryOpen,
    setHistoryOpen,
    openFromHistory,
    removeFromHistory,
    clearHistory,
    repoName: currentRepoName,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');

  if (!isHistoryOpen) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return 'Just now';
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const safeList = Array.isArray(history) ? history.filter(Boolean) : [];

  const filteredHistory = safeList.filter((item) => {
    if (!item) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const name = String(item.repoName || item.repo_name || '').toLowerCase();
    const lang = String(item.language || '').toLowerCase();
    const desc = String(item.description || '').toLowerCase();
    return name.includes(q) || lang.includes(q) || desc.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setHistoryOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col z-10 transition-transform duration-300">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-airforce-500/10 text-airforce-600 dark:text-airforce-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Analysis History
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {safeList.length} {safeList.length === 1 ? 'repository' : 'repositories'} saved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {safeList.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-2 py-1 rounded text-xs font-mono text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Clear all history"
              >
                Clear all
              </button>
            )}

            <button
              onClick={() => setHistoryOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search input in drawer if list has multiple items */}
        {safeList.length > 2 && (
          <div className="px-4 pt-3 pb-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-airforce-500 transition-colors font-mono"
              />
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center mb-3 text-neutral-300 dark:text-neutral-600">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {searchQuery ? 'No matching repositories' : 'No analyzed repositories yet'}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-[240px]">
                {searchQuery
                  ? 'Try searching with a different term.'
                  : 'Repositories you analyze will be saved here so you can open them instantly without re-analyzing.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item, idx) => {
              const name = item.repoName || item.repo_name || 'Repository';
              const isCurrent = currentRepoName && (currentRepoName === item.repoName || currentRepoName === item.repo_name);

              return (
                <div
                  key={item.id || name || idx}
                  className={`group relative p-3.5 rounded-xl border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-airforce-50/50 dark:bg-airforce-950/20 border-airforce-500/30 ring-1 ring-airforce-500/20'
                      : 'bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:border-airforce-500/40 hover:shadow-sm'
                  }`}
                >
                  {/* Top Bar: Repo Name + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <GitBranch className="w-3.5 h-3.5 text-airforce-500 shrink-0" />
                      <span className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                        {name}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-airforce-500 text-white uppercase">
                          Active
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(name);
                      }}
                      className="p-1 rounded text-neutral-300 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Metadata row */}
                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] font-mono text-neutral-400">
                    <div className="flex items-center gap-3">
                      {item.language && (
                        <span className="flex items-center gap-1">
                          <Code2 className="w-3 h-3 text-neutral-400" />
                          <span>{item.language}</span>
                        </span>
                      )}
                      {(item.nodeCount || item.graphData?.nodes?.length) > 0 && (
                        <span>{item.nodeCount || item.graphData?.nodes?.length} nodes</span>
                      )}
                      {item.timestamp && (
                        <span className="flex items-center gap-1 text-neutral-400/80">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatDate(item.timestamp)}</span>
                        </span>
                      )}
                    </div>

                    {/* Open Button */}
                    <button
                      onClick={() => openFromHistory(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-airforce-500 text-white hover:bg-airforce-600 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 text-center">
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
            Saved locally in browser storage
          </p>
        </div>
      </div>
    </div>
  );
}
