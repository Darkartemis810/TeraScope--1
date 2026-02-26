import React, { useState, useRef, useCallback } from 'react';
import { PencilLine, X, Search, CheckCircle, Upload, MapPin, Camera, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';

const AssessMyArea = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, uploading, scanning, complete, error
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [description, setDescription] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const { activeEventId, events } = useStore();

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
        }
    }, []);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude
                    });
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    setError('Could not get location. Please enter manually.');
                }
            );
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile || !activeEventId) {
            setError('Please select an event and upload a photo');
            return;
        }

        const lat = location?.lat || 0;
        const lon = location?.lon || 0;

        if (!lat || !lon) {
            setError('Please provide your location');
            return;
        }

        setStatus('uploading');
        setError(null);

        try {
            const formData = new FormData();
            formData.append('event_id', activeEventId);
            formData.append('lat', lat.toString());
            formData.append('lon', lon.toString());
            formData.append('description', description);
            formData.append('photo', selectedFile);

            const response = await fetch(`${apiUrl}/ground-truth/submit`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Submission failed');
            }

            const data = await response.json();
            setStatus('complete');
            setResult(data);
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.message || 'Failed to submit report');
            setStatus('error');
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreview(null);
        setLocation(null);
        setDescription('');
        setResult(null);
        setError(null);
        setStatus('idle');
    };

    const closePanel = () => {
        setIsOpen(false);
        resetForm();
    };

    const activeEvent = events.find(e => e.id === activeEventId);

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
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-sora font-semibold text-xl text-ghost flex items-center gap-3">
                            <Camera className="w-6 h-6 text-plasma" />
                            Ground Truth Report
                        </h2>
                        <button onClick={closePanel} className="text-gray-500 hover:text-white p-2">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Event Selection Notice */}
                    {!activeEventId && (
                        <div className="bg-alert-orange/10 border border-alert-orange/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-alert-orange" />
                            <p className="text-sm text-alert-orange">
                                Please select an active disaster event from the Live Monitor before submitting a report.
                            </p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <div className="space-y-4">
                            {activeEvent && (
                                <div className="bg-void/50 rounded-xl p-4 border border-gray-800">
                                    <div className="text-[10px] font-mono text-gray-500 mb-1">REPORTING FOR EVENT</div>
                                    <div className="text-sm font-sora text-ghost">{activeEvent.title}</div>
                                </div>
                            )}

                            {/* Drop Zone */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                                    preview ? 'border-plasma/50 bg-plasma/5' : 'border-gray-700 hover:border-plasma/30'
                                }`}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                                        <p className="text-sm font-sora text-gray-400">
                                            Drop an image or <span className="text-plasma">browse</span>
                                        </p>
                                        <p className="text-xs font-mono text-gray-600 mt-2">JPG, PNG up to 10MB</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {/* Location */}
                            <div className="flex gap-3">
                                <button
                                    onClick={getLocation}
                                    className="flex-1 bg-void border border-gray-700 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm text-gray-300 hover:border-plasma transition-colors"
                                >
                                    <MapPin className="w-4 h-4" />
                                    {location ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}` : 'Get My Location'}
                                </button>
                            </div>

                            {/* Description */}
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the damage you're observing..."
                                className="w-full bg-void border border-gray-700 rounded-xl px-4 py-3 text-sm text-ghost placeholder-gray-600 focus:border-plasma outline-none resize-none h-24"
                            />

                            {/* Error Display */}
                            {error && (
                                <div className="bg-alert-red/10 border border-alert-red/30 rounded-xl p-3 text-sm text-alert-red">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            {status === 'idle' && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedFile || !activeEventId}
                                    className="w-full btn-solid py-3 rounded-xl font-semibold btn-magnetic disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    SUBMIT GROUND REPORT
                                </button>
                            )}

                            {status === 'uploading' && (
                                <div className="bg-void/50 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-gray-600 border-t-plasma rounded-full animate-spin" />
                                    <span className="font-mono text-xs text-plasma animate-pulse tracking-widest uppercase">
                                        Uploading & Analyzing...
                                    </span>
                                </div>
                            )}

                            {status === 'complete' && result && (
                                <div className="bg-alert-green/10 border border-alert-green/30 rounded-xl p-4 flex flex-col items-center gap-3">
                                    <CheckCircle className="w-8 h-8 text-alert-green" />
                                    <span className="font-sora font-semibold text-ghost">Report Submitted</span>
                                    {result.damage_class !== undefined && (
                                        <span className="font-mono text-xs text-gray-400">
                                            AI Classification: Level {result.damage_class} damage
                                        </span>
                                    )}
                                    <button onClick={resetForm} className="text-xs font-mono text-plasma hover:underline">
                                        Submit Another Report
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Info Panel */}
                        <div className="bg-void/50 rounded-2xl border border-gray-800 p-5 font-mono text-xs text-gray-400 space-y-4">
                            <h3 className="text-sm font-sora font-semibold text-ghost mb-4">How It Works</h3>
                            
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <span className="text-plasma font-bold">1</span>
                                    <p>Upload a photo showing visible damage to structures or infrastructure.</p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-plasma font-bold">2</span>
                                    <p>Allow location access or manually enter coordinates.</p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-plasma font-bold">3</span>
                                    <p>Our AI analyzes the image and cross-references with satellite data.</p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-plasma font-bold">4</span>
                                    <p>Your report helps improve damage assessments for responders.</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800 space-y-2">
                                <div className="flex justify-between">
                                    <span>Rate Limit</span>
                                    <span className="text-ghost">10 reports/hour/event</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Privacy</span>
                                    <span className="text-alert-green">IP Hashed Only</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AssessMyArea;
