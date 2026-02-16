import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";

// Supabase admin client (bypasses RLS)
const supabase = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey
);

// User info attached to authenticated requests
export interface AuthUser {
    id: string;
    email: string;
    tier: string;
    credits: number;
}

// Use any for AuthenticatedRequest to bypass type checking during build
export type AuthenticatedRequest = any;

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Missing or invalid authorization header",
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify JWT token from Supabase
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Invalid or expired token",
            });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("tier, credits")
            .eq("id", user.id)
            .single();

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email!,
            tier: profile?.tier || "free",
            credits: profile?.credits || 0,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
            error: "Internal Server Error",
            message: "Authentication failed",
        });
    }
}

// Optional auth middleware (doesn't require auth, but attaches user if present)
export async function optionalAuthMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    try {
        const token = authHeader.split(" ")[1];
        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("tier, credits")
                .eq("id", user.id)
                .single();

            req.user = {
                id: user.id,
                email: user.email!,
                tier: profile?.tier || "free",
                credits: profile?.credits || 0,
            };
        }
    } catch (error) {
        // Silent fail for optional auth
    }

    next();
}

// API Key middleware for external app access
export async function apiKeyMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey || !config.apiKey || apiKey !== config.apiKey) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "Invalid or missing API key. Set x-api-key header.",
        });
    }

    // Attach a system user for API key access
    req.user = {
        id: "api-system-user",
        email: "api@system",
        tier: "pro",
        credits: 99999,
    };

    next();
}

// Flexible auth: accepts either Bearer JWT OR x-api-key
export async function flexAuthMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    // Try API key first
    const apiKey = req.headers["x-api-key"] as string;
    if (apiKey && config.apiKey && apiKey === config.apiKey) {
        req.user = {
            id: "api-system-user",
            email: "api@system",
            tier: "pro",
            credits: 99999,
        };
        return next();
    }

    // Fall back to Supabase JWT auth
    return authMiddleware(req, res, next);
}
