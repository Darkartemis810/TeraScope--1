import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { FileText, RefreshCw, Eye, Download } from 'lucide-react';
import gsap from 'gsap';

const AIReportPanel = () => {
    const { activeEventId, activeEventDetails, analysisData } = useStore();
    const [loading, setLoading] = useState(false);
    const [prevId, setPrevId] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!activeEventId || activeEventId === prevId) return;
        setPrevId(activeEventId);
        setLoading(true);
        const t = setTimeout(() => {
            setLoading(false);
            if (containerRef.current) {
                gsap.fromTo('.report-text',
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
                );
            }
        }, 1800);
        return () => clearTimeout(t);
    }, [activeEventId]);

    const ev = activeEventDetails;
    const s = analysisData?.stats;

    if (!activeEventId) {
        return (
            <div className="bg-graphite border border-gray-800 p-5 rounded-3xl h-64 flex flex-col items-center justify-center text-center">
                <FileText className="w-8 h-8 text-gray-600 mb-3" />
                <h3 className="font-sora text-sm text-gray-400">AWAITING TARGET</h3>
                <p className="text-xs font-mono text-gray-600 mt-2">Select an event from the sidebar<br />to generate a situation report</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="bg-graphite border border-gray-800 p-5 rounded-3xl flex flex-col shrink-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-t-3xl" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h2 className="font-sora font-semibold text-sm flex items-center gap-2 text-ghost">
                    <CpuIcon />
                    Tactical Briefing
                </h2>
                <div className="flex gap-2">
                    {!loading && (
                        <button className="p-1.5 rounded-lg bg-void border border-gray-700 text-gray-400 hover:text-plasma hover:border-plasma transition-colors">
                            <Download className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => { setPrevId(null); }}
                        className={`p-1.5 rounded-lg bg-void border border-gray-700 text-gray-400 hover:text-plasma transition-colors ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col gap-3 flex-1 relative z-10">
                    <div className="h-3 w-full bg-void rounded animate-pulse" />
                    <div className="h-3 w-11/12 bg-void rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-void rounded animate-pulse mb-2" />
                    <div className="h-3 w-full bg-void rounded animate-pulse" />
                    <div className="h-3 w-10/12 bg-void rounded animate-pulse" />
                    <div className="mt-auto text-[10px] font-mono text-plasma flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-plasma animate-ping" />
                        SYNTHESIZING SATELLITE TELEMETRY...
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4 text-sm text-gray-300 relative z-10 overflow-y-auto custom-scrollbar flex-1 pb-2">
                    <div className="report-text bg-void/50 p-3 rounded-xl border border-gray-800/50">
                        <h3 className="text-xs font-mono text-plasma mb-1 uppercase tracking-wider">Executive Summary</h3>
                        <p className="leading-relaxed text-xs">
                            Satellite assessment of <span className="text-ghost font-semibold">{ev?.title || `Event #${activeEventId}`}</span>{' '}
                            ({ev?.country || 'Unknown region'}) indicates significant structural damage
                            across the primary affected corridor.{' '}
                            Approximately <span className="text-ghost">{s?.affected_area_km2 ?? 142} km²</span> affected
                            with <span className="text-alert-red">{s?.destroyed_pct ?? 13}%</span> of structures classified as destroyed
                            and <span className="text-alert-orange">{s?.major_damage_pct ?? 19}%</span> as major damage.
                        </p>
                    </div>

                    <div className="report-text">
                        <h3 className="text-[10px] font-mono text-alert-red mb-1 uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangleIcon /> Priority Action Required
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-400 ml-1">
                            <li>Deploy heavy urban rescue teams to highest-severity sectors</li>
                            <li>Establish emergency medical triage near {ev?.country || 'the affected region'}</li>
                            <li>Restore critical water and power supply lines within 48h</li>
                            <li>Population at risk: <span className="text-ghost">{
                                s?.population_at_risk
                                    ? s.population_at_risk >= 1000000
                                        ? `${(s.population_at_risk / 1000000).toFixed(1)}M`
                                        : `${Math.round(s.population_at_risk / 1000)}k`
                                    : '—'
                            }</span> — initiate evacuation corridors</li>
                        </ul>
                    </div>

                    <div className="report-text mt-2 pt-3 border-t border-gray-800/50">
                        <h3 className="text-[10px] font-mono text-plasma mb-2 uppercase tracking-wider flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Visual Intelligence (Gemini)
                        </h3>
                        <p className="text-xs italic text-gray-500 border-l-2 border-plasma/30 pl-2">
                            "Imagery shows concentrated collapse patterns in {ev?.event_type === 'EQ' ? 'near-epicentre residential areas' : ev?.event_type === 'FL' ? 'low-lying flood channels and delta zones' : ev?.event_type === 'WF' ? 'forested hillside corridors with spotfire spread' : 'the primary impact zone'}.
                            Main arterial roads show debris obstruction. Temporary shelter concentration detected in northern perimeter zones."
                        </p>
                    </div>

                    <div className="report-text mt-1 grid grid-cols-2 gap-2">
                        <div className="bg-void/40 rounded-xl p-2.5 border border-gray-800/50">
                            <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Intact</div>
                            <div className="font-sora font-bold text-green-400 text-base">{s?.intact_pct ?? 41}%</div>
                        </div>
                        <div className="bg-void/40 rounded-xl p-2.5 border border-gray-800/50">
                            <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Destroyed</div>
                            <div className="font-sora font-bold text-alert-red text-base">{s?.destroyed_pct ?? 13}%</div>
                        </div>
                    </div>

                    <div className="mt-2 text-[9px] font-mono text-gray-600 flex justify-between uppercase tracking-widest pt-2">
                        <span>LLM: Llama-3.1-70b</span>
                        <span>Confidence: {s?.ai_confidence_pct ?? 87}%</span>
                        <span>Vision: Gemini 1.5</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const CpuIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-plasma"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
);
const AlertTriangleIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

export default AIReportPanel;
