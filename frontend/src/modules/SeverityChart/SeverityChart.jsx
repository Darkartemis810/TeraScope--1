import React from 'react';
import { useStore } from '../../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';

const demoStats = {
    intact_pct: 42,
    minor_damage_pct: 28,
    major_damage_pct: 19,
    destroyed_pct: 11,
};

const SeverityChart = () => {
    const { activeEventId, analysisData } = useStore();

    const isDemo = !activeEventId || !analysisData?.stats;
    const stats = isDemo ? demoStats : analysisData.stats;

    // We expect the backend stats to provide damage percentages or counts.
    // Assuming percentages for now since backend intelligence module sets pct:
    const chartData = [
        { label: 'Intact', value: stats.intact_pct || 0, color: '#34C759' },
        { label: 'Minor', value: stats.minor_damage_pct || 0, color: '#FFCC00' },
        { label: 'Major', value: stats.major_damage_pct || 0, color: '#FF9500' },
        { label: 'Destroyed', value: stats.destroyed_pct || 0, color: '#FF3B30' },
    ];

    return (
        <div className="h-40 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-sora font-semibold text-sm flex items-center gap-2 text-ghost">
                    <BarChart2 className="w-4 h-4 text-plasma" />
                    Structural Damage
                </h3>
                <span className="text-xs font-mono text-gray-500">
                    {isDemo ? <span className="text-[10px] text-gray-600 italic">DEMO DATA</span> : '% DISTRIBUTION'}
                </span>
            </div>

            <div className="flex-1 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="label"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#F0EFF4', fontSize: 10, fontFamily: 'Fira Code' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#18181B', borderColor: '#2A2A35', borderRadius: '12px' }}
                            itemStyle={{ color: '#F0EFF4', fontFamily: 'Fira Code', fontSize: '12px' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SeverityChart;
