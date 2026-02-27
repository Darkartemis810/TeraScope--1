import React, { useState } from 'react';
import { SplitSquareHorizontal } from 'lucide-react';

const BEFORE_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GoldenGateBridge-001.jpg/1280px-GoldenGateBridge-001.jpg';
const AFTER_IMG  = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg';

const BeforeAfterSliderCivilian = () => {
  const [position, setPosition] = useState(50);

  return (
    <div className="bg-graphite rounded-2xl p-5 border border-ghost/10" aria-label="Before and after satellite imagery comparison">
      <h2 className="text-base font-sora font-semibold text-ghost mb-4 flex items-center gap-2">
        <SplitSquareHorizontal className="w-5 h-5 text-plasma" /> Before / After Comparison
      </h2>

      <div className="relative rounded-xl overflow-hidden select-none" style={{ height: '300px' }}>
        {/* After image (full width behind) */}
        <img src={AFTER_IMG} alt="After disaster" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

        {/* Before image (clipped by slider position) */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img src={BEFORE_IMG} alt="Before disaster" className="absolute inset-0 w-full h-full object-cover"
               style={{ minWidth: '100%', width: `${100 / (position / 100)}%`, maxWidth: 'none' }}
               draggable={false} />
        </div>

        {/* Slider divider line */}
        <div className="absolute top-0 bottom-0" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
          <div className="w-0.5 h-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-void border-2 border-white/80 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-grab">
            <SplitSquareHorizontal className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-void/80 border border-ghost/20 text-[10px] font-mono text-ghost/70 uppercase">Before</div>
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-void/80 border border-ghost/20 text-[10px] font-mono text-ghost/70 uppercase">After</div>

        {/* Range input overlay */}
        <input type="range" min="0" max="100" value={position}
          onChange={e => setPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-10"
          aria-label="Drag to compare before and after images"
        />
      </div>

      <p className="text-xs font-mono text-ghost/30 mt-3 text-center">Drag the slider to compare satellite imagery before and after the disaster event.</p>
    </div>
  );
};

export default BeforeAfterSliderCivilian;
