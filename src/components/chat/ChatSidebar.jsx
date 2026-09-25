import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import ChatMessage from './ChatMessage';
import { Send, X, Bot, Sparkles, MessageSquare } from 'lucide-react';

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

  const currentMessages = chatMessages[activeTab] || [];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isChatLoading]);

  // Find node object corresponding to activeTab if it's a node tab
  const activeNodeContext =
    activeTab !== 'General'
      ? graphData.nodes?.find((n) => n.label === activeTab) || selectedNode
      : null;

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = inputVal.trim();
    if (!query || isChatLoading) return;

    setInputVal('');
    appendChatMessage(activeTab, { role: 'user', content: query });

    setChatLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
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

      // If backend returned a highlighted path (e.g. for trace/how does X work)
      if (data.highlighted_path && data.highlighted_path.length > 0) {
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
        content: `Error: Unable to connect to backend service. (${err.message})`,
        sources: [],
        source_type: 'repo',
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Strictly filter tabs to current repo nodes only
  const validNodeLabels = new Set(graphData.nodes?.map((n) => n.label) || []);
  const visibleTabs = chatTabs.filter(
    (tab) => tab === 'General' || validNodeLabels.has(tab)
  );

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* 1. Top Tabs Bar (Filtered strictly to current repo's nodes) */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto bg-neutral-50 dark:bg-neutral-950/60 no-scrollbar">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-airforce-500 text-white shadow-sm font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <span>{tab}</span>
              {tab !== 'General' && (
                <button
                  onClick={(e) => closeTab(tab, e)}
                  className={`p-0.5 rounded transition-colors ml-0.5 ${
                    isActive
                      ? 'text-white/80 hover:text-white hover:bg-airforce-600'
                      : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Scoped Header & Context Indicator */}
      <div className="px-3.5 py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs bg-neutral-50/70 dark:bg-neutral-950/40">
        <div className="flex items-center gap-2 truncate">
          <MessageSquare className="w-4 h-4 text-airforce-500 shrink-0" />
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-neutral-900 dark:text-white truncate">
              {activeTab === 'General' ? 'Repository Assistant' : activeTab}
            </span>
            {activeNodeContext?.files?.[0] && (
              <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 truncate max-w-[130px]" title={activeNodeContext.files.join(', ')}>
                ({activeNodeContext.files[0]})
              </span>
            )}
          </div>
        </div>
        {activeNodeContext ? (
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-airforce-500/15 text-airforce-600 dark:text-airforce-400 font-semibold tracking-wide shrink-0">
            {activeNodeContext.type}
          </span>
        ) : (
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium shrink-0">
            General
          </span>
        )}
      </div>

      {/* 3. Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {currentMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
            <Bot className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-2" />
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {activeTab === 'General'
                ? 'Ask any architectural or implementation question.'
                : `What would you like to know about ${activeTab}?`}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-[220px]">
              Tap nodes on the graph to scope queries, or ask about execution flows.
            </p>
          </div>
        ) : (
          currentMessages.map((msg, i) => <ChatMessage key={i} message={msg} />)
        )}

        {isChatLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-airforce-500 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-airforce-500 animate-ping" />
            <span>Analyzing repository & verifying evidence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Bottom Input Box */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
        <form onSubmit={handleSend} className="relative">
          <textarea
            id="repograph-chat-input"
            rows="2"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeTab === 'General'
                ? 'Ask anything about this repo... (e.g. How does login work?)'
                : `Ask about ${activeTab}... (e.g. Why is JWT used here?)`
            }
            className="w-full pl-3 pr-10 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-airforce-500 transition-colors resize-none"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isChatLoading}
            className="absolute right-2 bottom-2.5 p-1.5 rounded-lg bg-airforce-500 text-white hover:bg-airforce-600 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
