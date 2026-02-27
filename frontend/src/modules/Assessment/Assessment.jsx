import React, { useMemo, useState } from 'react';
import { Upload, Radar, AlertTriangle, Landmark, ShieldCheck } from 'lucide-react';

const formatCurrency = (value) => {
    if (typeof value !== 'number') return '—';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);
};

const formatPercent = (value) => {
    if (typeof value !== 'number') return '—';
    return `${(value * 100).toFixed(1)}%`;
};

const formatNumber = (value, decimals = 2) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '—';
    return value.toFixed(decimals);
};

const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
};

const Assessment = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [requestMeta, setRequestMeta] = useState(null);

    const aiServerBaseUrl = import.meta.env.VITE_AI_SERVER_URL || 'http://127.0.0.1:5000';

    const prediction = result?.predictions?.[0];
    const assessment = prediction?.assessment;
    const detections = prediction?.detections || [];
    const classification = prediction?.classification;

    const topDetection = useMemo(() => {
        if (!detections.length) return null;
        return [...detections].sort((first, second) => second.confidence - first.confidence)[0];
    }, [detections]);

    const onSelectFile = (event) => {
        const file = event.target.files?.[0];
        setError('');
        setResult(null);
        setRequestMeta(null);

        if (!file) {
            setSelectedFile(null);
            setPreviewUrl('');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            setSelectedFile(null);
            setPreviewUrl('');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const runAssessment = async () => {
        if (!selectedFile) {
            setError('Please upload an image first.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        const startTime = performance.now();
        const requestedAt = new Date().toISOString();

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await fetch(`${aiServerBaseUrl}/predict`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`AI server returned ${response.status}`);
            }

            const json = await response.json();
            setResult(json);
            setRequestMeta({
                requestedAt,
                fileName: selectedFile.name,
                fileSizeBytes: selectedFile.size,
                endpoint: `${aiServerBaseUrl}/predict`,
                responseStatus: response.status,
                latencyMs: Math.round(performance.now() - startTime),
            });
        } catch (requestError) {
            setError(`Assessment failed. ${requestError.message || 'Please check AI server connectivity.'}`);
            setRequestMeta({
                requestedAt,
                fileName: selectedFile.name,
                fileSizeBytes: selectedFile.size,
                endpoint: `${aiServerBaseUrl}/predict`,
                responseStatus: 'failed',
                latencyMs: Math.round(performance.now() - startTime),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
            <div className="bg-graphite rounded-3xl border border-gray-800 p-6 shadow-glow flex flex-col">
                <h2 className="font-sora font-semibold text-xl text-ghost mb-2 flex items-center gap-2">
                    <Radar className="w-5 h-5 text-plasma" />
                    Infrastructure Assessment
                </h2>
                <p className="font-mono text-xs text-gray-400 mb-5 uppercase tracking-wider">
                    Upload disaster imagery to run AI damage analysis
                </p>

                <label className="border border-dashed border-plasma/40 rounded-2xl p-6 bg-void/40 hover:border-plasma transition-colors cursor-pointer mb-4">
                    <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
                    <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-plasma" />
                        <div>
                            <p className="font-sora text-sm text-ghost">Choose disaster image</p>
                            <p className="font-mono text-xs text-gray-500">JPG / PNG / WEBP</p>
                        </div>
                    </div>
                </label>

                <div className="flex-1 rounded-2xl border border-gray-800 bg-void/50 overflow-hidden flex items-center justify-center">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Assessment preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">No image selected</span>
                    )}
                </div>

                {error && <p className="mt-3 text-xs text-alert-red font-mono">{error}</p>}

                <button
                    onClick={runAssessment}
                    disabled={loading}
                    className="mt-4 py-3 rounded-xl btn-solid font-sora font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? 'Running Assessment...' : 'Run Assessment'}
                </button>
            </div>

            <div className="bg-graphite rounded-3xl border border-gray-800 p-6 shadow-glow overflow-y-auto custom-scrollbar">
                <h3 className="font-sora font-semibold text-lg text-ghost mb-4">Assessment Output</h3>

                {!result && !loading && (
                    <div className="h-[70%] flex items-center justify-center text-center border border-gray-800 rounded-2xl bg-void/30">
                        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest px-6">
                            Upload an image and run assessment to view AI response
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="h-[70%] flex flex-col items-center justify-center gap-3 border border-gray-800 rounded-2xl bg-void/30">
                        <div className="w-7 h-7 border-2 border-gray-700 border-t-plasma rounded-full animate-spin" />
                        <p className="font-mono text-xs text-plasma uppercase tracking-widest">Analyzing image...</p>
                    </div>
                )}

                {!!result && (
                    <div className="space-y-4 text-sm">
                        <div className="bg-void/40 border border-gray-800 rounded-xl p-4">
                            <h4 className="font-sora font-semibold text-ghost mb-2">Request Trace</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs text-gray-400">
                                <p>File: <span className="text-ghost">{requestMeta?.fileName || '—'}</span></p>
                                <p>Size: <span className="text-ghost">{requestMeta?.fileSizeBytes?.toLocaleString?.() || '—'} bytes</span></p>
                                <p>Status: <span className="text-ghost">{requestMeta?.responseStatus ?? '—'}</span></p>
                                <p>Latency: <span className="text-ghost">{requestMeta?.latencyMs ?? '—'} ms</span></p>
                                <p className="md:col-span-2">Time: <span className="text-ghost">{formatDateTime(requestMeta?.requestedAt)}</span></p>
                                <p className="md:col-span-2">Endpoint: <span className="text-ghost">{requestMeta?.endpoint || '—'}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-void/50 border border-gray-800 rounded-xl p-4">
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Risk Level</p>
                                <p className="font-sora text-lg text-ghost">{assessment?.risk_level ?? '—'}</p>
                            </div>
                            <div className="bg-void/50 border border-gray-800 rounded-xl p-4">
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Damage Score</p>
                                <p className="font-sora text-lg text-ghost">{formatNumber(assessment?.damage_score, 2)}</p>
                            </div>
                            <div className="bg-void/50 border border-gray-800 rounded-xl p-4">
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Economic Loss (INR)</p>
                                <p className="font-sora text-lg text-ghost">{formatCurrency(assessment?.estimated_economic_loss_inr)}</p>
                            </div>
                            <div className="bg-void/50 border border-gray-800 rounded-xl p-4">
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Affected Area</p>
                                <p className="font-sora text-lg text-ghost">{formatPercent(assessment?.affected_area_ratio)}</p>
                            </div>
                        </div>

                        <div className="bg-void/40 border border-gray-800 rounded-xl p-4">
                            <h4 className="font-sora font-semibold text-ghost mb-2">Classification</h4>
                            <p className="font-mono text-xs text-gray-300">
                                {classification
                                    ? `${classification.top1_class_name ?? 'unknown'} (${formatPercent(classification.top1_confidence)})`
                                    : 'No classification returned by model for this input.'}
                            </p>
                        </div>

                        <div className="bg-void/40 border border-gray-800 rounded-xl p-4">
                            <h4 className="font-sora font-semibold text-ghost mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-alert-red" />
                                Primary Detection
                            </h4>
                            <p className="font-mono text-xs text-gray-300">
                                {topDetection
                                    ? `${topDetection.class_name} (${(topDetection.confidence * 100).toFixed(1)}% confidence)`
                                    : 'No detection found'}
                            </p>
                        </div>

                        <div className="bg-void/40 border border-gray-800 rounded-xl p-4">
                            <h4 className="font-sora font-semibold text-ghost mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-plasma" />
                                Recommended Response
                            </h4>
                            <p className="font-mono text-xs text-gray-300 mb-2">
                                NDRF Teams: <span className="text-ghost">{assessment?.recommended_ndrf_teams ?? '—'}</span>
                            </p>
                            <p className="font-mono text-xs text-gray-500">{assessment?.assessment_note || 'No note provided.'}</p>
                        </div>

                        <div className="bg-void/40 border border-gray-800 rounded-xl p-4">
                            <h4 className="font-sora font-semibold text-ghost mb-2 flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-plasma" />
                                Detections
                            </h4>
                            <p className="font-mono text-xs text-gray-300 mb-2">{detections.length} detected region(s)</p>
                            {detections.length > 0 ? (
                                <div className="space-y-1">
                                    {detections.slice(0, 5).map((detection, index) => (
                                        <p key={`${detection.class_name}-${index}`} className="font-mono text-[11px] text-gray-400">
                                            {detection.class_name} | conf: {formatPercent(detection.confidence)} | area: {formatPercent(detection.bbox_area_ratio)}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <p className="font-mono text-[11px] text-gray-500">No detections for this image; model returned baseline assessment.</p>
                            )}
                        </div>

                        <div className="bg-void/40 border border-gray-800 rounded-xl p-4">
                            <h4 className="font-sora font-semibold text-ghost mb-2">Raw API JSON</h4>
                            <pre className="font-mono text-[11px] text-gray-400 whitespace-pre-wrap break-words max-h-64 overflow-auto custom-scrollbar">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assessment;
