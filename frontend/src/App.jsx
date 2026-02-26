import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, ShieldAlert } from 'lucide-react';
import { useStore } from './store';

// Modules
import Hub from './modules/Hub/Hub';
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
  const { toggleAlertPanel } = useStore();
  const location = useLocation();

  useEffect(() => {
    const nav = navRef.current;
    const isHub = location.pathname === '/';

    const onScroll = () => {
      // Hub has a morphing nav, sub-pages have it solid always
      if (!isHub || window.scrollY > 50) {
        gsap.to(nav, {
          backgroundColor: 'rgba(5, 5, 10, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
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

    onScroll(); // Trigger instantly on mount/route change
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
        <a href="/" className="hover:text-plasma transition-colors">HUB</a>
        <a href="/monitor" className="hover:text-plasma transition-colors">MONITOR</a>
        <a href="#alerts" className="hover:text-plasma transition-colors" onClick={(e) => { e.preventDefault(); toggleAlertPanel(); }}>ALERTS</a>
      </div>

      <button onClick={toggleAlertPanel} className="relative text-ghost hover:text-plasma transition-colors">
        <ShieldAlert className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-alert-red rounded-full shadow-[0_0_10px_rgba(255,59,48,0.8)] animate-pulse"></span>
      </button>
    </nav>
  );
};

// Layout: Live Monitor Module
const LiveMonitorModule = () => {
  return (
    <div className="min-h-screen pt-24 pb-6 px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-[1920px] mx-auto animate-fade-in">
      <div className="md:col-span-1 h-[calc(100vh-8rem)]">
        <EventSidebar />
      </div>
      <div className="md:col-span-3 h-[calc(100vh-8rem)] relative rounded-3xl overflow-hidden border border-gray-800 shadow-glow">
        <DamageMap />
        <GroundTruthLayer />
        <div className="absolute top-4 right-4 z-[400] pointer-events-none">
          <StatCards />
        </div>
      </div>
      <AIChat />
    </div>
  );
};

// Layout: Damage Intelligence Module
const DamageIntelligenceModule = () => {
  return (
    <div className="min-h-screen pt-24 pb-6 px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
        <AIReportPanel />
      </div>
      <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
        <div className="bg-graphite rounded-3xl p-5 border border-gray-800 shadow-glow">
          <SeverityChart />
        </div>
        <div className="h-96">
          <InfraRiskPanel />
        </div>
        <div className="bg-graphite rounded-3xl p-5 border border-gray-800 flex-1">
          <RecoveryChart />
        </div>
      </div>
      <AIChat />
    </div>
  );
};

// Layout: Satellite Operations Module
const SatelliteOpsModule = () => {
  return (
    <div className="min-h-screen pt-24 pb-6 px-4 md:px-8 flex flex-col gap-6 max-w-[1920px] mx-auto animate-fade-in">
      <div className="flex-1 relative rounded-3xl overflow-hidden border border-gray-800 shadow-glow min-h-[500px]">
        <BeforeAfterSlider />
      </div>
      <div className="h-56 rounded-3xl bg-graphite border border-gray-800 p-4">
        <Timeline />
      </div>
      <AIChat />
    </div>
  );
};

// Placeholder layout for Assess
const AssessModule = () => {
  const { toggleAssessModal } = useStore();
  useEffect(() => {
    toggleAssessModal(true);
  }, [toggleAssessModal]);

  return (
    <div className="min-h-screen pt-32 px-8 max-w-[1400px] mx-auto text-center animate-fade-in">
      <h1 className="text-4xl font-sora font-semibold text-ghost mb-4">Field Assessment Module</h1>
      <p className="text-gray-400 font-mono">Opening civilian submission interface...</p>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/monitor" element={<LiveMonitorModule />} />
        <Route path="/intelligence" element={<DamageIntelligenceModule />} />
        <Route path="/satellite" element={<SatelliteOpsModule />} />
        <Route path="/assess" element={<AssessModule />} />

        <Route path="/report/:slug" element={<PublicReport />} />
      </Routes>

      {/* Global Overlays */}
      <AlertPanel />
      <AssessMyArea />
    </Router>
  );
};

export default App;
