import { create } from 'zustand';

// Safe localStorage helpers scoped by repository
const getStoredTabs = (repoName = '') => {
  if (!repoName) return ['General'];
  try {
    const saved = localStorage.getItem(`repograph_tabs_${repoName}`);
    return saved ? JSON.parse(saved) : ['General'];
  } catch {
    return ['General'];
  }
};

const saveStoredTabs = (tabs, repoName = '') => {
  if (!repoName) return;
  try {
    localStorage.setItem(`repograph_tabs_${repoName}`, JSON.stringify(tabs));
  } catch (e) {
    console.error('Failed to save tabs to localStorage', e);
  }
};

const sanitizeHistoryItem = (item) => {
  if (!item || typeof item !== 'object') return null;
  const repoName = item.repoName || item.repo_name || item.name || 'repository';
  return {
    ...item,
    id: item.id || repoName,
    repoName,
    repoUrl: item.repoUrl || item.url || '',
    description: typeof item.description === 'string' ? item.description : '',
    stars: typeof item.stars === 'number' ? item.stars : 0,
    language: typeof item.language === 'string' ? item.language : 'Unknown',
    nodeCount: typeof item.nodeCount === 'number' ? item.nodeCount : (item.graphData?.nodes?.length || item.nodes?.length || 0),
    timestamp: item.timestamp || new Date().toISOString(),
    graphData: item.graphData || (item.nodes ? { nodes: item.nodes, edges: item.edges || [] } : null),
  };
};

const getStoredHistory = () => {
  try {
    const saved = localStorage.getItem('repograph_history');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeHistoryItem).filter(Boolean);
  } catch {
    return [];
  }
};

