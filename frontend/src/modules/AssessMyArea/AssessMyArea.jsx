import React, { useMemo, useState } from 'react';
import { PencilLine, X, Search, CheckCircle, MapPin, AlertTriangle, Download } from 'lucide-react';

const AssessMyArea = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, drawing, scanning, complete
    const [location, setLocation] = useState('');
    const [hazard, setHazard] = useState('flood');
    const [areaSize, setAreaSize] = useState(6);

    const assessment = useMemo(() => ({
        summary: `High-resolution tasking queued for ${location || 'your drawn area'}. Latest Sentinel-2 + commercial SAR will be fused for rapid change detection targeting ${hazard} impacts.`,
        findings: [
            { title: 'Damage Probability', value: '62% (buildings)', severity: 'elevated' },
            { title: 'Road Impacts', value: '2 key corridors disrupted', severity: 'moderate' },
            { title: 'Population Affected', value: '~18.4k within AOI', severity: 'high' },
            { title: 'Confidence', value: '0.78 (model ensemble)', severity: 'neutral' },
        ],
    }), [hazard, location]);

    const handleScan = () => {
        setStatus('scanning');
        setTimeout(() => {
            setStatus('complete');
        }, 2200);
    };

    const closePanel = () => {
        setIsOpen(false);
        setStatus('idle');
        setLocation('');
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 md:right-auto md:left-1/2 md:-translate-x-1/2 z-[500] px-6 py-3 rounded-full flex items-center gap-3 transition-all hover:-translate-y-1 btn-magnetic btn-solid"
                >
                    <PencilLine className="w-5 h-5 text-plasma" />
                    <span className="font-sora font-semibold text-sm">Assess My Area</span>
                </button>
            )}

            {/* Slide-up Panel */}
            <div className={`fixed bottom-0 left-0 right-0 z-[600] bg-graphite border-t border-plasma/50 p-6 md:p-8 transform transition-transform duration-500 ease-out shadow-[0_-20px_50px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-sora font-semibold text-xl text-ghost flex items-center gap-3">
                            <PencilLine className="w-6 h-6 text-plasma" />
                            On-Demand Satellite Assessment
                        </h2>
                        <button onClick={closePanel} className="text-gray-500 hover:text-white p-2">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="font-sora text-sm text-gray-400">
                                Draw a polygon on the map around your neighborhood or facility to trigger an immediate, high-resolution satellite analysis.
                            </p>

                            <label className="flex items-center gap-2 bg-void/50 border border-gray-800 rounded-xl px-3 py-2">
                                <MapPin className="w-4 h-4 text-plasma" />
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Search city, lat/long, or site name"
                                    className="bg-transparent w-full focus:outline-none font-sora text-sm text-ghost placeholder:text-gray-600"
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-void/40 border border-gray-800 rounded-xl p-3">
                                    <span className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Hazard Focus</span>
                                    <select
                                        value={hazard}
                                        onChange={(e) => setHazard(e.target.value)}
                                        className="w-full bg-transparent text-ghost font-semibold focus:outline-none"
                                    >
                                        <option value="flood">Flood</option>
                                        <option value="earthquake">Earthquake</option>
                                        <option value="wildfire">Wildfire</option>
                                        <option value="cyclone">Cyclone</option>
                                    </select>
                                </div>
                                <div className="bg-void/40 border border-gray-800 rounded-xl p-3">
                                    <span className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Area (km²)</span>
                                    <input
                                        type="range"
                                        min={1}
                                        max={20}
                                        value={areaSize}
                                        onChange={(e) => setAreaSize(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="text-ghost text-sm font-semibold">{areaSize.toFixed(0)} km² AOI</div>
                                </div>
                            </div>

                            {status === 'idle' && (
                                <button
                                    onClick={() => setStatus('drawing')}
                                    className="w-full btn-solid py-3 rounded-xl font-semibold btn-magnetic"
                                >
                                    START DRAWING ON MAP
                                </button>
                            )}

                            {status === 'drawing' && (
                                <div className="space-y-3">
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Close the polygon to continue.
                                    </div>
                                    <button
                                        onClick={handleScan}
                                        className="w-full bg-alert-green/20 text-alert-green border border-alert-green/50 rounded-xl py-3 font-semibold hover:bg-alert-green/30 transition-colors flex justify-center items-center gap-2 animate-pulse"
                                    >
                                        <Search className="w-5 h-5" /> CONFIRM AREA & SCAN
                                    </button>
                                </div>
                            )}

                            {status === 'scanning' && (
                                <div className="bg-void/50 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 h-28">
                                    <div className="w-6 h-6 border-2 border-gray-600 border-t-plasma rounded-full animate-spin" />
                                    <span className="font-mono text-xs text-plasma animate-pulse tracking-widest uppercase">Tasking satellites...</span>
                                </div>
                            )}

                            {status === 'complete' && (
                                <div className="bg-alert-green/10 border border-alert-green/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                                    <CheckCircle className="w-8 h-8 text-alert-green mb-1" />
                                    <span className="font-sora font-semibold text-ghost">Assessment Complete</span>
                                    <span className="font-mono text-[10px] text-gray-400">RESULTS SYNCED TO DASHBOARD</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-void/50 rounded-2xl border border-gray-800 p-5 font-mono text-xs text-gray-400 space-y-3">
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span>Free Tier Quota</span>
                                <span className="text-plasma">AVAILABLE</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span>Max Polygon Size</span>
                                <span className="text-ghost">15 km²</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span>Estimated Time</span>
                                <span className="text-ghost">15-45 seconds</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sensor Mix</span>
                                <span className="text-ghost">Sentinel-2 + SAR</span>
                            </div>

                            {status === 'complete' && (
                                <div className="pt-3 border-t border-gray-800 space-y-3">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Summary</div>
                                        <div className="text-ghost leading-relaxed">{assessment.summary}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {assessment.findings.map((f) => (
                                            <div key={f.title} className="bg-void/60 border border-gray-800 rounded-lg p-2">
                                                <div className="text-[10px] uppercase tracking-wide text-gray-500">{f.title}</div>
                                                <div className="text-ghost text-sm font-semibold">{f.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full flex items-center justify-center gap-2 btn-ghost border border-gray-800 rounded-lg py-2">
                                        <Download className="w-4 h-4" />
                                        Export GeoJSON & PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AssessMyArea;
