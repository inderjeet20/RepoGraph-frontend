import React from 'react';
import { useStore } from '../../store/useStore';
import {
  X, Sparkles, CornerDownRight, MessageSquare,
  FileText, ArrowRight, ArrowLeft, Layers,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const TYPE_ACCENT = {
  frontend: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Frontend' },
  backend:  { color: '#4789b8', bg: 'rgba(71,137,184,0.1)', label: 'Backend' },
  service:  { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', label: 'Service' },
  database: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Database' },
  external: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', label: 'External' },
};

export default function NodePanel() {
  const {
    selectedNode,
    setSelectedNode,
    repoName,
    graphData,
    appendChatMessage,
    setChatLoading,
    setHighlightedPath,
    setActiveTab,
  } = useStore();

  if (!selectedNode) return null;

  const accent = TYPE_ACCENT[selectedNode.type] || TYPE_ACCENT.service;

  // ─── Handlers ─────────────────────────────────────────────

  const callChat = async (prompt, onHighlight) => {
    const tabName = selectedNode.label;
    setActiveTab(tabName);
    appendChatMessage(tabName, { role: 'user', content: prompt });
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_name: repoName,
          message: prompt,
          node_context: selectedNode,
          all_nodes: graphData.nodes,
          all_edges: graphData.edges,
        }),
      });
      const data = await res.json();
      if (onHighlight && data.highlighted_path?.length > 0) {
        onHighlight(data.highlighted_path);
      }
      appendChatMessage(tabName, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        source_type: data.source_type || 'repo',
      });
    } catch (e) {
      appendChatMessage(tabName, {
        role: 'assistant',
        content: `Error: ${e.message}`,
        sources: [],
        source_type: 'repo',
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleExplain = () =>
    callChat(`Explain the role and architecture of ${selectedNode.label}.`);

  const handleTraceFlow = () =>
    callChat(`Trace the execution flow for ${selectedNode.label}.`, (path) => {
      if (path?.length > 0) {
        setHighlightedPath(path);
      } else {
        const fallback = [
          graphData.nodes[0]?.id,
          selectedNode.id,
          graphData.nodes[graphData.nodes.length - 1]?.id,
        ].filter(Boolean);
        setHighlightedPath(fallback);
      }
    });

  const handleAsk = () => {
    setActiveTab(selectedNode.label);
    setTimeout(() => {
      document.getElementById('repograph-chat-input')?.focus();
    }, 100);
  };

  return (
    /* Slide-in panel anchored bottom-left of graph */
    <div
      className="absolute bottom-4 left-4 z-20 w-72 rounded-xl shadow-2xl
        bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800
        overflow-hidden animate-slideUp"
    >
      {/* Accent top bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent.color}, ${accent.color}60)` }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: accent.bg, color: accent.color }}
            >
              {accent.label}
            </span>
          </div>
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white leading-tight truncate">
            {selectedNode.label}
          </h3>
        </div>

        <button
          onClick={() => setSelectedNode(null)}
          className="shrink-0 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300
            hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mx-4" />

      {/* Body */}
      <div className="px-4 py-3 space-y-3 text-xs">
        {/* Description */}
        {selectedNode.description && (
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {selectedNode.description}
          </p>
        )}

        {/* Files */}
        {selectedNode.files?.length > 0 && (
          <div>
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              <FileText className="w-3 h-3" />
              Files
            </span>
            <ul className="space-y-1">
              {selectedNode.files.slice(0, 4).map((file, i) => (
                <li key={i} className="font-mono text-[10.5px] text-neutral-600 dark:text-neutral-300 truncate">
                  <span className="text-neutral-300 dark:text-neutral-600 mr-1.5">›</span>
                  {file}
                </li>
              ))}
              {selectedNode.files.length > 4 && (
                <li className="font-mono text-[10px] text-neutral-400">
                  +{selectedNode.files.length - 4} more files
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Deps + Used-by */}
        <div className="grid grid-cols-2 gap-2">
          {selectedNode.dependencies?.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                <ArrowRight className="w-3 h-3" />
                Depends on
              </span>
              <div className="space-y-1">
                {selectedNode.dependencies.slice(0, 3).map((dep, i) => (
                  <div
                    key={i}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800
                      text-neutral-600 dark:text-neutral-300 truncate"
                  >
                    {dep}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNode.used_by?.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                <ArrowLeft className="w-3 h-3" />
                Used by
              </span>
              <div className="space-y-1">
                {selectedNode.used_by.slice(0, 3).map((caller, i) => (
                  <div
                    key={i}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800
                      text-neutral-600 dark:text-neutral-300 truncate"
                  >
                    {caller}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 pt-1 grid grid-cols-3 gap-1.5">
        <button
          onClick={handleExplain}
          className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-[10.5px] font-medium
            bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300
            hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: accent.color }} />
          Explain
        </button>

        <button
          onClick={handleTraceFlow}
          className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-[10.5px] font-medium
            bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300
            hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          <CornerDownRight className="w-3.5 h-3.5" style={{ color: accent.color }} />
          Trace
        </button>

        <button
          onClick={handleAsk}
          className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-[10.5px] font-medium
            text-white transition-colors cursor-pointer shadow-sm"
          style={{ background: accent.color }}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Ask
        </button>
      </div>
    </div>
  );
}