const saveStoredHistory = (history) => {
  try {
    localStorage.setItem('repograph_history', JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
};

export const useStore = create((set, get) => ({
  // App flow state
  repoUrl: '',
  repoName: '',
  status: 'idle', // 'idle' | 'analyzing' | 'ready' | 'error'
  statusMessage: '',
  error: '',
  currentView: 'landing', // 'landing' | 'history' | 'workspace'

  // History state
  history: getStoredHistory(),
  isHistoryOpen: false,

  // Graph state
  graphData: { nodes: [], edges: [] },
  selectedNode: null,
  highlightedPath: [],
  focusMode: false,

  // Chat state
  chatTabs: ['General'],
  activeTab: 'General',
  chatMessages: {}, // { [tabName]: [{ role, content, sources, source_type }] }
  isChatLoading: false,

  // Actions
  setRepoUrl: (url) => set({ repoUrl: url }),
  setStatus: (status, message = '') => set({ status, statusMessage: message }),
  setError: (err) => set({ error: err, status: 'error' }),
  setHistoryOpen: (isOpen) => set({ isHistoryOpen: isOpen }),
  navigateTo: (view) => set({ currentView: view }),

  setGraphData: (data, repoName, inputUrl = '') => {
    const cleanRepoName = repoName || data.repo_name || 'repository';
    const cleanUrl = inputUrl || get().repoUrl;
    const { history } = get();

    // Create history item
    const newEntry = {
      id: cleanRepoName,
      repoName: cleanRepoName,
      repoUrl: cleanUrl,
      description: data.description || '',
      stars: data.stars || 0,
      language: data.language || 'Unknown',
      nodeCount: data.nodes?.length || 0,
      timestamp: new Date().toISOString(),
      graphData: data,
    };

    const updatedHistory = [
      newEntry,
      ...history.filter((h) => h.repoName !== cleanRepoName),
    ].slice(0, 25);

    saveStoredHistory(updatedHistory);

    // Strictly isolate tabs to only nodes belonging to THIS repository
    const validNodeLabels = new Set(data.nodes?.map((n) => n.label) || []);
    const storedTabsForRepo = getStoredTabs(cleanRepoName);
    const filteredTabs = storedTabsForRepo.filter(
      (t) => t === 'General' || validNodeLabels.has(t)
    );
    const finalTabs = filteredTabs.length > 0 ? filteredTabs : ['General'];

    set({
      graphData: data,
      repoName: cleanRepoName,
      history: updatedHistory,
      chatTabs: finalTabs,
      activeTab: 'General',
      status: 'ready',
      currentView: 'workspace',
      selectedNode: null,
      highlightedPath: [],
      focusMode: false,
    });
  },

  openFromHistory: (item) => {
    if (!item) return;
    const cleanItem = sanitizeHistoryItem(item);
    if (!cleanItem || !cleanItem.graphData) return;

    const validNodeLabels = new Set(cleanItem.graphData.nodes?.map((n) => n.label) || []);
    const storedTabsForRepo = getStoredTabs(cleanItem.repoName);
    const filteredTabs = storedTabsForRepo.filter(
      (t) => t === 'General' || validNodeLabels.has(t)
    );
    const finalTabs = filteredTabs.length > 0 ? filteredTabs : ['General'];

    set({
      graphData: cleanItem.graphData,
      repoName: cleanItem.repoName,
      repoUrl: cleanItem.repoUrl || '',
      chatTabs: finalTabs,
      activeTab: 'General',
      status: 'ready',
      currentView: 'workspace',
      selectedNode: null,
      highlightedPath: [],
      focusMode: false,
      isHistoryOpen: false,
    });
  },

  removeFromHistory: (repoName) => {
    const { history } = get();
    const updated = (history || []).filter(
      (h) => h && h.repoName !== repoName && h.repo_name !== repoName
    );
    saveStoredHistory(updated);
    set({ history: updated });
  },

  clearHistory: () => {
    saveStoredHistory([]);
    set({ history: [] });
  },

  setSelectedNode: (node) => {
    if (!node) {
      set({ selectedNode: null });
      return;
    }

    const { chatTabs, repoName, graphData } = get();
    // Validate that node belongs to current active repository
    const isValid = graphData.nodes?.some((n) => n.id === node.id || n.label === node.label);
    if (!isValid) return;

    const tabName = node.label;
    let newTabs = chatTabs;
    if (!chatTabs.includes(tabName)) {
      newTabs = [...chatTabs, tabName];
      saveStoredTabs(newTabs, repoName);
    }

    set({
      selectedNode: node,
      chatTabs: newTabs,
      activeTab: tabName,
    });
  },

  setHighlightedPath: (path) => {
    set({
      highlightedPath: path,
      focusMode: path && path.length > 0,
    });
  },

  clearFocus: () => {
    set({
      highlightedPath: [],
      focusMode: false,
    });
  },

  setActiveTab: (tab) => {
    const { graphData } = get();
    if (tab === 'General') {
      set({ activeTab: 'General', selectedNode: null });
    } else {
      const matchingNode = graphData.nodes?.find((n) => n.label === tab) || null;
      set({ activeTab: tab, selectedNode: matchingNode });
    }
  },

  closeTab: (tabToClose, e) => {
    if (e) e.stopPropagation();
    if (tabToClose === 'General') return; // Cannot close general

    const { chatTabs, activeTab, repoName } = get();
    const newTabs = chatTabs.filter((t) => t !== tabToClose);
    saveStoredTabs(newTabs, repoName);

    set({
      chatTabs: newTabs,
      activeTab: activeTab === tabToClose ? 'General' : activeTab,
    });
  },

  appendChatMessage: (tabName, message) => {
    const { chatMessages } = get();
    const current = chatMessages[tabName] || [];
    set({
      chatMessages: {
        ...chatMessages,
        [tabName]: [...current, message],
      },
    });
  },

  setChatLoading: (loading) => set({ isChatLoading: loading }),

  resetToLanding: () => {
    set({
      status: 'idle',
      currentView: 'landing',
      repoUrl: '',
      repoName: '',
      selectedNode: null,
      highlightedPath: [],
      focusMode: false,
      error: '',
    });
  },
}));
