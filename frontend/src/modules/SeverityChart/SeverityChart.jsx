import React from 'react';
import { useStore } from '../../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';

const mockData = [
    { name: '0', label: 'Intact', value: 8900, color: '#34C759' },
    { name: '1', label: 'Minor', value: 3450, color: '#FFCC00' },
    { name: '2', label: 'Major', value: 1820, color: '#FF9500' },
    { name: '3', label: 'Destroyed', value: 540, color: '#FF3B30' },
];

const SeverityChart = () => {
    const { activeEventId } = useStore();

    if (!activeEventId) return null;

    return (
        <div className="h-40 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-sora font-semibold text-sm flex items-center gap-2 text-ghost">
                    <BarChart2 className="w-4 h-4 text-plasma" />
                    Structural Damage
                </h3>
                <span className="text-xs font-mono text-gray-500">N=14,710</span>
            </div>

            <div className="flex-1 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
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
                            {mockData.map((entry, index) => (
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
