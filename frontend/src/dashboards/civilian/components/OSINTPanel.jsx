import React, { useState } from 'react';
import { Eye, ShieldCheck, ShieldAlert, ShieldQuestion, ThumbsUp, ThumbsDown, User, Clock } from 'lucide-react';

const MOCK_REPORTS = [
  { id: 1, source: 'Twitter/X', user: '@local_reporter', text: 'Major flooding on Highway 5 near exit 12. Cars stranded. Avoid the area.', time: '12 min ago', trustScore: 87, status: 'verified', votes: { up: 45, down: 2 } },
  { id: 2, source: 'Community', user: 'Maria G.', text: 'Power is out in the entire Westside district. Emergency crews spotted on Oak St.', time: '28 min ago', trustScore: 72, status: 'verified', votes: { up: 32, down: 5 } },
  { id: 3, source: 'Reddit', user: 'u/stormchaser99', text: 'Heard reports of a gas leak near the industrial park. Cannot confirm.', time: '45 min ago', trustScore: 34, status: 'unverified', votes: { up: 8, down: 12 } },
  { id: 4, source: 'Facebook', user: 'Neighborhood Watch', text: 'Bridge on 3rd Street partially collapsed. Do NOT cross.', time: '1 hr ago', trustScore: 91, status: 'verified', votes: { up: 120, down: 3 } },
  { id: 5, source: 'WhatsApp', user: 'Anonymous', text: 'Earthquake aftershock felt strongly in downtown area. Some buildings evacuated.', time: '2 hr ago', trustScore: 25, status: 'disputed', votes: { up: 15, down: 18 } },
];

const STATUS_CONFIG = {
  verified:   { icon: ShieldCheck, color: 'text-alert-green', bg: 'bg-alert-green/15', label: 'VERIFIED' },
  unverified: { icon: ShieldQuestion, color: 'text-alert-yellow', bg: 'bg-alert-yellow/15', label: 'UNVERIFIED' },
  disputed:   { icon: ShieldAlert, color: 'text-alert-red', bg: 'bg-alert-red/15', label: 'DISPUTED' },
};

const OSINTPanel = () => {
  const [filter, setFilter] = useState('all');
  const filtered = MOCK_REPORTS.filter(r => filter === 'all' || r.status === filter);

  const trustColor = (score) => {
    if (score >= 70) return 'text-alert-green';
    if (score >= 40) return 'text-alert-yellow';
    return 'text-alert-red';
  };

  return (
    <div className="bg-graphite rounded-2xl p-5 border border-ghost/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-sora font-semibold text-ghost flex items-center gap-2">
          <Eye className="w-5 h-5 text-plasma" /> Community Reports (OSINT)
        </h2>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {['all', 'verified', 'unverified', 'disputed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold uppercase transition-all ${filter === s ? 'bg-plasma/20 text-plasma border border-plasma/30' : 'bg-void text-ghost/40 border border-ghost/10 hover:border-ghost/20'}`}
            aria-pressed={filter === s}>
            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
        {filtered.map(report => {
          const sc = STATUS_CONFIG[report.status];
          const StatusIcon = sc.icon;

          return (
            <div key={report.id} className="bg-void rounded-xl p-4 border border-ghost/5 hover:border-ghost/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${sc.bg} ${sc.color}`}>
                    <StatusIcon className="w-3 h-3" /> {sc.label}
                  </span>
                  <span className="text-[10px] font-mono text-ghost/30">{report.source}</span>
                </div>
                <div className={`text-xs font-mono font-bold ${trustColor(report.trustScore)}`}>
                  {report.trustScore}% trust
                </div>
              </div>
              <p className="text-sm text-ghost/80 font-mono leading-relaxed mb-2">{report.text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] font-mono text-ghost/30">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {report.user}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {report.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-ghost/40">
                  <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" /> {report.votes.up}</span>
                  <span className="flex items-center gap-0.5"><ThumbsDown className="w-3 h-3" /> {report.votes.down}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OSINTPanel;
