"use client";

import { useState, useEffect } from "react";
import {
    Sparkles,
    Settings2,
    Shuffle,
    Download,
    Share2,
    Loader2,
    Image as ImageIcon,
    Wand2,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

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
    const [credits, setCredits] = useState<number>(100); // Default, will be fetched

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

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    negative_prompt: negativePrompt,
                    width: selectedAspect.width,
                    height: selectedAspect.height,
                    num_inference_steps: steps,
                    guidance_scale: cfgScale,
                    scheduler: "K_EULER",
                    seed: seed === -1 ? undefined : seed,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate image");
            }

            if (data.images && data.images.length > 0) {
                setGeneratedImage(data.images[0]);
            } else {
                throw new Error("No image returned from API");
            }

            // Update credits count
            if (data.credits !== undefined) {
                setCredits(data.credits);
            }

        } catch (error: any) {
            console.error("Generation error:", error);
            alert("Error: " + (error.message || "Something went wrong"));
        } finally {
            setIsGenerating(false);
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
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>Generate Image</h1>
                <p style={{ color: '#9ca3af' }}>
                    Describe what you want to create and let AI bring it to life.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Left Column - Input */}
                <div>
                    {/* Prompt Input */}
                    <div style={cardStyle}>
                        <label style={labelStyle}>
                            <Sparkles style={{ width: '1rem', height: '1rem', color: '#6366f1' }} />
                            Positive Prompt
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

                    {/* Aspect Ratio */}
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

                    {/* Advanced Settings Toggle */}
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

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
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
                            cursor: (!prompt.trim() || isGenerating) ? 'not-allowed' : 'pointer',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: 'white',
                            opacity: (!prompt.trim() || isGenerating) ? 0.7 : 1,
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
                                Generate Image
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
                                <button disabled style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'not-allowed' }}>
                                    <Download style={{ width: '1rem', height: '1rem' }} />
                                </button>
                                <button disabled style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'not-allowed' }}>
                                    <Share2 style={{ width: '1rem', height: '1rem' }} />
                                </button>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div
                            style={{
                                position: 'relative',
                                backgroundColor: 'rgba(15, 15, 35, 0.3)',
                                aspectRatio: `${selectedAspect.width}/${selectedAspect.height}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            {isGenerating ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ position: 'relative', width: '4rem', height: '4rem', marginBottom: '1rem' }}>
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '50%',
                                            border: '4px solid rgba(99, 102, 241, 0.3)',
                                            borderTopColor: '#6366f1',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                        Creating your masterpiece...
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
                </div>
            </div>
        </div>
    );
}
