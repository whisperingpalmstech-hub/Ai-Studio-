import Link from "next/link";
import {
    Sparkles,
    Zap,
    Layers,
    Shield,
    Video,
    Palette,
    ArrowRight,
    ChevronRight,
    Play,
    Star,
} from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'hsl(222, 47%, 6%)' }}>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50" style={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(15, 15, 35, 0.8)',
                backdropFilter: 'blur(16px)'
            }}>
                <div className="container-custom" style={{ display: 'flex', height: '4rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <div className="logo-icon">
                            <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>AI Studio</span>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <Link href="#features" className="nav-link">Features</Link>
                        <Link href="#pricing" className="nav-link">Pricing</Link>
                        <Link href="#docs" className="nav-link">Docs</Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Link href="/login">
                            <button className="btn-outline btn-sm">Sign In</button>
                        </Link>
                        <Link href="/register">
                            <button className="btn-primary btn-sm">
                                Get Started
                                <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem' }}>
                {/* Background Effects */}
                <div className="mesh-bg" style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, transparent, rgba(15, 15, 35, 0.5), hsl(222, 47%, 6%))' }} />

                {/* Animated Orbs */}
                <div style={{ pointerEvents: 'none', position: 'absolute', top: '25%', left: '25%', width: '24rem', height: '24rem', borderRadius: '50%', filter: 'blur(48px)', background: 'rgba(99, 102, 241, 0.2)' }} />
                <div style={{ pointerEvents: 'none', position: 'absolute', bottom: '25%', right: '25%', width: '20rem', height: '20rem', borderRadius: '50%', filter: 'blur(48px)', background: 'rgba(168, 85, 247, 0.2)' }} />

                <div className="relative z-10" style={{
                    position: 'relative',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 1.5rem',
                    width: '100%'
                }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        borderRadius: '9999px',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '0.375rem 1rem',
                        marginBottom: '2rem'
                    }}>
                        <Sparkles style={{ width: '1rem', height: '1rem', color: '#818cf8' }} />
                        <span style={{ fontSize: '0.875rem', color: '#a5b4fc' }}>Enterprise-Grade AI Generation</span>
                    </div>

                    {/* Main Heading */}
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 'bold', lineHeight: '1.1', marginBottom: '1.5rem', color: 'white' }}>
                        Create Stunning AI Art
                        <br />
                        <span className="gradient-text">In Your Browser</span>
                    </h1>

                    {/* Subheading */}
                    <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#9ca3af', maxWidth: '42rem', margin: '0 auto 2.5rem auto' }}>
                        The most powerful web-based AI image and video generation platform.
                        Node-based workflows, custom models, LoRAs, and ControlNet support.
                        No installation required.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
                        <Link href="/register">
                            <button className="btn-primary" style={{ minWidth: '200px', fontSize: '1.125rem' }}>
                                Start Creating Free
                                <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
                            </button>
                        </Link>
                        <button className="btn-outline" style={{ minWidth: '200px', fontSize: '1.125rem' }}>
                            <Play style={{ width: '1.25rem', height: '1.25rem' }} />
                            Watch Demo
                        </button>
                    </div>

                    {/* Social Proof */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar-stack">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="avatar" />
                            ))}
                            <div style={{
                                display: 'flex',
                                width: '2.5rem',
                                height: '2.5rem',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '9999px',
                                border: '2px solid hsl(222, 47%, 6%)',
                                background: 'hsl(217, 33%, 17%)',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#9ca3af',
                                marginLeft: '-0.75rem'
                            }}>
                                +2k
                            </div>
                        </div>
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="star" style={{ width: '1.25rem', height: '1.25rem', fill: '#facc15' }} />
                            ))}
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                                Loved by 2,000+ creators
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '8rem 0', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div className="container-custom">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
                            Everything You Need to Create
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: '#9ca3af', maxWidth: '42rem', margin: '0 auto' }}>
                            Professional-grade tools for both beginners and experts.
                            No compromises on power or simplicity.
                        </p>
                    </div>

                    <div className="grid-features">
                        {[
                            {
                                icon: Zap,
                                title: "Lightning Fast",
                                description: "Generate high-quality images in seconds with optimized GPU infrastructure.",
                                gradient: "linear-gradient(135deg, #eab308, #f97316)",
                            },
                            {
                                icon: Layers,
                                title: "Node-Based Workflows",
                                description: "Build complex generation pipelines with our visual workflow editor.",
                                gradient: "linear-gradient(135deg, #6366f1, #3b82f6)",
                            },
                            {
                                icon: Palette,
                                title: "Custom Models",
                                description: "Upload and use your own checkpoints, LoRAs, and embeddings.",
                                gradient: "linear-gradient(135deg, #a855f7, #ec4899)",
                            },
                            {
                                icon: Shield,
                                title: "Enterprise Security",
                                description: "SSO, RBAC, audit logs, and compliance features built-in.",
                                gradient: "linear-gradient(135deg, #22c55e, #14b8a6)",
                            },
                            {
                                icon: Video,
                                title: "Video Generation",
                                description: "Create stunning AI videos with Stable Video Diffusion and AnimateDiff.",
                                gradient: "linear-gradient(135deg, #ef4444, #f43f5e)",
                            },
                            {
                                icon: Sparkles,
                                title: "ControlNet Support",
                                description: "Precise control over your generations with ControlNet integration.",
                                gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                            },
                        ].map((feature, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon" style={{ background: feature.gradient }}>
                                    <feature.icon style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>{feature.title}</h3>
                                <p style={{ color: '#9ca3af' }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden" style={{ padding: '8rem 0' }}>
                <div className="mesh-bg absolute inset-0" style={{ opacity: 0.5 }} />
                <div className="container-custom relative z-10" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
                        Ready to Create?
                    </h2>
                    <p style={{ fontSize: '1.125rem', color: '#9ca3af', maxWidth: '36rem', margin: '0 auto 2.5rem auto' }}>
                        Join thousands of creators using AI Studio to bring their imagination to life.
                        Start for free, no credit card required.
                    </p>
                    <Link href="/register">
                        <button className="btn-primary" style={{ fontSize: '1.125rem' }}>
                            Get Started Free
                            <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '3rem 0' }}>
                <div className="container-custom" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="logo-icon" style={{ width: '2rem', height: '2rem' }}>
                            <Sparkles style={{ width: '1rem', height: '1rem', color: 'white' }} />
                        </div>
                        <span style={{ fontWeight: '600', color: 'white' }}>AI Studio</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        © 2026 AI Studio. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
