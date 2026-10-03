import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import ChatMessage from './ChatMessage';
import { Send, X, Bot, MessageSquare, Zap } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

// Suggested starter prompts shown when a chat is empty
const SUGGESTED_PROMPTS_GENERAL = [
  'How does this repo work overall?',
  'What is the architecture flow?',
  'What tech stack is used?',
];
const getSuggestedPrompts = (tabName) => [
  `Explain the role of ${tabName}`,
  `What files does ${tabName} use?`,
  `Trace the execution flow for ${tabName}`,
];

export default function ChatSidebar() {
  const {
    repoName,
    chatTabs,
    activeTab,
    setActiveTab,
    closeTab,
    chatMessages,
    appendChatMessage,
    isChatLoading,
    setChatLoading,
    selectedNode,
    graphData,
    setHighlightedPath,
  } = useStore();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentMessages = chatMessages[activeTab] || [];
  const isEmpty = currentMessages.length === 0;

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isChatLoading]);

  // Resolve node context for the active tab
  const activeNodeContext =
    activeTab !== 'General'
      ? graphData.nodes?.find((n) => n.label === activeTab) || selectedNode
      : null;

  // Filter tabs to only valid node labels + General
  const validNodeLabels = new Set(graphData.nodes?.map((n) => n.label) || []);
  const visibleTabs = chatTabs.filter((t) => t === 'General' || validNodeLabels.has(t));

  // ─── Send handler ─────────────────────────────────────────
  const handleSend = useCallback(async (promptOverride) => {
    const query = (promptOverride || inputVal).trim();
    if (!query || isChatLoading) return;

    setInputVal('');
    appendChatMessage(activeTab, { role: 'user', content: query });

    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_name: repoName,
          message: query,
          node_context: activeNodeContext,
          all_nodes: graphData.nodes,
          all_edges: graphData.edges,
        }),
      });
      const data = await res.json();

      if (data.highlighted_path?.length > 0) {
        setHighlightedPath(data.highlighted_path);
      }

      appendChatMessage(activeTab, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        source_type: data.source_type || 'repo',
      });
    } catch (err) {
      appendChatMessage(activeTab, {
        role: 'assistant',
        content: `⚠️ Connection error: ${err.message}`,
        sources: [],
        source_type: 'repo',
      });
    } finally {
      setChatLoading(false);
    }
  }, [inputVal, isChatLoading, activeTab, activeNodeContext, repoName, graphData]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts =
    activeTab === 'General' ? SUGGESTED_PROMPTS_GENERAL : getSuggestedPrompts(activeTab);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-neutral-900 transition-colors">

      {/* ── Tab bar ─────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-100 dark:border-neutral-800
        bg-neutral-50/80 dark:bg-neutral-950/60 overflow-x-auto shrink-0 no-scrollbar">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium
                cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-airforce-500 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
              }`}
            >
              {tab}
              {tab !== 'General' && (
                <span
                  onClick={(e) => { e.stopPropagation(); closeTab(tab, e); }}
                  className={`p-0.5 rounded transition-colors ${
                    isActive
                      ? 'text-white/70 hover:text-white hover:bg-airforce-600'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <X className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Context header ──────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100 dark:border-neutral-800
        text-[11px] bg-neutral-50/40 dark:bg-neutral-950/30 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <MessageSquare className="w-3.5 h-3.5 text-airforce-500 shrink-0" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {activeTab === 'General' ? 'Repository Chat' : activeTab}
          </span>
          {activeNodeContext?.files?.[0] && (
            <span
              className="text-[9.5px] font-mono text-neutral-400 dark:text-neutral-500 truncate max-w-[100px]"
              title={activeNodeContext.files.join(', ')}
            >
              · {activeNodeContext.files[0].split('/').pop()}
            </span>
          )}
        </div>

        {activeNodeContext ? (
          <span className="shrink-0 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full
            bg-airforce-500/12 text-airforce-600 dark:text-airforce-400 font-semibold">
            {activeNodeContext.type}
          </span>
        ) : (
          <span className="shrink-0 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full
            bg-neutral-200/70 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500">
            General
          </span>
        )}
      </div>

      {/* ── Message list ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isEmpty ? (
          /* Empty state */
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-airforce-500/10 border border-airforce-500/20
              flex items-center justify-center mb-3">
              <Bot className="w-5 h-5 text-airforce-500" />
            </div>
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
              {activeTab === 'General' ? 'Ask about this repository' : `Ask about ${activeTab}`}
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-4 max-w-[200px]">
              {activeTab === 'General'
                ? 'Ask architecture, code, or flow questions'
                : 'Scoped to this component\'s files & context'}
            </p>

            {/* Suggested prompts */}
            <div className="flex flex-col gap-1.5 w-full max-w-[240px]">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-left
                    bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700
                    text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer
                    border border-neutral-200/50 dark:border-neutral-700/50"
                >
                  <Zap className="w-3 h-3 text-airforce-500 shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          currentMessages.map((msg, i) => <ChatMessage key={i} message={msg} />)
        )}

        {/* Typing indicator */}
        {isChatLoading && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl
            bg-neutral-100 dark:bg-neutral-800 w-fit max-w-[200px]">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-airforce-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-[10.5px] font-mono text-neutral-400">Analyzing…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ──────────────────────────────────── */}
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-neutral-100 dark:border-neutral-800
        bg-neutral-50/50 dark:bg-neutral-950/30">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-end gap-2"
        >
          <textarea
            id="repograph-chat-input"
            ref={inputRef}
            rows={2}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeTab === 'General'
                ? 'Ask anything about this repo…'
                : `Ask about ${activeTab}…`
            }
            className="flex-1 px-3 py-2 text-[12px] rounded-xl resize-none
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-700
              text-neutral-900 dark:text-neutral-100
              placeholder:text-neutral-400 dark:placeholder:text-neutral-600
              focus:outline-none focus:border-airforce-500 dark:focus:border-airforce-500
              transition-colors leading-relaxed"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isChatLoading}
            className="shrink-0 p-2.5 rounded-xl bg-airforce-500 text-white
              hover:bg-airforce-600 disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
