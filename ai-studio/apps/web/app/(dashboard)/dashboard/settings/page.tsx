"use client";

import { useState, useEffect } from "react";
import { User, CreditCard, Key, Bell, Shield, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"profile" | "billing" | "api" | "notifications" | "security">("profile");
    const [profile, setProfile] = useState({ email: "", name: "", credits: 100 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profileData } = await supabase
                .from("profiles")
                .select("credits")
                .eq("id", user.id)
                .single();

            setProfile({
                email: user.email || "",
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || "",
                credits: profileData?.credits || 100
            });
        }
        setLoading(false);
    };

    const handleSignOut = async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    const tabs = [
        { id: "profile" as const, label: "Profile", icon: User },
        { id: "billing" as const, label: "Billing & Plans", icon: CreditCard },
        { id: "api" as const, label: "API Keys", icon: Key },
        { id: "notifications" as const, label: "Notifications", icon: Bell },
        { id: "security" as const, label: "Security", icon: Shield },
    ];

    return (
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                    Settings
                </h1>
                <p style={{ color: '#9ca3af' }}>
                    Manage your account and preferences
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                {/* Sidebar */}
                <div style={{
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    padding: '1rem',
                    height: 'fit-content'
                }}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    color: activeTab === tab.id ? '#6366f1' : '#9ca3af',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    marginBottom: '0.5rem',
                                    fontWeight: activeTab === tab.id ? 600 : 400,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div>
                    {activeTab === "profile" && (
                        <div style={{
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
                                Profile Information
                            </h2>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'white' }}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        backgroundColor: 'rgba(15, 15, 35, 0.6)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'white' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        backgroundColor: 'rgba(15, 15, 35, 0.3)',
                                        color: '#9ca3af',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        cursor: 'not-allowed'
                                    }}
                                />
                            </div>

                            <button style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}>
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div>
                            {/* Credits Card */}
                            <div style={{
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                                padding: '2rem',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <Sparkles style={{ width: '2rem', height: '2rem', color: '#6366f1' }} />
                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                                            Available Credits
                                        </div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
                                            {profile.credits}
                                        </div>
                                    </div>
                                </div>
                                <button style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}>
                                    Buy More Credits
                                </button>
                            </div>

                            {/* Subscription Plans */}
                            <div style={{
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                padding: '2rem'
                            }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
                                    Subscription Plans
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                    {[
                                        { name: "Free", price: "$0/mo", credits: "100 credits/mo", features: ["Basic models", "Standard support"] },
                                        { name: "Pro", price: "$29/mo", credits: "1,000 credits/mo", features: ["All models", "Priority support", "API access"] },
                                        { name: "Enterprise", price: "$99/mo", credits: "5,000 credits/mo", features: ["Custom models", "24/7 support", "Team workspace"] }
                                    ].map((plan) => (
                                        <div
                                            key={plan.name}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '0.75rem',
                                                border: plan.name === "Pro" ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                                                backgroundColor: plan.name === "Pro" ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                                            }}
                                        >
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                                                {plan.name}
                                            </h3>
                                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1', marginBottom: '0.5rem' }}>
                                                {plan.price}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
                                                {plan.credits}
                                            </div>
                                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                                                        ✓ {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                border: 'none',
                                                background: plan.name === "Pro" ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255, 255, 255, 0.1)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}>
                                                {plan.name === "Free" ? "Current Plan" : "Upgrade"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "api" && (
                        <div style={{
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
                                API Keys
                            </h2>
                            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                                Manage your API keys for programmatic access. Available on Pro plan and above.
                            </p>

                            <div style={{
                                padding: '2rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                textAlign: 'center'
                            }}>
                                <Key style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#6366f1', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'white' }}>
                                    Upgrade to Pro
                                </h3>
                                <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
                                    Get API access and integrate AI Studio into your applications
                                </p>
                                <button style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}>
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div style={{
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
                                Notification Preferences
                            </h2>

                            {[
                                { label: "Email notifications for completed generations", checked: true },
                                { label: "Weekly usage reports", checked: false },
                                { label: "New feature announcements", checked: true },
                                { label: "Billing and payment updates", checked: true },
                            ].map((pref, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem 0',
                                        borderBottom: idx < 3 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                                    }}
                                >
                                    <span style={{ color: 'white', fontSize: '0.875rem' }}>{pref.label}</span>
                                    <input type="checkbox" defaultChecked={pref.checked} style={{ width: '1.25rem', height: '1.25rem', accentColor: '#6366f1', cursor: 'pointer' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div style={{
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            padding: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
                                Security Settings
                            </h2>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'white' }}>
                                    Change Password
                                </h3>
                                <button style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}>
                                    Update Password
                                </button>
                            </div>

                            <div style={{
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                backgroundColor: 'rgba(239, 68, 68, 0.05)'
                            }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444' }}>
                                    Danger Zone
                                </h3>
                                <p style={{ color: '#9ca3af', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                    Once you delete your account, all data will be permanently removed.
                                </p>
                                <button
                                    onClick={handleSignOut}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid rgba(239, 68, 68, 0.5)',
                                        backgroundColor: 'transparent',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    <LogOut style={{ width: '1rem', height: '1rem' }} />
                                    Sign Out
                                </button>
                                <button style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(239, 68, 68, 0.5)',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
