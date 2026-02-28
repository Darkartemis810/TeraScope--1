import React from 'react';
import { useStore } from '../../store';
import { Users, Building2, Map, Crosshair } from 'lucide-react';

const StatCards = () => {
    const { activeEventId, analysisData } = useStore();

    if (!activeEventId) return null;

    const s = analysisData?.stats;
    const area = s?.affected_area_km2 ?? '—';
    const structures = s?.total_structures
        ? s.total_structures.toLocaleString()
        : '—';
    const damaged = s
        ? Math.round(s.total_structures * (1 - s.intact_pct / 100)).toLocaleString()
        : '—';
    const population = s?.population_at_risk
        ? s.population_at_risk >= 1000000
            ? `${(s.population_at_risk / 1000000).toFixed(1)}M`
            : s.population_at_risk >= 1000
            ? `${Math.round(s.population_at_risk / 1000)}k`
            : s.population_at_risk
        : '—';
    const confidence = s?.ai_confidence_pct ?? '—';

    return (
        <div className="flex flex-col gap-3">
            <StatCard
                icon={<Map className="w-4 h-4 text-plasma" />}
                label="AFFECTED AREA"
                value={area}
                unit="km²"
                trend="+12%"
            />
            <StatCard
                icon={<Building2 className="w-4 h-4 text-alert-red" />}
                label="STRUCTURES DMG"
                value={damaged}
                unit="bldg"
                trend="CRITICAL"
            />
            <StatCard
                icon={<Users className="w-4 h-4 text-alert-orange" />}
                label="POPULATION"
                value={population}
                unit="est"
                trend="AT RISK"
            />
            <StatCard
                icon={<Crosshair className="w-4 h-4 text-alert-green" />}
                label="AI CONFIDENCE"
                value={confidence}
                unit="%"
                trend="STABLE"
            />
        </div>
    );
};

const StatCard = ({ icon, label, value, unit, trend }) => (
    <div className="bg-void/80 backdrop-blur-md border border-gray-700 p-3 rounded-2xl flex items-center gap-4 w-48 shadow-float group hover:border-plasma transition-colors">
        <div className="w-8 h-8 rounded-full bg-graphite flex items-center justify-center border border-gray-800 group-hover:bg-plasma/10">
            {icon}
        </div>
        <div>
            <div className="text-[9px] font-mono text-gray-400 mb-0.5 tracking-wider">{label}</div>
            <div className="flex items-baseline gap-1">
                <span className="font-sora font-semibold text-lg leading-none text-ghost">{value}</span>
                <span className="text-xs font-mono text-gray-500">{unit}</span>
            </div>
            <div className="text-[9px] font-mono mt-1 text-gray-500 whitespace-nowrap">
                {trend.includes('+') || trend.includes('-') ? (
                    <span className={trend.includes('+') ? 'text-alert-orange' : 'text-alert-green'}>{trend} vs 24h</span>
                ) : (
                    <span className="text-plasma">{trend}</span>
                )}
            </div>
        </div>
    </div>
);

export default StatCards;
