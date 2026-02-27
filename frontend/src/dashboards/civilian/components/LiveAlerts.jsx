import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const SEVERITY_CONFIG = {
  Extreme: { bg: 'bg-alert-red/20', text: 'text-alert-red', border: 'border-alert-red/40', icon: AlertTriangle, label: 'CRITICAL' },
  Severe:  { bg: 'bg-alert-orange/20', text: 'text-alert-orange', border: 'border-alert-orange/40', icon: AlertTriangle, label: 'WARNING' },
  Moderate:{ bg: 'bg-alert-yellow/20', text: 'text-alert-yellow', border: 'border-alert-yellow/40', icon: AlertCircle, label: 'WATCH' },
  Minor:   { bg: 'bg-alert-green/20', text: 'text-alert-green', border: 'border-alert-green/40', icon: Info, label: 'ADVISORY' },
  Unknown: { bg: 'bg-ghost/10', text: 'text-ghost/60', border: 'border-ghost/20', icon: Info, label: 'INFO' },
};

const LiveAlerts = ({ alerts = [] }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const tickerRef = useRef(null);

  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  if (alerts.length === 0) {
    return (
      <div className="bg-graphite rounded-2xl p-6 border border-alert-green/20">
        <h2 className="text-lg font-sora font-semibold text-alert-green mb-2 flex items-center gap-2">
          <Info className="w-5 h-5" /> Live Alerts
        </h2>
        <p className="text-ghost/50 font-mono text-sm">No active alerts in your area. Stay safe.</p>
      </div>
    );
  }

  const current = alerts[activeIdx];
  const severity = current?.properties?.severity || 'Unknown';
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Unknown;
  const Icon = config.icon;

  return (
    <div className={`bg-graphite rounded-2xl p-5 border ${config.border} transition-all`} role="log" aria-live="polite" aria-label="Live disaster alerts">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-sora font-semibold text-ghost flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-alert-red"></span>
          </span>
          Live Alerts
        </h2>
        {alerts.length > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveIdx(p => (p - 1 + alerts.length) % alerts.length)} className="p-1 hover:bg-ghost/10 rounded-lg transition-colors" aria-label="Previous alert">
              <ChevronLeft className="w-4 h-4 text-ghost/50" />
            </button>
            <span className="text-xs font-mono text-ghost/40">{activeIdx + 1}/{alerts.length}</span>
            <button onClick={() => setActiveIdx(p => (p + 1) % alerts.length)} className="p-1 hover:bg-ghost/10 rounded-lg transition-colors" aria-label="Next alert">
              <ChevronRight className="w-4 h-4 text-ghost/50" />
            </button>
          </div>
        )}
      </div>

      <div ref={tickerRef} className="transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${config.bg} ${config.text}`}>
            <Icon className="w-3 h-3" /> {config.label}
          </span>
          <span className="text-xs font-mono text-ghost/40">{current?.properties?.event || 'Alert'}</span>
        </div>
        <h3 className="text-sm font-sora font-semibold text-ghost mb-1 line-clamp-2">
          {current?.properties?.headline || 'Weather Alert'}
        </h3>
        <p className="text-xs font-mono text-ghost/50 line-clamp-3">
          {current?.properties?.description?.substring(0, 200) || 'No details available.'}...
        </p>
        <div className="mt-2 flex gap-3 text-[10px] font-mono text-ghost/30">
          <span>Urgency: {current?.properties?.urgency || '—'}</span>
          <span>Certainty: {current?.properties?.certainty || '—'}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveAlerts;
