import { create } from 'zustand';

// Safe localStorage helper
const getStoredTabs = () => {
  try {
    const saved = localStorage.getItem('repograph_chat_tabs');
    return saved ? JSON.parse(saved) : ['General'];
  } catch {
    return ['General'];
  }
};

const saveStoredTabs = (tabs) => {
  try {
    localStorage.setItem('repograph_chat_tabs', JSON.stringify(tabs));
  } catch (e) {
    console.error('Failed to save tabs to localStorage', e);
  }
};

export const useStore = create((set, get) => ({
  // App flow state
  repoUrl: '',
  repoName: '',
  status: 'idle', // 'idle' | 'analyzing' | 'ready' | 'error'
  statusMessage: '',
  error: '',

  // Graph state
  graphData: { nodes: [], edges: [] },
  selectedNode: null,
  highlightedPath: [],
  focusMode: false,

  // Chat state
  chatTabs: getStoredTabs(),
  activeTab: 'General',
  chatMessages: {}, // { [tabName]: [{ role, content, sources, source_type }] }
  isChatLoading: false,

  // Actions
  setRepoUrl: (url) => set({ repoUrl: url }),
  setStatus: (status, message = '') => set({ status, statusMessage: message }),
  setError: (err) => set({ error: err, status: 'error' }),
  
  setGraphData: (data, repoName) => {
    set({
      graphData: data,
      repoName: repoName,
      status: 'ready',
      selectedNode: null,
      highlightedPath: [],
      focusMode: false,
    });
  },

  setSelectedNode: (node) => {
    if (!node) {
      set({ selectedNode: null });
      return;
    }
    
    // Add tab if not already present
    const { chatTabs } = get();
    const tabName = node.label;
    let newTabs = chatTabs;
    if (!chatTabs.includes(tabName)) {
      newTabs = [...chatTabs, tabName];
      saveStoredTabs(newTabs);
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

  setActiveTab: (tab) => set({ activeTab: tab }),

  closeTab: (tabToClose, e) => {
    if (e) e.stopPropagation();
    if (tabToClose === 'General') return; // Cannot close general
    
    const { chatTabs, activeTab } = get();
    const newTabs = chatTabs.filter((t) => t !== tabToClose);
    saveStoredTabs(newTabs);
    
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
      repoUrl: '',
      repoName: '',
      selectedNode: null,
      highlightedPath: [],
      focusMode: false,
      error: '',
    });
  },
}));
