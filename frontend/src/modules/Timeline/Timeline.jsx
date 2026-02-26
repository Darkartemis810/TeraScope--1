import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { Camera, Play } from 'lucide-react';
import gsap from 'gsap';

// Mock pass thumbnails
const PASSES = [
    { id: '1', date: '2026-02-18', label: 'PRE-EVENT BASELINE', img: 'https://images.unsplash.com/photo-1549429598-a38f32ac1c9a?auto=format&fit=crop&w=400&q=80', active: true },
    { id: '2', date: '2026-02-21', label: 'IMPACT +24H', img: 'https://images.unsplash.com/photo-1517424168697-3932a3ec2ccb?auto=format&fit=crop&w=400&q=80', active: false },
    { id: '3', date: '2026-02-23', label: 'IMPACT +72H', img: 'https://images.unsplash.com/photo-1590483864700-1cffa7bfcaaa?auto=format&fit=crop&w=400&q=80', active: true },
    { id: '4', date: '2026-02-25', label: 'LATEST PASS', img: 'https://images.unsplash.com/photo-1498679057404-51bf9345c22f?auto=format&fit=crop&w=400&q=80', active: false },
];

const Timeline = () => {
    const { activeEventId } = useStore();
    const [selected, setSelected] = useState('4');

    if (!activeEventId) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500 font-mono text-sm">
                SELECT AN EVENT TO VIEW SATELLITE PASSES
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 text-ghost">
                <h3 className="font-sora font-semibold text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 text-plasma" />
                    Multi-Temporal Pass Archive
                </h3>
                <button className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                    <Play className="w-3 h-3" />
                    PLAY TIMELAPSE
                </button>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto custom-scrollbar pb-2 items-center">
                {PASSES.map((pass, i) => (
                    <div
                        key={pass.id}
                        onClick={() => setSelected(pass.id)}
                        className={`relative min-w-[200px] h-28 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ${selected === pass.id ? 'ring-2 ring-plasma ring-offset-2 ring-offset-graphite' : 'opacity-60 hover:opacity-100'
                            }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent z-10 opacity-80" />
                        <img
                            src={pass.img}
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${selected === pass.id ? 'scale-105' : 'group-hover:scale-105'}`}
                        />
                        <div className="absolute bottom-2 left-3 z-20">
                            <div className="text-[10px] font-mono text-plasma font-bold mb-0.5">{pass.label}</div>
                            <div className="text-xs font-sora font-semibold text-white">{pass.date}</div>
                        </div>
                        {selected === pass.id && (
                            <div className="absolute top-2 right-2 z-20 w-2 h-2 rounded-full bg-alert-green animate-pulse" />
                        )}
                    </div>
                ))}

                {/* Fetching Skeleton */}
                <div className="min-w-[200px] h-28 rounded-2xl border border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 gap-2">
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-plasma rounded-full animate-spin" />
                    <span className="text-[10px] font-mono">STANDBY FOR NEXT PASS</span>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
