import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Activity, ShieldAlert, Globe, Satellite, FileSearch, LayoutGrid } from 'lucide-react';
import { useStore } from '../../store';

const NAV_LINKS = [
    { label: 'HUB', path: '/dashboard/organization', icon: LayoutGrid },
    { label: 'MONITOR', path: '/monitor', icon: Globe },
    { label: 'INTELLIGENCE', path: '/intelligence', icon: FileSearch },
    { label: 'SATELLITE', path: '/satellite', icon: Satellite },
];

const DashboardNavbar = () => {
    const navRef = useRef(null);
    const { toggleAlertPanel } = useStore();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const nav = navRef.current;

        const onScroll = () => {
            if (window.scrollY > 20) {
                gsap.to(nav, {
                    backgroundColor: 'rgba(5, 5, 10, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(0, 229, 255, 0.2)',
                    padding: '0.6rem 1.5rem',
                    duration: 0.4,
                    ease: 'power3.out'
                });
            } else {
                gsap.to(nav, {
                    backgroundColor: 'rgba(5, 5, 10, 0.5)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(0, 229, 255, 0.12)',
                    padding: '0.85rem 1.5rem',
                    duration: 0.4,
                    ease: 'power3.out'
                });
            }
        };

        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [location.pathname]);

    return (
        <nav
            ref={navRef}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 rounded-full border transition-all"
            style={{ minWidth: 'min(92vw, 800px)' }}
        >
            {/* Brand */}
            <button
                onClick={() => navigate('/dashboard/organization')}
                className="flex items-center gap-2 flex-shrink-0"
            >
                <Activity className="text-plasma w-5 h-5" />
                <span className="font-sora font-bold text-base tracking-tight text-ghost">TeraScope</span>
                <span className="hidden sm:block font-mono text-[9px] text-gray-600 uppercase tracking-widest ml-1 border border-gray-700 rounded px-1.5 py-0.5">
                    RESPONDER
                </span>
            </button>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                {NAV_LINKS.map(({ label, path, icon: Icon }) => {
                    const isActive = location.pathname === path ||
                        (path !== '/dashboard/organization' && location.pathname.includes(path.replace('/dashboard/', '/')));
                    return (
                        <a
                            key={label}
                            href={path}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all duration-200 ${isActive
                                    ? 'bg-plasma/15 text-plasma border border-plasma/30'
                                    : 'text-gray-500 hover:text-plasma hover:bg-plasma/8'
                                }`}
                        >
                            <Icon style={{ width: 11, height: 11 }} />
                            {label}
                        </a>
                    );
                })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 ml-auto">
                <button
                    onClick={toggleAlertPanel}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/25 bg-red-500/8 text-red-400 hover:border-red-500/50 hover:bg-red-500/15 transition-all font-mono text-xs uppercase tracking-widest"
                >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="hidden sm:block">Alerts</span>
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,59,48,0.8)] animate-pulse" />
                </button>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
