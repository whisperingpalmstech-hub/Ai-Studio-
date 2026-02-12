"use client";

import { useState, useEffect, useRef } from "react";
import {
    Sparkles,
    Settings2,
    Shuffle,
    Download,
    Share2,
    Loader2,
    Image as ImageIcon,
    Wand2,
    Upload,
    Zap,
    Maximize,
    Brush,
    Trash2
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useWebSocket } from "@/lib/useWebSocket";

const MODES = [
    { id: "txt2img", label: "Text to Image", icon: Sparkles },
    { id: "img2img", label: "Image to Image", icon: ImageIcon },
    { id: "inpaint", label: "Inpainting", icon: Brush },
    { id: "upscale", label: "Upscale", icon: Maximize },
];

const SAMPLERS = [
    "Euler",
    "Euler a",
    "DPM++ 2M",
    "DPM++ 2M Karras",
    "DPM++ SDE",
    "DPM++ SDE Karras",
    "DDIM",
    "LMS",
];

const ASPECT_RATIOS = [
    { label: "1:1", width: 1024, height: 1024 },
    { label: "3:4", width: 768, height: 1024 },
    { label: "4:3", width: 1024, height: 768 },
    { label: "16:9", width: 1024, height: 576 },
    { label: "9:16", width: 576, height: 1024 },
];

