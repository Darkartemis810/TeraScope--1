import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crosshair, ArrowRight, Globe, Activity, Satellite, Shield, Zap, Radio } from 'lucide-react';
import gsap from 'gsap';

/* ── Responder Login — Vapor Clinic (Preset D) ──────────
   Split-screen: atmospheric intel panel (left) + auth form (right)
   Void #0A0A14 | Plasma #7B61FF | Ghost #F0EFF4
   ─────────────────────────────────────────────────────── */

/* ── Live Intel Ticker ─────────────────────────── */
const IntelTicker = () => {
    const feeds = [
        '▸ GDACS ALERT: M6.2 seismic event — Sulawesi, Indonesia',
        '▸ FIRMS: 847 active fire hotspots detected — Western Canada',
        '▸ SAR ANALYSIS: Flood perimeter expanded 12km² — Bangladesh delta',
        '▸ DISPATCH: NDRF units mobilised — grid NG-2241',
        '▸ SENTINEL-2: Pass completed — 0.5m resolution acquired over zone 4',
        '▸ AI MODEL: 94 structures classified CRITICAL in sector 7',
    ];
    const [lines, setLines] = useState([]);
    const [currentMsg, setCurrentMsg] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [currentLine, setCurrentLine] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setCharIdx(prev => {
                const msg = feeds[currentMsg];
                if (prev < msg.length) {
                    setCurrentLine(msg.slice(0, prev + 1));
                    return prev + 1;
                } else {
                    setLines(old => [...old.slice(-4), msg]);
                    setCurrentLine('');
                    setCurrentMsg(m => (m + 1) % feeds.length);
                    return 0;
                }
            });
        }, 28);
        return () => clearInterval(timer);
    }, [currentMsg]);

    return (
        <div className="flex flex-col gap-1.5 font-mono text-[11px] leading-relaxed">
            {lines.map((line, i) => (
                <div key={i} className="text-[#F0EFF4]/25 truncate">{line}</div>
            ))}
            <div className="text-[#7B61FF]/80">
                {currentLine}
                <span className="inline-block w-1.5 h-3.5 bg-[#7B61FF] ml-0.5 animate-pulse align-middle" />
            </div>
        </div>
    );
};

/* ── Orbital SVG Decoration ────────────────────── */
const OrbitalRings = () => (
    <svg viewBox="0 0 300 300" className="w-full h-full opacity-[0.12]">
        <circle cx="150" cy="150" r="130" fill="none" stroke="#7B61FF" strokeWidth="0.5">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="60s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="95" fill="none" stroke="#7B61FF" strokeWidth="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="-360 150 150" dur="40s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="58" fill="none" stroke="#7B61FF" strokeWidth="0.6">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="22s" repeatCount="indefinite" />
        </circle>
        <circle cx="280" cy="150" r="4" fill="#7B61FF">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="60s" repeatCount="indefinite" />
        </circle>
        <circle cx="245" cy="150" r="3" fill="#7B61FF" opacity="0.7">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="-360 150 150" dur="40s" repeatCount="indefinite" />
        </circle>
        <circle cx="208" cy="150" r="2.5" fill="#7B61FF" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="22s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="6" fill="#7B61FF" opacity="0.9" />
    </svg>
);

