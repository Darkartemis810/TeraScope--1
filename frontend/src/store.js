import { create } from 'zustand';

export const useStore = create((set) => ({
    // Core state
    activeEventId: null,
    isAnalyzing: false,

    // Data caches
    events: [],
    activeEventDetails: null,
    analysisData: null,

    // UI State
    timelineBaselinePassId: null,
    timelinePostPassId: null,
    sidebarFilter: 'ALL',
    isAlertPanelOpen: false,
    isChatOpen: false,

    // Actions
    setActiveEventId: (id) => set({ activeEventId: id }),
    setAnalyzing: (status) => set({ isAnalyzing: status }),
    setEvents: (events) => set({ events }),
    setActiveEventDetails: (details) => set({ activeEventDetails: details }),
    setAnalysisData: (data) => set({ analysisData: data }),
    setTimelinePasses: (baseline, post) => set({ timelineBaselinePassId: baseline, timelinePostPassId: post }),
    setSidebarFilter: (filter) => set({ sidebarFilter: filter }),
    toggleAlertPanel: () => set((state) => ({ isAlertPanelOpen: !state.isAlertPanelOpen })),
    toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}));
