import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";
import type { Database } from "@ai-studio/database";

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);
