import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            backgroundColor: 'hsl(222, 47%, 6%)'
        }}>
            {/* Left side - Auth Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div style={{ width: '100%', maxWidth: '28rem' }}>
                    {/* Logo */}
                    <Link href="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '3rem',
                        textDecoration: 'none'
                    }}>
                        <div style={{
                            display: 'flex',
                            width: '2.75rem',
                            height: '2.75rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)'
                        }}>
                            <Sparkles style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                        </div>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>AI Studio</span>
                    </Link>

                    {children}
                </div>
            </div>

            {/* Right side - Decorative */}
            <div style={{
                flex: 1,
                position: 'relative',
                display: 'none',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #1e1b4b, hsl(222, 47%, 6%))'
            }} className="lg-show">
                {/* Mesh gradient overlay */}
                <div className="mesh-bg" style={{ position: 'absolute', inset: 0 }} />

                {/* Animated orbs */}
                <div style={{
                    position: 'absolute',
                    top: '25%',
                    right: '25%',
                    width: '18rem',
                    height: '18rem',
                    background: 'rgba(99, 102, 241, 0.3)',
                    borderRadius: '50%',
                    filter: 'blur(48px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '33%',
                    left: '25%',
                    width: '15rem',
                    height: '15rem',
                    background: 'rgba(168, 85, 247, 0.3)',
                    borderRadius: '50%',
                    filter: 'blur(48px)'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '33%',
                    width: '12rem',
                    height: '12rem',
                    background: 'rgba(236, 72, 153, 0.2)',
                    borderRadius: '50%',
                    filter: 'blur(48px)'
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem',
                    textAlign: 'center',
                    height: '100%'
                }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
                        Create <span className="gradient-text">Amazing</span> AI Art
                    </h2>
                    <p style={{ fontSize: '1.125rem', color: '#9ca3af', maxWidth: '28rem' }}>
                        Join thousands of creators using AI Studio to generate stunning images and videos.
                    </p>

                    {/* Feature highlights */}
                    <div style={{
                        marginTop: '3rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem',
                        textAlign: 'left'
                    }}>
                        {[
                            "Text to Image",
                            "Custom Models",
                            "ControlNet",
                            "Video Generation",
                        ].map((feature) => (
                            <div
                                key={feature}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#9ca3af'
                                }}
                            >
                                <div style={{
                                    width: '0.375rem',
                                    height: '0.375rem',
                                    borderRadius: '50%',
                                    background: '#6366f1'
                                }} />
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid pattern */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
                    <svg style={{ width: '100%', height: '100%' }}>
                        <pattern
                            id="grid"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="white"
                                strokeWidth="1"
                            />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
