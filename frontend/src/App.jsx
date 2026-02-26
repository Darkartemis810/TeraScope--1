import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import { useStore } from './store';

// Placeholder imports for modules
import EventSidebar from './modules/EventSidebar/EventSidebar';
import DamageMap from './modules/DamageMap/DamageMap';
import BeforeAfterSlider from './modules/BeforeAfterSlider/BeforeAfterSlider';
import Timeline from './modules/Timeline/Timeline';
import StatCards from './modules/StatCards/StatCards';
import AIReportPanel from './modules/AIReportPanel/AIReportPanel';
import SeverityChart from './modules/SeverityChart/SeverityChart';
import InfraRiskPanel from './modules/InfraRiskPanel/InfraRiskPanel';
import RecoveryChart from './modules/RecoveryChart/RecoveryChart';
import GroundTruthLayer from './modules/GroundTruthLayer/GroundTruthLayer';
import PublicReport from './modules/PublicReport/PublicReport';
import AlertPanel from './modules/AlertPanel/AlertPanel';
import AssessMyArea from './modules/AssessMyArea/AssessMyArea';
import AIChat from './modules/AIChat/AIChat';

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
  const navRef = useRef(null);
  const { toggleAlertPanel, isAlertPanelOpen } = useStore();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') return;

    const nav = navRef.current;

    // Morphing floating island effect
    const onScroll = () => {
      if (window.scrollY > 100) {
        gsap.to(nav, {
          backgroundColor: 'rgba(10, 10, 20, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(123, 97, 255, 0.3)',
          padding: '0.75rem 2rem',
          y: 0,
          duration: 0.4,
          ease: 'power3.out'
        });
      } else {
        gsap.to(nav, {
          backgroundColor: 'transparent',
          backdropFilter: 'blur(0px)',
          border: '1px solid transparent',
          padding: '1.5rem 2rem',
          y: 10,
          duration: 0.4,
          ease: 'power3.out'
        });
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  return (
    <nav ref={navRef} className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-12 rounded-full transition-all mt-4">
      <div className="flex items-center gap-3">
        <Activity className="text-plasma w-6 h-6" />
        <span className="font-sora font-bold text-xl tracking-tight">SENTINEL</span>
      </div>

      <div className="hidden md:flex items-center gap-6 font-mono text-sm opacity-80">
        <a href="/" className="hover:text-plasma hover:-translate-y-0.5 transition-transform">DASHBOARD</a>
        <a href="#alerts" className="hover:text-plasma hover:-translate-y-0.5 transition-transform" onClick={(e) => { e.preventDefault(); toggleAlertPanel(); }}>ALERTS</a>
      </div>

      <button onClick={toggleAlertPanel} className="relative text-ghost hover:text-plasma transition-colors">
        <ShieldAlert className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-alert-red rounded-full shadow-[0_0_10px_rgba(255,59,48,0.8)] animate-pulse"></span>
      </button>
    </nav>
  );
};

const Dashboard = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.from('.dashboard-panel', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen pt-24 pb-12 px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 max-w-[1920px] mx-auto">
      {/* Left Sidebar */}
      <div className="md:col-span-3 lg:col-span-2 dashboard-panel h-[calc(100vh-8rem)]">
        <EventSidebar />
      </div>

      {/* Main Center Area */}
      <div className="md:col-span-9 lg:col-span-7 flex flex-col gap-6 h-[calc(100vh-8rem)] dashboard-panel relative">
        <div className="relative flex-1 rounded-3xl overflow-hidden border border-gray-800 shadow-glow">
          <DamageMap />
          <GroundTruthLayer />
          <BeforeAfterSlider />
          <div className="absolute top-4 right-4 z-[400] pointer-events-none">
            <StatCards />
          </div>
        </div>

        <div className="h-48 rounded-3xl bg-graphite border border-gray-800 p-4">
          <Timeline />
        </div>
      </div>

      {/* Right Intelligence Panel */}
      <div className="md:col-span-12 lg:col-span-3 flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-y-auto pr-2 dashboard-panel custom-scrollbar">
        <AIReportPanel />
        <div className="bg-graphite rounded-3xl p-5 border border-gray-800">
          <SeverityChart />
        </div>
        <InfraRiskPanel />
        <div className="bg-graphite rounded-3xl p-5 border border-gray-800">
          <RecoveryChart />
        </div>
      </div>

      {/* Overlays */}
      <AlertPanel />
      <AssessMyArea />
      <AIChat />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/report/:slug" element={<PublicReport />} />
      </Routes>
    </Router>
  );
};

export default App;