export const LoginOrganization = () => {
    const navigate = useNavigate();
    const leftRef = useRef(null);
    const rightRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(leftRef.current,
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
            );
            gsap.fromTo(rightRef.current,
                { opacity: 0, x: 40 },
                { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.1 }
            );
        });
        return () => ctx.revert();
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/dashboard/organization');
    };

    const stats = [
        { icon: Globe, value: '38', label: 'Active Incidents' },
        { icon: Activity, value: '12', label: 'Deployments' },
        { icon: Satellite, value: '94%', label: 'Coverage' },
        { icon: Zap, value: '<15m', label: 'Response Time' },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A14] flex overflow-hidden">

            {/* ── LEFT PANEL ──────────────────────────────── */}
            <div
                ref={leftRef}
                className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden opacity-0"
            >
                {/* Background layers */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse at 30% 50%, rgba(123,97,255,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(123,97,255,0.06) 0%, transparent 45%)',
                }} />
                {/* Orbital rings background art */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <OrbitalRings />
                </div>
                {/* Vertical divider */}
                <div className="absolute right-0 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-[#7B61FF]/20 to-transparent" />

                {/* Top — Branding */}
                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-3 group mb-16">
                        <Crosshair className="w-7 h-7 text-[#7B61FF]" />
                        <span className="font-sora font-bold text-xl text-[#F0EFF4] tracking-tight">TeraScope</span>
                        <span className="font-mono text-[10px] text-[#F0EFF4]/30 uppercase tracking-widest ml-2 group-hover:text-[#7B61FF] transition-colors">
                            ← Surface
                        </span>
                    </Link>

                    <div className="mb-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#7B61FF]/25 bg-[#7B61FF]/8 font-mono text-[10px] text-[#7B61FF] uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7B61FF] animate-pulse" />
                            Command Network — Online
                        </span>
                    </div>

                    <h2 className="font-sora font-bold text-[#F0EFF4] text-4xl xl:text-5xl tracking-tight leading-[1.1] mb-4">
                        Situational<br />
                        <span className="font-drama italic font-normal text-[#7B61FF] text-5xl xl:text-6xl">Awareness.</span>
                    </h2>
                    <p className="text-[#F0EFF4]/35 font-mono text-sm max-w-sm leading-relaxed">
                        Unified command intelligence for disaster response agencies. Real-time orbital feeds, AI damage assessment, and multi-agency coordination.
                    </p>
                </div>

                {/* Middle — Stats Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-4">
                    {stats.map(({ icon: Icon, value, label }, i) => (
                        <div key={i} className="bg-[#12121E] border border-[#7B61FF]/10 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#7B61FF]/10 border border-[#7B61FF]/15 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4.5 h-4.5 text-[#7B61FF]" style={{ width: '18px', height: '18px' }} />
                            </div>
                            <div>
                                <div className="font-sora font-bold text-[#F0EFF4] text-xl leading-none mb-0.5">{value}</div>
                                <div className="font-mono text-[10px] text-[#F0EFF4]/30 uppercase tracking-widest">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom — Live Intel Feed */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Radio className="w-3.5 h-3.5 text-[#7B61FF]" />
                        <span className="font-mono text-[10px] text-[#7B61FF] uppercase tracking-widest">Live Intel Feed</span>
                        <div className="flex-1 h-px bg-[#7B61FF]/10" />
                    </div>
                    <div className="bg-[#0D0D1A] border border-[#7B61FF]/8 rounded-2xl p-4 min-h-[100px]">
                        <IntelTicker />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-[#F0EFF4]/20" />
                        <span className="font-mono text-[10px] text-[#F0EFF4]/20 uppercase tracking-widest">
                            Restricted Military / Government Access Only
                        </span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL — Auth Form ──────────────────── */}
            <div
                ref={rightRef}
                className="w-full lg:w-[42%] flex flex-col justify-center px-6 py-12 md:px-12 lg:px-14 xl:px-16 relative opacity-0"
                style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #0A0A14 100%)' }}
            >
                {/* Back link (mobile only) */}
                <div className="lg:hidden absolute top-8 left-6">
                    <Link to="/" className="text-[#F0EFF4]/40 font-mono text-sm hover:text-[#7B61FF] transition-colors">
                        ← BACK TO SURFACE
                    </Link>
                </div>

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-3 mb-10">
                    <Crosshair className="w-6 h-6 text-[#7B61FF]" />
                    <span className="font-sora font-bold text-lg text-[#F0EFF4]">TeraScope</span>
                </div>

                {/* Form header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-[#7B61FF]/15 border border-[#7B61FF]/25 flex items-center justify-center">
                            <Crosshair className="w-5 h-5 text-[#7B61FF]" />
                        </div>
                        <div>
                            <div className="font-mono text-[10px] text-[#7B61FF] uppercase tracking-widest">Responder Portal</div>
                            <h1 className="font-sora font-bold text-[#F0EFF4] text-2xl tracking-tight leading-tight">
                                AUTHORIZE ACCESS
                            </h1>
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#7B61FF]/6 border border-[#7B61FF]/15">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                        <span className="font-mono text-[10px] text-[#F0EFF4]/50 uppercase tracking-widest">
                            Encrypted channel — TLS 1.3 active
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Agency */}
                    <div>
                        <label className="block font-mono text-[10px] font-semibold text-[#F0EFF4]/40 mb-2 uppercase tracking-wider">
                            Agency Designation
                        </label>
                        <select className="w-full bg-[#12121E] border border-[#7B61FF]/12 rounded-xl px-4 py-3.5 text-[#F0EFF4] font-mono text-sm focus:outline-none focus:border-[#7B61FF]/50 focus:ring-1 focus:ring-[#7B61FF]/20 transition-all appearance-none cursor-pointer">
                            <option value="ndrf">NDRF Battalion</option>
                            <option value="crpf">CRPF Territorial</option>
                            <option value="army">Territorial Army</option>
                            <option value="sdrf">SDRF Unit</option>
                            <option value="authority">State Authority</option>
                        </select>
                    </div>

                    {/* Commander ID */}
                    <div>
                        <label className="block font-mono text-[10px] font-semibold text-[#F0EFF4]/40 mb-2 uppercase tracking-wider">
                            Commander ID
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[#12121E] border border-[#7B61FF]/12 rounded-xl px-4 py-3.5 text-[#F0EFF4] font-mono text-sm focus:outline-none focus:border-[#7B61FF]/50 focus:ring-1 focus:ring-[#7B61FF]/20 transition-all placeholder:text-[#F0EFF4]/15"
                            placeholder="OP-7734-X"
                        />
                    </div>

                    {/* Clearance Key */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block font-mono text-[10px] font-semibold text-[#F0EFF4]/40 uppercase tracking-wider">
                                Clearance Key
                            </label>
                            <button type="button" className="font-mono text-[10px] text-[#7B61FF]/50 hover:text-[#7B61FF] transition-colors uppercase tracking-wider">
                                forgot?
                            </button>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full bg-[#12121E] border border-[#7B61FF]/12 rounded-xl px-4 py-3.5 text-[#F0EFF4] font-mono text-sm focus:outline-none focus:border-[#7B61FF]/50 focus:ring-1 focus:ring-[#7B61FF]/20 transition-all placeholder:text-[#F0EFF4]/15"
                            placeholder="••••••••••••"
                        />
                    </div>

                    {/* Remember device */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 rounded border border-[#7B61FF]/25 bg-[#12121E] flex items-center justify-center group-hover:border-[#7B61FF]/50 transition-colors">
                            <div className="w-2 h-2 rounded-sm bg-[#7B61FF] opacity-0 group-hover:opacity-40 transition-opacity" />
                        </div>
                        <span className="font-mono text-[11px] text-[#F0EFF4]/30 uppercase tracking-wider">
                            Register this device for 7 days
                        </span>
                    </label>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn-magnetic w-full bg-[#7B61FF] hover:bg-[#6A50EE] text-white py-4 mt-2 rounded-full font-sora text-sm font-semibold uppercase tracking-widest group transition-colors flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(123,97,255,0.3)]"
                    >
                        AUTHORIZE OVERRIDE
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-[#7B61FF]/8" />
                        <span className="font-mono text-[10px] text-[#F0EFF4]/20 uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-[#7B61FF]/8" />
                    </div>

                    {/* Switch to civilian */}
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/civilian')}
                        className="w-full border border-[#F0EFF4]/8 hover:border-[#7B61FF]/40 text-[#F0EFF4]/35 hover:text-[#7B61FF] py-3.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all"
                    >
                        SWITCH TO CIVILIAN PORTAL
                    </button>
                </form>

                {/* Bottom footnote */}
                <p className="mt-8 text-center font-mono text-[10px] text-[#F0EFF4]/15 uppercase tracking-widest">
                    Unauthorized access is a criminal offence under IT Act §66
                </p>
            </div>
        </div>
    );
};

export default LoginOrganization;
