import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
    Sparkles,
    ImageIcon,
    Layers,
    TrendingUp,
    Clock,
    Zap,
    ArrowRight,
    Plus,
} from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch Stats in parallel
    const [
        { count: generationCount },
        { count: workflowCount },
        { data: profile },
        { data: recentGenerations }
    ] = await Promise.all([
        supabase.from('assets').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'image'),
        supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('profiles').select('credits').eq('id', user.id).single(),
        supabase.from('assets').select('*').eq('user_id', user.id).eq('type', 'image').order('created_at', { ascending: false }).limit(4)
    ]);

    const credits = (profile as any)?.credits || 0;
    const timeSaved = Math.round((generationCount || 0) * 0.5); // Assume 30 mins saved per image vs manual creation
    const gens = (recentGenerations as any[]) || [];

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white' }}>Welcome back!</h1>
                    <p style={{ color: '#9ca3af', marginTop: '0.25rem' }}>
                        Here's what's happening with your AI creations.
                    </p>
                </div>
                <Link href="/dashboard/generate" style={{ textDecoration: 'none' }}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                    }}>
                        <Plus style={{ width: '1rem', height: '1rem' }} />
                        New Generation
                    </button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {[
                    {
                        label: "Total Generations",
                        value: generationCount || "0",
                        change: "Keep creating!",
                        icon: ImageIcon,
                        gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                    },
                    {
                        label: "Workflows Created",
                        value: workflowCount || "0",
                        change: workflowCount ? "Great start" : "Try the editor",
                        icon: Layers,
                        gradient: "linear-gradient(135deg, #6366f1, #a855f7)",
                    },
                    {
                        label: "Credits Remaining",
                        value: credits,
                        change: "Resets in 30 days",
                        icon: Zap,
                        gradient: "linear-gradient(135deg, #eab308, #f97316)",
                    },
                    {
                        label: "Time Saved",
                        value: `${timeSaved} hrs`,
                        change: "vs manual creation",
                        icon: Clock,
                        gradient: "linear-gradient(135deg, #22c55e, #10b981)",
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        style={{
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            padding: '1.5rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{stat.label}</span>
                            <div
                                style={{
                                    height: '2.5rem',
                                    width: '2.5rem',
                                    borderRadius: '0.5rem',
                                    background: stat.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <stat.icon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'white' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{stat.change}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <Link href="/dashboard/generate" style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        padding: '1.5rem',
                        height: '100%',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                height: '3rem',
                                width: '3rem',
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, color: 'white' }}>Text to Image</h3>
                                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                    Generate images from text prompts
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#818cf8' }}>
                            Start generating
                            <ArrowRight style={{ marginLeft: '0.5rem', width: '1rem', height: '1rem' }} />
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/workflows" style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        padding: '1.5rem',
                        height: '100%',
                        cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                height: '3rem',
                                width: '3rem',
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Layers style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, color: 'white' }}>Workflow Editor</h3>
                                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                    Build complex generation pipelines
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#818cf8' }}>
                            Create workflow
                            <ArrowRight style={{ marginLeft: '0.5rem', width: '1rem', height: '1rem' }} />
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/models" style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        padding: '1.5rem',
                        height: '100%',
                        cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                height: '3rem',
                                width: '3rem',
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, #22c55e, #10b981)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, color: 'white' }}>Explore Models</h3>
                                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                    Browse checkpoints, LoRAs & more
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#818cf8' }}>
                            Browse models
                            <ArrowRight style={{ marginLeft: '0.5rem', width: '1rem', height: '1rem' }} />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Generations */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Recent Generations</h2>
                    <Link href="/dashboard/gallery" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer'
                        }}>
                            View all
                            <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                        </button>
                    </Link>
                </div>

                {(!gens || gens.length === 0) ? (
                    /* Empty State */
                    <div style={{
                        borderRadius: '0.75rem',
                        border: '1px dashed rgba(255, 255, 255, 0.2)',
                        backgroundColor: 'rgba(255, 255, 255, 0.01)',
                        padding: '3rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            margin: '0 auto 1rem auto',
                            height: '4rem',
                            width: '4rem',
                            borderRadius: '1rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ImageIcon style={{ width: '2rem', height: '2rem', color: '#6b7280' }} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'white' }}>No generations yet</h3>
                        <p style={{ color: '#9ca3af', marginBottom: '1rem', maxWidth: '24rem', margin: '0 auto 1.5rem auto' }}>
                            Start creating amazing AI art by describing what you want to see.
                        </p>
                        <Link href="/dashboard/generate" style={{ textDecoration: 'none' }}>
                            <button style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                border: 'none',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                            }}>
                                <Sparkles style={{ width: '1rem', height: '1rem' }} />
                                Create Your First Image
                            </button>
                        </Link>
                    </div>
                ) : (
                    /* Generations Grid */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {gens.map((gen) => (
                            <Link href="/dashboard/gallery" key={gen.id} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ position: 'relative', paddingTop: '100%', backgroundColor: '#1a1a2e' }}>
                                        <img
                                            src={gen.file_path}
                                            alt={gen.prompt || "Generated image"}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: 'white',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {gen.prompt || "No prompt available"}
                                        </p>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                            {new Date(gen.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
