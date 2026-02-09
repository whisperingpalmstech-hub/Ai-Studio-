"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Eye, EyeOff, Check } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const supabase = getSupabaseClient();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Password validation
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast({
                variant: "destructive",
                title: "Invalid password",
                description: "Please meet all password requirements.",
            });
            return;
        }

        if (!acceptTerms) {
            toast({
                variant: "destructive",
                title: "Terms required",
                description: "Please accept the terms and conditions.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Registration failed",
                    description: error.message,
                });
                return;
            }

            if (data.user) {
                toast({
                    title: "Check your email",
                    description: "We've sent you a verification link to complete your registration.",
                });
                router.push("/login?message=check-email");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Something went wrong",
                description: "Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: "google" | "github") => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Registration failed",
                    description: error.message,
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Something went wrong",
                description: "Please try again later.",
            });
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem 0.875rem 2.75rem',
        fontSize: '1rem',
        color: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        outline: 'none',
        transition: 'all 0.2s ease',
    };

    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.875rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    };

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                Create an account
            </h1>
            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                Start creating amazing AI art for free
            </p>

            {/* OAuth Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                    style={{
                        ...buttonStyle,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isLoading}
                >
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </button>
                <button
                    style={{
                        ...buttonStyle,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    onClick={() => handleOAuthLogin("github")}
                    disabled={isLoading}
                >
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                </button>
            </div>

            {/* Divider */}
            <div style={{ position: 'relative', margin: '2rem 0' }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
                </div>
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <span style={{
                        padding: '0 0.75rem',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        color: '#6b7280',
                        backgroundColor: 'hsl(222, 47%, 6%)'
                    }}>
                        Or continue with email
                    </span>
                </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                        color: 'white'
                    }}>
                        Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                        <User style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '1.125rem',
                            height: '1.125rem',
                            color: '#6b7280'
                        }} />
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                        color: 'white'
                    }}>
                        Email
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Mail style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '1.125rem',
                            height: '1.125rem',
                            color: '#6b7280'
                        }} />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                        color: 'white'
                    }}>
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Lock style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '1.125rem',
                            height: '1.125rem',
                            color: '#6b7280'
                        }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                        <button
                            type="button"
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280',
                                padding: 0
                            }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff style={{ width: '1.125rem', height: '1.125rem' }} />
                            ) : (
                                <Eye style={{ width: '1.125rem', height: '1.125rem' }} />
                            )}
                        </button>
                    </div>

                    {/* Password Requirements */}
                    {password && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {[
                                { key: "length", label: "At least 8 characters" },
                                { key: "uppercase", label: "One uppercase letter" },
                                { key: "lowercase", label: "One lowercase letter" },
                                { key: "number", label: "One number" },
                            ].map(({ key, label }) => (
                                <div
                                    key={key}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: passwordChecks[key as keyof typeof passwordChecks] ? '#22c55e' : '#6b7280'
                                    }}
                                >
                                    <Check style={{ width: '0.75rem', height: '0.75rem' }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Terms Checkbox */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
                    <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        style={{ marginTop: '0.25rem' }}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        I agree to the{" "}
                        <Link href="/terms" style={{ color: '#818cf8', textDecoration: 'none' }}>
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" style={{ color: '#818cf8', textDecoration: 'none' }}>
                            Privacy Policy
                        </Link>
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={!acceptTerms || isLoading}
                    style={{
                        ...buttonStyle,
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
                        opacity: (!acceptTerms || isLoading) ? 0.7 : 1,
                        cursor: (!acceptTerms || isLoading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            {/* Sign in link */}
            <p style={{
                textAlign: 'center',
                fontSize: '0.875rem',
                color: '#9ca3af',
                marginTop: '2rem'
            }}>
                Already have an account?{" "}
                <Link
                    href="/login"
                    style={{
                        color: '#818cf8',
                        fontWeight: '500',
                        textDecoration: 'none'
                    }}
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
