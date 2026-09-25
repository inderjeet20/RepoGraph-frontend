import React from 'react';
import { useStore } from '../../store/useStore';
import { X, Sparkles, GitCommit, MessageSquare, ArrowRight, CornerDownRight } from 'lucide-react';

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

  const handleExplain = async () => {
    const tabName = selectedNode.label;
    setActiveTab(tabName);

    const userPrompt = `Explain the role and architecture of ${selectedNode.label}.`;
    appendChatMessage(tabName, { role: 'user', content: userPrompt });

    setChatLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_name: repoName,
          message: userPrompt,
          node_context: selectedNode,
          all_nodes: graphData.nodes,
          all_edges: graphData.edges,
        }),
      });
      const data = await res.json();
      appendChatMessage(tabName, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        source_type: data.source_type || 'repo',
      });
    } catch (e) {
      appendChatMessage(tabName, {
        role: 'assistant',
        content: `Error retrieving explanation: ${e.message}`,
        sources: [],
        source_type: 'repo',
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleTraceFlow = async () => {
    const tabName = selectedNode.label;
    setActiveTab(tabName);

    const userPrompt = `Trace the execution flow for ${selectedNode.label}.`;
    appendChatMessage(tabName, { role: 'user', content: userPrompt });

    setChatLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_name: repoName,
          message: userPrompt,
          node_context: selectedNode,
          all_nodes: graphData.nodes,
          all_edges: graphData.edges,
        }),
      });
      const data = await res.json();

      if (data.highlighted_path && data.highlighted_path.length > 0) {
        setHighlightedPath(data.highlighted_path);
      } else {
        // Fallback trace path if empty
        const fallback = [graphData.nodes[0]?.id, selectedNode.id, graphData.nodes[graphData.nodes.length - 1]?.id].filter(Boolean);
        setHighlightedPath(fallback);
      }

      appendChatMessage(tabName, {
        role: 'assistant',
        content: data.answer || `Visual flow active: Tracing execution across ${data.highlighted_path?.length || 3} components. Non-relevant nodes are dimmed on the canvas.`,
        sources: data.sources || [],
        source_type: data.source_type || 'repo',
      });
    } catch (e) {
      // Fallback local trace
      setHighlightedPath([selectedNode.id]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAsk = () => {
    setActiveTab(selectedNode.label);
    const chatInput = document.getElementById('repograph-chat-input');
    if (chatInput) {
      chatInput.focus();
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-800 shadow-xl backdrop-blur-md p-4 transition-all animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
            {selectedNode.label}
          </h3>
          <span className="text-[11px] font-mono uppercase tracking-wider text-airforce-500">
            {selectedNode.type} / Module
          </span>
        </div>

        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-3.5 text-xs">
        {/* Description */}
        {selectedNode.description && (
          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {selectedNode.description}
          </p>
        )}

        {/* Files */}
        {selectedNode.files && selectedNode.files.length > 0 && (
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
              Files
            </span>
            <ul className="space-y-1 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
              {selectedNode.files.map((file, i) => (
                <li key={i} className="truncate flex items-center gap-1.5">
                  <span className="text-airforce-500">•</span>
                  <span>{file}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dependencies */}
        {selectedNode.dependencies && selectedNode.dependencies.length > 0 && (
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
              Dependencies
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedNode.dependencies.map((dep, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  → {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Used By */}
        {selectedNode.used_by && selectedNode.used_by.length > 0 && (
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
              Used by
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedNode.used_by.map((caller, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  ← {caller}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3 Buttons: Explain | Trace Flow | Ask */}
      <div className="mt-5 pt-3 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-3 gap-1.5">
        <button
          onClick={handleExplain}
          className="px-2.5 py-2 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-airforce-500" />
          <span>Explain</span>
        </button>

        <button
          onClick={handleTraceFlow}
          className="px-2.5 py-2 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <CornerDownRight className="w-3.5 h-3.5 text-airforce-500" />
          <span>Trace Flow</span>
        </button>

        <button
          onClick={handleAsk}
          className="px-2.5 py-2 rounded-lg text-xs font-medium bg-airforce-500 text-white hover:bg-airforce-600 transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
}
