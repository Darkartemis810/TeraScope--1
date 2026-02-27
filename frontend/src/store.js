import { create } from 'zustand';
import { MOCK_EVENTS, MOCK_ANALYSIS } from './mockData';

export const useStore = create((set) => ({
    // Core state — seed with mock events immediately so UI is never blank
    activeEventId: null,
    isAnalyzing: false,

    // Data caches
    events: MOCK_EVENTS,          // ← pre-seeded with realistic past events
    alerts: [],
    activeEventDetails: null,
    analysisData: null,
    wsConnected: false,

    // UI State
    timelineBaselinePassId: null,
    timelinePostPassId: null,
    sidebarFilter: 'ALL',
    isAlertPanelOpen: false,
    isChatOpen: false,

    // Actions
    setActiveEventId: (id) => {
        // Resolve event details from the already-loaded events list
        const eventDetails = MOCK_EVENTS.find(e => e.id === id) || null;
        set({ activeEventId: id, analysisData: null, activeEventDetails: eventDetails });
        if (id) {
            useStore.getState().fetchIntelligenceData(id);
        }
    },
    setAnalyzing: (status) => set({ isAnalyzing: status }),
    setEvents: (events) => set({ events }),
    setActiveEventDetails: (details) => set({ activeEventDetails: details }),
    setAnalysisData: (data) => set({ analysisData: data }),
    setTimelinePasses: (baseline, post) => set({ timelineBaselinePassId: baseline, timelinePostPassId: post }),
    setSidebarFilter: (filter) => set({ sidebarFilter: filter }),
    toggleAlertPanel: () => set((state) => ({ isAlertPanelOpen: !state.isAlertPanelOpen })),
    toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

    // WebSocket Client — merges live events ON TOP of mock seed
    connectWebSocket: () => {
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/ws';
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket Connected");
            set({ wsConnected: true });
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.type === 'events_update') {
                    const liveEvents = payload.data.features || payload.data;
                    // Merge: live events first, then mock events not already in live feed
                    const liveIds = new Set(liveEvents.map(e => e.id));
                    const merged = [...liveEvents, ...MOCK_EVENTS.filter(e => !liveIds.has(e.id))];
                    set({ events: merged });
                } else if (payload.type === 'alerts_update') {
                    set({ alerts: payload.data });
                }
            } catch (err) {
                console.error("Failed to parse WS message", err);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket Disconnected. Reconnecting in 5s...");
            set({ wsConnected: false });
            setTimeout(() => {
                useStore.getState().connectWebSocket();
            }, 5000);
        };

        ws.onerror = (err) => {
            console.error("WebSocket Error:", err);
            ws.close();
        };
    },

    // REST API Actions — falls back to mock analysis when API is unavailable
    fetchIntelligenceData: async (eventId) => {
        // Always show mock data immediately while (possibly) fetching real data
        const mockFallback = MOCK_ANALYSIS[eventId];
        if (mockFallback) {
            set({ analysisData: mockFallback });
        }

        try {
            const url = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const analysesRes = await fetch(`${url}/satellite/analyses/${eventId}`, { signal: AbortSignal.timeout(4000) });
            if (!analysesRes.ok) throw new Error('API unavailable');
            const analyses = await analysesRes.json();

            if (!analyses || analyses.length === 0) return; // keep mock data

            const latestAnalysis = analyses[0];

            const [intelRes, bldRes] = await Promise.all([
                fetch(`${url}/intelligence/${latestAnalysis.id}`),
                fetch(`${url}/intelligence/buildings/${eventId}`),
            ]);

            const intelData = await intelRes.json();
            const buildings = await bldRes.json();

            set({
                analysisData: {
                    ...intelData,
                    buildings_geojson: buildings
                }
            });

        } catch (err) {
            // API unreachable — mock data is already set above, nothing to do
            console.info(`[TeraScope] Backend offline — using mock analysis for ${eventId}`);
        }
    }
}));