export default function GeneratePage() {
    const [mode, setMode] = useState("txt2img");
    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedAspect, setSelectedAspect] = useState(ASPECT_RATIOS[0]);
    const [steps, setSteps] = useState(30);
    const [cfgScale, setCfgScale] = useState(7.5);
    const [seed, setSeed] = useState(-1);
    const [sampler, setSampler] = useState(SAMPLERS[0]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [credits, setCredits] = useState<number>(100);

    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");

    const [refreshKey, setRefreshKey] = useState(0);

    // WebSocket
    const { status: wsStatus, lastMessage } = useWebSocket();

    useEffect(() => {
        if (lastMessage) {
            console.log("WS Message:", lastMessage);
            if (lastMessage.type === 'job_progress') {
                if (lastMessage.progress !== undefined) {
                    setProgress(lastMessage.progress);
                }
                if (lastMessage.message) {
                    setStatusMessage(lastMessage.message);
                }
            } else if (lastMessage.type === 'job_complete') {
                if (lastMessage.result && lastMessage.result.file_path) {
                    setGeneratedImage(lastMessage.result.file_path);
                    setIsGenerating(false);
                    setProgress(100);
                    setStatusMessage("Generation Complete!");
                    setRefreshKey(prev => prev + 1); // Trigger refresh
                }
            } else if (lastMessage.type === 'job_failed') {
                setIsGenerating(false);
                setProgress(0);
                alert(`Job Failed: ${lastMessage.error}`);
            }
        }
    }, [lastMessage]);

    // Image Upload State
    const [inputImage, setInputImage] = useState<string | null>(null);
    const [maskImage, setMaskImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const maskInputRef = useRef<HTMLInputElement>(null);
    const [denoisingStrength, setDenoisingStrength] = useState(0.75);
    const [upscaleFactor, setUpscaleFactor] = useState(2);

    // Fetch user credits on page load
    useEffect(() => {
        const fetchCredits = async () => {
            const supabase = getSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("credits")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setCredits(profile.credits);
                }
            }
        };

        fetchCredits();
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "mask") => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (type === "image") setInputImage(event.target?.result as string);
                else setMaskImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && mode === "txt2img") return;
        if (!inputImage && (mode === "img2img" || mode === "inpaint" || mode === "upscale")) return;

        setIsGenerating(true);
        setGeneratedImage(null);
        setProgress(0);

        const initialStatus = mode === 'txt2img' ? 'Initiating creation...' :
            mode === 'img2img' ? 'Analyzing input image...' :
                mode === 'inpaint' ? 'Preparing mask region...' : 'Starting engine...';

        setStatusMessage(initialStatus);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: mode,
                    prompt,
                    negative_prompt: negativePrompt,
                    width: selectedAspect.width,
                    height: selectedAspect.height,
                    num_inference_steps: steps,
                    guidance_scale: cfgScale,
                    scheduler: "K_EULER",
                    seed: seed === -1 ? undefined : seed,
                    image: inputImage,
                    mask: maskImage,
                    denoising_strength: denoisingStrength,
                    upscale_factor: upscaleFactor,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate image");
            }

            if (data.images && data.images.length > 0) {
                setGeneratedImage(data.images[0]);
                setIsGenerating(false);
            } else if (data.status === "queued" || data.jobId) {
                // If queued, we rely on WebSocket for the rest of the updates
                setStatusMessage("Job submitted to queue...");
                // Note: Keep isGenerating(true)
            } else {
                throw new Error("No image returned from API");
                setIsGenerating(false);
            }

            // Update credits count
            if (data.credits !== undefined) {
                setCredits(data.credits);
            }

        } catch (error: any) {
            console.error("Generation error:", error);
            alert("Error: " + (error.message || "Something went wrong"));
            setIsGenerating(false);
        }
    }
    const handleDownload = async () => {
        if (!generatedImage) return;
        try {
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `generation-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            const a = document.createElement('a');
            a.href = generatedImage;
            a.download = `generation-${Date.now()}.png`;
            a.target = "_blank";
            a.click();
        }
    };

    const handleShare = async () => {
        if (!generatedImage) return;
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({
                    title: 'AI Generated Image',
                    text: 'Check out this image I generated with AI Studio!',
                    url: generatedImage,
                });
            } else {
                await navigator.clipboard.writeText(generatedImage);
                alert("Link copied to clipboard!");
            }
        } catch (error) {
            console.error("Share error:", error);
        }
    };


    const handleRandomSeed = () => {
        setSeed(Math.floor(Math.random() * 2147483647));
    };

    // Shared Styles
    const cardStyle = {
        borderRadius: '0.75rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
    };

    const labelStyle = {
        display: 'flex',
        fontSize: '0.875rem',
        fontWeight: 500,
        marginBottom: '0.75rem',
        color: 'white',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const textAreaStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(15, 15, 35, 0.6)',
        color: 'white',
        fontSize: '0.875rem',
        outline: 'none',
        resize: 'none' as const,
        fontFamily: 'inherit',
    };

    const inputStyle = {
        width: '100%',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(15, 15, 35, 0.6)',
        color: 'white',
        fontSize: '0.875rem',
        height: '2.5rem',
        outline: 'none',
    };

    return (
        <div style={{ maxWidth: '80rem', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white' }}>
                            Generate Image
                        </h1>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.75rem'
                        }}>
                            <div style={{
                                width: '0.5rem',
                                height: '0.5rem',
                                borderRadius: '50%',
                                backgroundColor: wsStatus === 'connected' ? '#10b981' : wsStatus === 'connecting' ? '#f59e0b' : '#ef4444',
                                boxShadow: wsStatus === 'connected' ? '0 0 8px #10b981' : 'none'
                            }} />
                            <span style={{ color: '#d1d5db', fontWeight: 500 }}>
                                {wsStatus === 'connected' ? 'Server Connected' : wsStatus === 'connecting' ? 'Connecting...' : 'Server Offline'}
                            </span>
                        </div>
                    </div>
                    <p style={{ color: '#9ca3af' }}>
                        Transform your ideas into stunning visual art with our advanced AI engine.
                    </p>
                </div>
                <div style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    backdropFilter: 'blur(8px)'
                }}>
                    <Zap size={18} style={{ color: '#6366f1' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', lineHeight: 1 }}>{credits}</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generations left</span>
                    </div>
                </div>
            </div>

            {/* Mode Selection Tabs */}
            <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.75rem',
                padding: '0.25rem',
                marginBottom: '2rem',
                gap: '0.25rem',
                overflowX: 'auto'
            }}>
                {MODES.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: mode === m.id ? '#6366f1' : 'transparent',
                            color: mode === m.id ? 'white' : '#9ca3af',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <m.icon size={16} />
                        {m.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Left Column - Input */}
                <div>

                    {/* Image Upload (for Img2Img / Inpaint / Upscale) */}
                    {(mode !== "txt2img") && (
                        <div style={cardStyle}>
                            <label style={labelStyle}>
                                <Upload size={16} color="#fbbf24" />
                                Input Image
                            </label>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    borderRadius: '0.75rem',
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    background: inputImage ? 'black' : 'rgba(0,0,0,0.2)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: '200px'
                                }}
                            >
                                {inputImage ? (
                                    <img src={inputImage} alt="Input" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                                ) : (
                                    <>
                                        <Upload size={32} color="#9ca3af" />
                                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Click to upload image</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "image")}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {mode === "upscale" && (
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={labelStyle}>Scale Factor</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {[1.5, 2, 4].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setUpscaleFactor(f)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    borderRadius: '0.5rem',
                                                    border: 'none',
                                                    backgroundColor: upscaleFactor === f ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {f}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(mode === "img2img" || mode === "upscale") && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Denoising Strength</label>
                                        <span style={{ fontSize: '0.875rem', color: 'white' }}>{denoisingStrength}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0} max={1} step={0.05}
                                        value={denoisingStrength}
                                        onChange={(e) => setDenoisingStrength(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#fbbf24' }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        {mode === "upscale" ? "Lower = Sharper original, Higher = AI adds more detail" : "Lower = closer to original, Higher = more creative"}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mask Upload (for Inpaint) */}
                    {mode === "inpaint" && (
                        <div style={cardStyle}>
                            <label style={labelStyle}>
                                <Brush size={16} color="#ec4899" />
                                Mask Image
                            </label>

                            <div
                                onClick={() => maskInputRef.current?.click()}
                                style={{
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    borderRadius: '0.75rem',
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    background: maskImage ? 'black' : 'rgba(0,0,0,0.2)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: '200px'
                                }}
                            >
                                {maskImage ? (
                                    <img src={maskImage} alt="Mask" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                                ) : (
                                    <>
                                        <Brush size={32} color="#9ca3af" />
                                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Click to upload mask (white = change)</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={maskInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "mask")}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Prompt Input */}
                    <div style={cardStyle}>
                        <label style={labelStyle}>
                            <Sparkles style={{ width: '1rem', height: '1rem', color: '#6366f1' }} />
                            Positive Prompt {mode === 'upscale' && '(Optional for detail)'}
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A majestic dragon soaring through a cyberpunk city at sunset, neon lights reflecting off its scales, cinematic lighting, highly detailed, 8k..."
                            style={{ ...textAreaStyle, height: '8rem', marginBottom: '0.75rem' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                {prompt.length} characters
                            </span>
                            <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                color: 'white',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.25rem',
                                cursor: 'pointer'
                            }}>
                                <Wand2 style={{ width: '0.75rem', height: '0.75rem' }} />
                                Enhance prompt
                            </button>
                        </div>
                    </div>

                    {/* Negative Prompt */}
                    <div style={cardStyle}>
                        <label style={labelStyle}>
                            🚫 Negative Prompt
                        </label>
                        <textarea
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            placeholder="blurry, low quality, distorted, ugly, bad anatomy..."
                            style={{ ...textAreaStyle, height: '5rem' }}
                        />
                    </div>

                    {/* Aspect Ratio (Only for Txt2Img usually, but can be target for others) */}
                    {mode === "txt2img" && (
                        <div style={cardStyle}>
                            <label style={labelStyle}>
                                Aspect Ratio
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {ASPECT_RATIOS.map((ratio) => (
                                    <button
                                        key={ratio.label}
                                        onClick={() => setSelectedAspect(ratio)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            border: 'none',
                                            cursor: 'pointer',
                                            backgroundColor: selectedAspect.label === ratio.label ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                                            color: selectedAspect.label === ratio.label ? 'white' : '#9ca3af',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {ratio.label}
                                    </button>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                {selectedAspect.width} × {selectedAspect.height} px
                            </p>
                        </div>
                    )}

                    {/* Advanced Settings Toggle */}
                    {mode !== "upscale" && (
                        <>
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#9ca3af',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    marginBottom: '1rem',
                                    padding: 0
                                }}
                            >
                                <Settings2 style={{ width: '1rem', height: '1rem' }} />
                                {showAdvanced ? "Hide" : "Show"} Advanced Settings
                            </button>

                            {/* Advanced Settings */}
                            {showAdvanced && (
                                <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Sampler */}
                                    <div>
                                        <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Sampler</label>
                                        <select
                                            value={sampler}
                                            onChange={(e) => setSampler(e.target.value)}
                                            style={inputStyle}
                                        >
                                            {SAMPLERS.map((s) => (
                                                <option key={s} value={s} style={{ backgroundColor: '#1e1b4b' }}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Steps */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label style={labelStyle}>Steps</label>
                                            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{steps}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={1}
                                            max={150}
                                            value={steps}
                                            onChange={(e) => setSteps(Number(e.target.value))}
                                            style={{ width: '100%', accentColor: '#6366f1' }}
                                        />
                                    </div>

                                    {/* CFG Scale */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label style={labelStyle}>CFG Scale</label>
                                            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{cfgScale}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={1}
                                            max={30}
                                            step={0.5}
                                            value={cfgScale}
                                            onChange={(e) => setCfgScale(Number(e.target.value))}
                                            style={{ width: '100%', accentColor: '#6366f1' }}
                                        />
                                    </div>

                                    {/* Seed */}
                                    <div>
                                        <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Seed</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="number"
                                                value={seed}
                                                onChange={(e) => setSeed(Number(e.target.value))}
                                                placeholder="-1 for random"
                                                style={inputStyle}
                                            />
                                            <button
                                                onClick={handleRandomSeed}
                                                style={{
                                                    padding: '0 0.75rem',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    background: 'transparent',
                                                    color: 'white',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Shuffle style={{ width: '1rem', height: '1rem' }} />
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                            -1 for random seed
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || (mode === "txt2img" && !prompt.trim()) || ((mode === "img2img" || mode === "upscale") && !inputImage)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: (isGenerating || (mode === "txt2img" && !prompt.trim()) || ((mode === "img2img" || mode === "upscale") && !inputImage)) ? 'not-allowed' : 'pointer',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: 'white',
                            opacity: (isGenerating || (mode === "txt2img" && !prompt.trim()) || ((mode === "img2img" || mode === "upscale") && !inputImage)) ? 0.7 : 1,
                            boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
                            marginBottom: '1rem'
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" style={{ width: '1.25rem', height: '1.25rem' }} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} />
                                Generate
                            </>
                        )}
                    </button>

                    <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#9ca3af' }}>
                        This will use 1 credit • You have {credits} credits remaining
                    </p>
                </div>

                {/* Right Column - Preview */}
                <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                    <div style={{
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        overflow: 'hidden'
                    }}>
                        {/* Preview Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white' }}>Preview</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    onClick={() => alert("To delete this image, please use the trash icon in the 'Recent Generations' section below.")}
                                    disabled={!generatedImage}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: generatedImage ? '#ef4444' : '#9ca3af',
                                        cursor: generatedImage ? 'pointer' : 'not-allowed',
                                        padding: '0.25rem'
                                    }}
                                    title="Delete Generation"
                                >
                                    <Trash2 style={{ width: '1.1rem', height: '1.1rem' }} />
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={!generatedImage}
                                    style={{ background: 'transparent', border: 'none', color: generatedImage ? 'white' : '#9ca3af', cursor: generatedImage ? 'pointer' : 'not-allowed' }}
                                    title="Download Image"
                                >
                                    <Download style={{ width: '1rem', height: '1rem' }} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={!generatedImage}
                                    style={{ background: 'transparent', border: 'none', color: generatedImage ? 'white' : '#9ca3af', cursor: generatedImage ? 'pointer' : 'not-allowed' }}
                                    title="Share Image"
                                >
                                    <Share2 style={{ width: '1rem', height: '1rem' }} />
                                </button>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div
                            style={{
                                position: 'relative',
                                backgroundColor: 'rgba(15, 15, 35, 0.3)',
                                aspectRatio: mode === 'txt2img' ? `${selectedAspect.width}/${selectedAspect.height}` : 'auto',
                                minHeight: '350px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            {isGenerating ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    padding: '2rem'
                                }}>
                                    <div style={{ position: 'relative', width: '5rem', height: '5rem', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '50%',
                                            border: '3px solid rgba(99, 102, 241, 0.1)',
                                            borderTopColor: '#6366f1',
                                            animation: 'spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            inset: '4px',
                                            borderRadius: '50%',
                                            border: '3px solid rgba(168, 85, 247, 0.1)',
                                            borderBottomColor: '#a855f7',
                                            animation: 'spin 2s cubic-bezier(0.4, 0, 0.2, 1) reverse infinite'
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.875rem',
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}>
                                            {progress}%
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                                        {statusMessage || "Processing Image..."}
                                    </h3>

                                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                        Please wait while your image is generating...
                                    </p>

                                    <div style={{
                                        width: '100%',
                                        maxWidth: '20rem',
                                        height: '6px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div style={{
                                            width: `${progress}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                                            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: '0 0 15px rgba(99, 102, 241, 0.6)'
                                        }} />
                                    </div>
                                    <span style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                        {progress}% COMPLETED
                                    </span>

                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                        Our AI is meticulously crafting your request.
                                    </p>

                                    <style jsx>{`
                                        @keyframes spin {
                                            from { transform: rotate(0deg); }
                                            to { transform: rotate(360deg); }
                                        }
                                    `}</style>
                                </div>
                            ) : generatedImage ? (
                                <img
                                    src={generatedImage}
                                    alt="Generated artwork"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                                    <ImageIcon style={{ width: '4rem', height: '4rem', marginBottom: '1rem', opacity: 0.5 }} />
                                    <p style={{ fontSize: '0.875rem' }}>Your generated image will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Generation Info */}
                    {generatedImage && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'white' }}>Generation Settings</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                                <div>Size: {selectedAspect.width}×{selectedAspect.height}</div>
                                <div>Steps: {steps}</div>
                                <div>Sampler: {sampler}</div>
                                <div>CFG: {cfgScale}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Recent Generations Section */}
            <div style={{ marginTop: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Recent Generations</h2>
                    <button
                        onClick={() => window.location.href = '/dashboard/gallery'}
                        style={{
                            fontSize: '0.875rem',
                            color: '#6366f1',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        View All
                    </button>
                </div>

                <RecentGenerationsGrid refreshKey={refreshKey} />
            </div>
        </div>
    );
}

function RecentGenerationsGrid({ refreshKey }: { refreshKey: number }) {
    const [recent, setRecent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [localRefresh, setLocalRefresh] = useState(0);

    useEffect(() => {
        const fetchRecent = async () => {
            const supabase = getSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('assets')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('type', 'image')
                    .order('created_at', { ascending: false })
                    .limit(6);

                if (data) setRecent(data);
            }
            setLoading(false);
        };
        fetchRecent();
    }, [refreshKey, localRefresh]);

    const handleDelete = async (e: React.MouseEvent, jobId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this generation?")) return;

        try {
            const supabase = getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const API_URL = "http://localhost:4000/api/v1";
            const response = await fetch(`${API_URL}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                setLocalRefresh(prev => prev + 1);
            } else {
                alert("Failed to delete generation");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting generation");
        }
    };

    if (loading) return <div style={{ color: '#9ca3af' }}>Loading recent...</div>;
    if (recent.length === 0) return <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>No recent generations yet.</div>;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.5rem'
        }}>
            {recent.map((gen) => (
                <div
                    key={gen.id}
                    style={{
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        aspectRatio: '1/1',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        cursor: 'default',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.borderColor = '#6366f1';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                >
                    <img
                        src={gen.file_path}
                        alt={gen.prompt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={(e) => handleDelete(e, gen.job_id)}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    padding: '0.4rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#ef4444';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                title="Delete Generation"
                            >
                                <Trash2 style={{ width: '0.9rem', height: '0.9rem' }} />
                            </button>
                        </div>
                        <p style={{
                            color: 'white',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {gen.prompt}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
