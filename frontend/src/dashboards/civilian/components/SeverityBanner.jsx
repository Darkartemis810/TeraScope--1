import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, Radio } from 'lucide-react';

const SEVERITY_LEVELS = [
  { level: 1, label: 'MINIMAL', color: 'bg-alert-green', text: 'text-alert-green', border: 'border-alert-green/30', icon: ShieldCheck, desc: 'No immediate threat. Stay informed.' },
  { level: 2, label: 'LOW', color: 'bg-alert-yellow', text: 'text-alert-yellow', border: 'border-alert-yellow/30', icon: Shield, desc: 'Minor activity detected. Monitor updates.' },
  { level: 3, label: 'MODERATE', color: 'bg-alert-orange', text: 'text-alert-orange', border: 'border-alert-orange/30', icon: AlertTriangle, desc: 'Prepare for possible evacuation.' },
  { level: 4, label: 'HIGH', color: 'bg-alert-red', text: 'text-alert-red', border: 'border-alert-red/30', icon: ShieldAlert, desc: 'Evacuate if instructed. Stay alert.' },
  { level: 5, label: 'CRITICAL', color: 'bg-red-600', text: 'text-red-400', border: 'border-red-500/50', icon: ShieldAlert, desc: 'IMMEDIATE DANGER. Evacuate now.' },
];

const SeverityBanner = ({ alerts = [] }) => {
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    if (alerts.length === 0) { setCurrentLevel(1); return; }
    const maxSeverity = alerts.reduce((max, a) => {
      const s = a.properties?.severity || 'Minor';
      const map = { Extreme: 5, Severe: 4, Moderate: 3, Minor: 2, Unknown: 1 };
      return Math.max(max, map[s] || 1);
    }, 1);
    setCurrentLevel(maxSeverity);
  }, [alerts]);

  const sev = SEVERITY_LEVELS[currentLevel - 1];
  const Icon = sev.icon;

  return (
    <div className={`w-full rounded-2xl ${sev.border} border-2 p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4 transition-all duration-500`}
         style={{ background: 'linear-gradient(135deg, rgba(18,18,26,0.95), rgba(5,5,10,0.98))' }}
         role="alert" aria-live="assertive" aria-label={`Disaster severity level ${sev.level}: ${sev.label}`}>
      <div className={`flex items-center gap-3 ${sev.text}`}>
        <Icon className="w-8 h-8 md:w-10 md:h-10 shrink-0" aria-hidden="true" />
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${sev.color}/20 ${sev.text}`}>
              LEVEL {sev.level}
            </span>
            <span className="text-lg md:text-xl font-sora font-bold">{sev.label}</span>
          </div>
          <p className="text-sm text-ghost/70 font-mono mt-0.5">{sev.desc}</p>
        </div>
      </div>
      <div className="sm:ml-auto flex items-center gap-2 text-xs font-mono text-ghost/50">
        <Radio className="w-3 h-3 animate-pulse text-alert-red" />
        LIVE — {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} in your area
      </div>
    </div>
  );
};

export default SeverityBanner;
