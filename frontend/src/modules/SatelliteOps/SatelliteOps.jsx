import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store';
import { MOCK_EVENTS, MOCK_PASSES } from '../../mockData';
import {
    Satellite, Calendar, Cloud, MapPin, AlertTriangle,
    Layers, ChevronRight, ScanLine
} from 'lucide-react';

// ── Event type label helpers ──────────────────────────────────────────
const TYPE_LABEL = { EQ: 'Earthquake', FL: 'Flooding', WF: 'Wildfire', TC: 'Tropical Cyclone', VO: 'Volcanic' };
const TYPE_COLOR = { EQ: 'text-orange-400', FL: 'text-blue-400', WF: 'text-red-400', TC: 'text-purple-400', VO: 'text-yellow-400' };

// ── Inline event picker ───────────────────────────────────────────────
const EventPicker = ({ onSelect }) => (
    <div className="min-h-screen pt-28 pb-8 px-4 md:px-10 max-w-[1400px] mx-auto animate-fade-in">
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <ScanLine className="w-5 h-5 text-plasma" />
                <span className="font-mono text-xs text-plasma uppercase tracking-widest">Satellite Operations</span>
            </div>
            <h1 className="text-3xl font-sora font-semibold text-ghost">Select a Disaster Event</h1>
            <p className="text-gray-400 font-mono text-sm mt-1">
                Choose an event below to load its pre/post satellite imagery comparison.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MOCK_EVENTS.map(ev => {
                const passes = MOCK_PASSES[ev.id] || [];
                const post = passes.find(p => p.is_event_pass);
                return (
                    <button
                        key={ev.id}
                        onClick={() => onSelect(ev)}
                        className="group text-left rounded-2xl overflow-hidden border border-gray-800 hover:border-plasma/50 bg-graphite transition-all duration-200 hover:shadow-glow hover:-translate-y-0.5"
                    >
                        <div className="relative h-36 overflow-hidden">
                            <img
                                src={post?.thumbnail_url || 'https://images.unsplash.com/photo-1590483864700-1cffa7bfcaaa?w=600&q=70'}
                                alt={ev.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/20 to-transparent" />
                            <span className={`absolute top-3 left-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-void/70 border border-gray-700 ${TYPE_COLOR[ev.event_type]}`}>
                                {TYPE_LABEL[ev.event_type] || ev.event_type}
                            </span>
                            <span className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                ev.severity === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            }`}>
                                {ev.severity.toUpperCase()}
                            </span>
                        </div>
                        <div className="p-4">
                            <div className="font-sora text-sm font-semibold text-ghost mb-1 leading-snug">{ev.title}</div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="font-mono text-[10px] text-gray-500">
                                    {new Date(ev.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="font-mono text-[10px] text-plasma flex items-center gap-0.5">
                                    VIEW <ChevronRight className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    </div>
);

// ── Main satellite viewer ─────────────────────────────────────────────
const SatelliteOps = () => {
    const { activeEventId, activeEventDetails, setActiveEventId } = useStore();
    const [passes, setPasses] = useState([]);
    const [selectedBaseline, setSelectedBaseline] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [sliderPosition, setSliderPosition] = useState(50);
    const dragging = useRef(false);
    const viewerRef = useRef(null);

    // Load mock passes immediately; try live backend silently in bg
    useEffect(() => {
        if (!activeEventId) return;
        const mockPasses = MOCK_PASSES[activeEventId] || [];
        setPasses(mockPasses);
        setSelectedBaseline(mockPasses.find(p => p.is_baseline) || null);
        setSelectedPost(mockPasses.find(p => p.is_event_pass) || null);
        setSliderPosition(50);

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const ctrl = new AbortController();
        fetch(`${apiUrl}/satellite/passes/${activeEventId}`, { signal: ctrl.signal })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data || !Array.isArray(data) || data.length === 0) return;
                setPasses(data);
                setSelectedBaseline(data.find(p => p.is_baseline) || null);
                setSelectedPost(data.find(p => p.is_event_pass) || null);
            })
            .catch(() => {});
        return () => ctrl.abort();
    }, [activeEventId]);

    const handleMouseMove = (e) => {
        if (!dragging.current || !viewerRef.current) return;
        const rect = viewerRef.current.getBoundingClientRect();
        setSliderPosition(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    };
    const handleTouchMove = (e) => {
        if (!viewerRef.current) return;
        const rect = viewerRef.current.getBoundingClientRect();
        setSliderPosition(Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100)));
    };

    // No event → inline picker
    if (!activeEventId || !activeEventDetails) {
        return <EventPicker onSelect={ev => setActiveEventId(ev.id)} />;
    }

    const event = activeEventDetails;

    return (
        <div
            className="min-h-screen pt-24 pb-6 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1920px] mx-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={() => { dragging.current = false; }}
            onMouseLeave={() => { dragging.current = false; }}
        >
            {/* ── Sidebar ───────────────────────────────────────────── */}
            <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-graphite rounded-3xl border border-gray-800 p-6">
                    <h3 className="font-sora font-semibold text-base text-ghost mb-4 flex items-center gap-2">
                        <Satellite className="w-4 h-4 text-plasma" />
                        Event Metadata
                    </h3>
                    <div className="space-y-3">
                        <div className="bg-void/50 rounded-xl p-4">
                            <div className="text-[10px] font-mono text-gray-500 mb-1">EVENT</div>
                            <div className="text-sm font-sora text-ghost leading-snug">{event.title}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-void/50 rounded-xl p-3">
                                <div className="text-[10px] font-mono text-gray-500 mb-1">LAT</div>
                                <div className="text-sm font-mono text-plasma">{event.lat?.toFixed(3)}</div>
                            </div>
                            <div className="bg-void/50 rounded-xl p-3">
                                <div className="text-[10px] font-mono text-gray-500 mb-1">LON</div>
                                <div className="text-sm font-mono text-plasma">{event.lon?.toFixed(3)}</div>
                            </div>
                        </div>
                        <div className="bg-void/50 rounded-xl p-3 flex items-center gap-3">
                            <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${event.severity === 'red' ? 'text-red-400' : 'text-orange-400'}`} />
                            <div>
                                <div className="text-[10px] font-mono text-gray-500">SEVERITY</div>
                                <div className="text-sm font-sora text-ghost uppercase">{event.severity}</div>
                            </div>
                        </div>
                        <div className="bg-void/50 rounded-xl p-3 flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                                <div className="text-[10px] font-mono text-gray-500">LOCATION</div>
                                <div className="text-sm font-sora text-ghost">{event.country || 'Unknown'}</div>
                            </div>
                        </div>
                        <div className="bg-void/50 rounded-xl p-3 flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                                <div className="text-[10px] font-mono text-gray-500">EVENT DATE</div>
                                <div className="text-sm font-mono text-ghost">
                                    {event.event_date ? new Date(event.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveEventId(null)}
                        className="mt-4 w-full text-[10px] font-mono text-gray-500 hover:text-plasma border border-gray-800 hover:border-plasma/30 rounded-xl py-2 transition-colors"
                    >
                        ← SWITCH EVENT
                    </button>
                </div>

                {/* Pass selectors */}
                <div className="bg-graphite rounded-3xl border border-gray-800 p-6">
                    <h3 className="font-sora font-semibold text-sm text-ghost mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-plasma" />
                        Compare Passes
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-mono text-gray-500 mb-2 block">PRE-EVENT (BASELINE)</label>
                            <select
                                value={selectedBaseline?.id || ''}
                                onChange={e => setSelectedBaseline(passes.find(p => p.id === e.target.value) || null)}
                                className="w-full bg-void border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-ghost focus:border-plasma outline-none"
                            >
                                <option value="">Select baseline…</option>
                                {passes.filter(p => p.is_baseline).map(p => (
                                    <option key={p.id} value={p.id}>{new Date(p.pass_date).toLocaleDateString()} — {p.sensor}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-mono text-gray-500 mb-2 block">POST-EVENT</label>
                            <select
                                value={selectedPost?.id || ''}
                                onChange={e => setSelectedPost(passes.find(p => p.id === e.target.value) || null)}
                                className="w-full bg-void border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-ghost focus:border-plasma outline-none"
                            >
                                <option value="">Select post-event…</option>
                                {passes.filter(p => p.is_event_pass).map(p => (
                                    <option key={p.id} value={p.id}>
                                        {new Date(p.pass_date).toLocaleDateString()} — {p.sensor}
                                        {p.cloud_cover_pct ? ` (${p.cloud_cover_pct}% cloud)` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Cloud cover */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-graphite rounded-2xl border border-gray-800 p-4 flex flex-col items-center gap-1">
                        <Cloud className="w-5 h-5 text-gray-500 mb-1" />
                        <div className="text-[10px] font-mono text-gray-500 text-center">BASELINE CLOUD</div>
                        <div className="text-lg font-mono text-ghost">{selectedBaseline?.cloud_cover_pct ?? '—'}%</div>
                    </div>
                    <div className="bg-graphite rounded-2xl border border-gray-800 p-4 flex flex-col items-center gap-1">
                        <Cloud className="w-5 h-5 text-plasma mb-1" />
                        <div className="text-[10px] font-mono text-plasma text-center">POST CLOUD</div>
                        <div className="text-lg font-mono text-ghost">{selectedPost?.cloud_cover_pct ?? '—'}%</div>
                    </div>
                </div>
            </div>

            {/* ── Main viewer ───────────────────────────────────────── */}
            <div className="lg:col-span-3 flex flex-col gap-4">
                {/* Slider viewport */}
                <div
                    ref={viewerRef}
                    className="relative flex-1 min-h-[500px] rounded-3xl overflow-hidden border border-gray-800 bg-void select-none cursor-col-resize"
                    onMouseDown={() => { dragging.current = true; }}
                    onTouchMove={handleTouchMove}
                >
                    {/* BEFORE */}
                    <div className="absolute inset-0">
                        <img
                            src={selectedBaseline?.thumbnail_url || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80'}
                            alt="Pre-event baseline"
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute top-4 left-4 bg-void/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-700 z-10">
                            <span className="text-xs font-mono text-gray-400">BASELINE</span>
                        </div>
                    </div>

                    {/* AFTER (clipped) */}
                    <div
                        className="absolute inset-0 overflow-hidden pointer-events-none"
                        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    >
                        <img
                            src={selectedPost?.thumbnail_url || 'https://images.unsplash.com/photo-1590483864700-1cffa7bfcaaa?w=1400&q=80'}
                            alt="Post-event"
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute top-4 right-4 bg-void/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-plasma/50 z-10">
                            <span className="text-xs font-mono text-plasma">POST-EVENT</span>
                        </div>
                    </div>

                    {/* Handle */}
                    <div
                        className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none"
                        style={{ left: `calc(${sliderPosition}% - 1px)` }}
                    >
                        <div className="w-0.5 h-full bg-plasma/80" />
                        <div className="absolute w-10 h-10 bg-plasma rounded-full flex items-center justify-center shadow-glow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M18 8L22 12L18 16" /><path d="M6 8L2 12L6 16" />
                            </svg>
                        </div>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-void/80 backdrop-blur-md border border-gray-700 px-6 py-3 rounded-2xl flex items-center gap-6 whitespace-nowrap">
                        <div className="text-center">
                            <div className="text-[10px] font-mono text-gray-500">BASELINE</div>
                            <div className="text-xs font-mono text-ghost">
                                {selectedBaseline ? new Date(selectedBaseline.pass_date).toLocaleDateString() : 'Not selected'}
                            </div>
                        </div>
                        <div className="w-px h-6 bg-gray-700" />
                        <div className="text-center">
                            <div className="text-[10px] font-mono text-plasma">POST-EVENT</div>
                            <div className="text-xs font-mono text-ghost">
                                {selectedPost ? new Date(selectedPost.pass_date).toLocaleDateString() : 'Not selected'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pass strip */}
                <div className="bg-graphite rounded-2xl border border-gray-800 p-4">
                    <div className="text-[10px] font-mono text-gray-500 mb-3 uppercase tracking-widest">Pass Archive</div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {passes.map(pass => {
                            const isSel = selectedBaseline?.id === pass.id || selectedPost?.id === pass.id;
                            return (
                                <button
                                    key={pass.id}
                                    onClick={() => pass.is_baseline ? setSelectedBaseline(pass) : setSelectedPost(pass)}
                                    className={`relative min-w-[160px] h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${isSel ? 'ring-2 ring-plasma ring-offset-2 ring-offset-graphite' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={pass.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-void/90 to-transparent" />
                                    <div className="absolute bottom-2 left-2 text-left">
                                        <div className={`text-[9px] font-mono font-bold mb-0.5 ${pass.is_baseline ? 'text-gray-400' : 'text-plasma'}`}>
                                            {pass.is_baseline ? 'PRE-EVENT' : 'POST-EVENT'}
                                        </div>
                                        <div className="text-[10px] font-sora text-white font-semibold">
                                            {new Date(pass.pass_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </div>
                                    </div>
                                    {isSel && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-plasma animate-pulse" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SatelliteOps;
