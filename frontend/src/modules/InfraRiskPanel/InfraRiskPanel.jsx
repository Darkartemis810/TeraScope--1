import React from 'react';
import { useStore } from '../../store';
import { Zap, Droplets, HeartPulse, ShieldAlert, Radio } from 'lucide-react';

const MOCK_INFRA = [
    { id: 1, type: 'hospital', name: 'Mercy District Hospital', risk: 'critical', distance: '1.2km' },
    { id: 2, type: 'power', name: 'South Substation 04', risk: 'critical', distance: '0.8km' },
    { id: 3, type: 'bridge', name: 'Highway 9 Overpass', risk: 'high', distance: '3.4km' },
    { id: 4, type: 'comms', name: 'Cell Tower XL-992', risk: 'monitoring', distance: '4.1km' },
    { id: 5, type: 'water', name: 'Municipal Supply W1', risk: 'monitoring', distance: '5.6km' },
];

const InfraIcon = ({ type }) => {
    switch (type) {
        case 'hospital': return <HeartPulse className="w-3.5 h-3.5" />;
        case 'power': return <Zap className="w-3.5 h-3.5" />;
        case 'water': return <Droplets className="w-3.5 h-3.5" />;
        case 'comms': return <Radio className="w-3.5 h-3.5" />;
        default: return <ShieldAlert className="w-3.5 h-3.5" />;
    }
};

const RiskBadge = ({ risk }) => {
    if (risk === 'critical') return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-alert-red/20 text-alert-red border border-alert-red/30 uppercase tracking-widest animate-pulse">Critical</span>;
    if (risk === 'high') return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-alert-orange/20 text-alert-orange border border-alert-orange/30 uppercase tracking-widest">High Risk</span>;
    return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-alert-yellow/20 text-alert-yellow border border-alert-yellow/30 uppercase tracking-widest">Monitor</span>;
};

const InfraRiskPanel = () => {
    const { activeEventId } = useStore();

    if (!activeEventId) return null;

    return (
        <div className="bg-graphite border border-gray-800 p-5 rounded-3xl flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-sora font-semibold text-sm flex items-center gap-2 text-ghost">
                    <ShieldAlert className="w-4 h-4 text-plasma" />
                    Critical Infrastructure
                </h3>
                <span className="text-xs font-mono text-alert-red animate-pulse">2 CRITICAL</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2 pb-2">
                {MOCK_INFRA.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-void/60 border border-gray-800/80 hover:border-gray-600 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border ${item.risk === 'critical' ? 'bg-alert-red/10 border-alert-red/20 text-alert-red' :
                                    item.risk === 'high' ? 'bg-alert-orange/10 border-alert-orange/20 text-alert-orange' :
                                        'bg-gray-800 border-gray-700 text-gray-400'
                                }`}>
                                <InfraIcon type={item.type} />
                            </div>
                            <div>
                                <div className="text-xs font-sora font-semibold text-ghost">{item.name}</div>
                                <div className="text-[10px] font-mono text-gray-500 uppercase">{item.type} · {item.distance}</div>
                            </div>
                        </div>
                        <RiskBadge risk={item.risk} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InfraRiskPanel;
