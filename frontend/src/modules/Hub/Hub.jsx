import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Globe, Activity, Satellite, ShieldAlert, Zap, Radio, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

/* ── QuickStat pill ─────────────────────────────── */
const QuickStat = ({ icon: Icon, value, label, color = '#7B61FF' }) => (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-graphite border border-gray-800">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
            <Icon style={{ width: 15, height: 15, color }} />
        </div>
        <div>
            <div className="font-sora font-bold text-ghost text-base leading-none mb-0.5">{value}</div>
            <div className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">{label}</div>
        </div>
    </div>
);

/* ── Ticker ──────────────────────────────────────── */
const AlertTicker = () => {
    const items = [
        'M5.9 seismic event — Northern Japan',
        '14 fire hotspots — Australian interior',
        'Flood advance 8km — Bangladesh delta',
        'SAR pass complete — Kashmir zone',
        'AI model: 62 critical structures — Turkey sector 4',
        'NDRF deployment confirmed — grid NK-2240',
    ];
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setIdx(i => (i + 1) % items.length), 3500);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="flex items-center gap-3 overflow-hidden">
            <span className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-widest flex-shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                LIVE
            </span>
            <span className="font-mono text-[11px] text-gray-400 truncate transition-all duration-700">
                ▸ {items[idx]}
            </span>
        </div>
    );
};

/* ── Mission Clock ───────────────────────────────── */
const MissionClock = () => {
    const [time, setTime] = useState(() => new Date().toUTCString().slice(17, 25));
    useEffect(() => {
        const t = setInterval(() => setTime(new Date().toUTCString().slice(17, 25)), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <span className="font-mono text-xs text-gray-500 flex items-center gap-1.5">
            <Clock style={{ width: 11, height: 11 }} />
            {time} UTC
        </span>
    );
};

const HubCard = ({ title, description, icon: Icon, path, badge, delay }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(path)}
            className="hub-card cursor-pointer group relative overflow-hidden bg-graphite border border-gray-800 rounded-3xl p-8 hover:border-plasma transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,229,255,0.12)] flex flex-col items-start gap-4"
        >
            {/* Badge */}
            {badge && (
                <div className="absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-plasma/10 border border-plasma/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-plasma animate-pulse" />
                    <span className="font-mono text-[9px] text-plasma uppercase tracking-widest">{badge}</span>
                </div>
            )}

            <div className="p-4 rounded-2xl bg-void border border-gray-800 group-hover:border-plasma/50 group-hover:bg-plasma/5 transition-all">
                <Icon className="w-7 h-7 text-gray-400 group-hover:text-plasma transition-colors" />
            </div>

            <div className="mt-2 flex-1">
                <h3 className="text-xl font-sora font-semibold text-ghost mb-2 group-hover:translate-x-1 transition-transform">{title}</h3>
                <p className="text-sm font-mono text-gray-500 leading-relaxed">{description}</p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-gray-600 group-hover:text-plasma transition-colors">
                <span>OPEN MODULE</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </div>

            <span className="absolute inset-0 bg-gradient-to-br from-plasma/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
};

const Hub = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.hub-hero-text',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power3.out' }
            );
            gsap.fromTo('.hub-stat',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: 'power3.out', delay: 0.2 }
            );
            gsap.fromTo('.hub-card',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.12, duration: 0.8, ease: 'power3.out', delay: 0.35 }
            );
            gsap.fromTo('.hub-ticker',
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen pt-28 pb-16 px-4 md:px-8 max-w-[1440px] mx-auto flex flex-col gap-8">

            {/* ── Ticker Strip ───────────────────────────── */}
            <div className="hub-ticker flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-graphite border border-gray-800">
                <AlertTicker />
                <MissionClock />
            </div>

            {/* ── Command Hero ──────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div>
                    <div className="hub-hero-text inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-plasma/30 bg-plasma/5 text-plasma text-xs font-mono uppercase tracking-widest mb-5">
                        <div className="w-2 h-2 rounded-full bg-plasma animate-pulse" />
                        System Active — All Feeds Online
                    </div>
                    <h1 className="hub-hero-text text-5xl md:text-6xl xl:text-7xl font-sora font-semibold tracking-tight text-ghost mb-4 leading-[1.05]">
                        Global Damage <br />
                        <span className="font-drama italic text-plasma font-normal text-6xl md:text-7xl xl:text-8xl">Intelligence</span>
                    </h1>
                    <p className="hub-hero-text text-gray-500 font-mono text-sm max-w-lg leading-relaxed">
                        Select a module below. Real-time disaster feeds, satellite comparisons, and AI infrastructure risk reports are live.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3 md:flex-col md:items-end">
                    <div className="hub-stat"><QuickStat icon={AlertTriangle} value="38" label="Active Incidents" color="#FF6B6B" /></div>
                    <div className="hub-stat"><QuickStat icon={Radio} value="12" label="Units Deployed" color="#00E5FF" /></div>
                    <div className="hub-stat"><QuickStat icon={TrendingUp} value="94%" label="Sat Coverage" color="#7B61FF" /></div>
                </div>
            </div>

            {/* ── Module Cards ─────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                <HubCard
                    title="Live Monitor"
                    description="Real-time global feeds for earthquakes, wildfires, and floods via GDACS & USGS with interactive cartography."
                    icon={Globe}
                    path="/monitor"
                    badge="38 events"
                />
                <HubCard
                    title="Damage Intelligence"
                    description="AI-driven structural damage assessments, critical infrastructure risk, and recovery trajectory analytics."
                    icon={Activity}
                    path="/intelligence"
                    badge="AI active"
                />
                <HubCard
                    title="Satellite Operations"
                    description="Analyze Sentinel-2 orbital passes and compare before/after high-resolution imagery."
                    icon={Satellite}
                    path="/satellite"
                    badge="Pass in 14m"
                />
                <HubCard
                    title="Assess My Area"
                    description="Upload on-the-ground reports and connect with the nearest response organizations."
                    icon={ShieldAlert}
                    path="/assess"
                />
            </div>

            {/* ── System Status Footer ─────────────────── */}
            <div className="hub-ticker grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'GDACS Feed', status: 'Online', ok: true },
                    { label: 'Sentinel-2 API', status: 'Connected', ok: true },
                    { label: 'AI Pipeline', status: 'Processing', ok: true },
                    { label: 'Ground Reports', status: '7 Pending', ok: false },
                ].map(({ label, status, ok }, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-graphite border border-gray-800">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse ${ok ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <div>
                            <div className="font-mono text-[9px] text-gray-600 uppercase tracking-widest">{label}</div>
                            <div className={`font-mono text-[11px] font-medium ${ok ? 'text-green-400' : 'text-yellow-400'}`}>{status}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Hub;
