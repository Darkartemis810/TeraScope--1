import React from 'react';

import EventSidebar from '../../modules/EventSidebar/EventSidebar';
import DamageMap from '../../modules/DamageMap/DamageMap';
import GroundTruthLayer from '../../modules/GroundTruthLayer/GroundTruthLayer';
import StatCards from '../../modules/StatCards/StatCards';
import AIChat from '../../modules/AIChat/AIChat';
import AIReportPanel from '../../modules/AIReportPanel/AIReportPanel';
import SeverityChart from '../../modules/SeverityChart/SeverityChart';
import InfraRiskPanel from '../../modules/InfraRiskPanel/InfraRiskPanel';
import RecoveryChart from '../../modules/RecoveryChart/RecoveryChart';
import SatelliteOps from '../../modules/SatelliteOps/SatelliteOps';

// Layout: Live Monitor Module
export const LiveMonitorModule = () => {
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
export const DamageIntelligenceModule = () => {
  const { activeEventId, activeEventDetails } = useStore();

  return (
    <div className="min-h-screen pt-28 pb-6 px-4 md:px-8 max-w-[1400px] mx-auto animate-fade-in flex flex-col gap-5">

      {/* Context banner */}
      <div className={`flex items-center justify-between px-5 py-3 rounded-2xl border ${
        activeEventId
          ? 'bg-plasma/5 border-plasma/20'
          : 'bg-graphite border-gray-800'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            activeEventId ? 'bg-plasma animate-pulse' : 'bg-gray-700'
          }`} />
          <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
            {activeEventId
              ? `Analyzing: ${activeEventDetails?.title || activeEventDetails?.event_name || `Event #${activeEventId}`}`
              : 'No event selected — showing demo data'}
          </span>
        </div>
        {!activeEventId && (
          <a href="/monitor" className="font-mono text-[10px] text-plasma border border-plasma/30 hover:bg-plasma/10 px-3 py-1 rounded-full uppercase tracking-widest transition-colors">
            ← Select from Monitor
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
        {/* Left — AI Report */}
        <div className="flex flex-col gap-5 h-[calc(100vh-13rem)] overflow-y-auto custom-scrollbar pr-1">
          <AIReportPanel />
        </div>

        {/* Right — Charts */}
        <div className="flex flex-col gap-5 h-[calc(100vh-13rem)] overflow-y-auto custom-scrollbar pr-1">
          <div className="bg-graphite rounded-3xl p-5 border border-gray-800 shadow-glow">
            <SeverityChart />
          </div>
          <div className="flex-1 min-h-[16rem]">
            <InfraRiskPanel />
          </div>
          <div className="bg-graphite rounded-3xl p-5 border border-gray-800">
            <RecoveryChart />
          </div>
        </div>
      </div>

      <AIChat />
    </div>
  );
};

// Layout: Satellite Operations Module
export const SatelliteOpsModule = () => {
  return <SatelliteOps />;
};

// Layout: Assess Module
export const AssessModule = () => {
  return (
    <div className="min-h-screen pt-24 pb-6 px-4 md:px-8 max-w-[1400px] mx-auto animate-fade-in">
      <Assessment />
    </div>
  );
};
