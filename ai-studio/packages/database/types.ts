// Auto-generated Supabase types
// Run: pnpm db:generate to update after schema changes

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    tier: "free" | "standard" | "pro" | "enterprise";
                    credits: number;
                    role: "user" | "admin" | "team_admin" | "viewer";
                    metadata: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    tier?: "free" | "standard" | "pro" | "enterprise";
                    credits?: number;
                    role?: "user" | "admin" | "team_admin" | "viewer";
                    metadata?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    tier?: "free" | "standard" | "pro" | "enterprise";
                    credits?: number;
                    role?: "user" | "admin" | "team_admin" | "viewer";
                    metadata?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            teams: {
                Row: {
                    id: string;
                    name: string;
                    slug: string | null;
                    owner_id: string;
                    tier: "standard" | "pro" | "enterprise";
                    max_members: number;
                    metadata: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug?: string | null;
                    owner_id: string;
                    tier?: "standard" | "pro" | "enterprise";
                    max_members?: number;
                    metadata?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string | null;
                    owner_id?: string;
                    tier?: "standard" | "pro" | "enterprise";
                    max_members?: number;
                    metadata?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            team_members: {
                Row: {
                    id: string;
                    team_id: string;
                    user_id: string;
                    role: "admin" | "member" | "viewer";
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    team_id: string;
                    user_id: string;
                    role?: "admin" | "member" | "viewer";
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    team_id?: string;
                    user_id?: string;
                    role?: "admin" | "member" | "viewer";
                    created_at?: string;
                };
            };
            models: {
                Row: {
                    id: string;
                    user_id: string | null;
                    team_id: string | null;
                    name: string;
                    description: string | null;
                    type: "checkpoint" | "lora" | "embedding" | "controlnet" | "vae" | "upscaler";
                    base_model: "sd15" | "sd21" | "sdxl" | "flux" | "other";
                    file_path: string;
                    file_size: number | null;
                    sha256: string | null;
                    thumbnail_url: string | null;
                    metadata: Json;
                    trigger_words: string[] | null;
                    is_public: boolean;
                    is_system: boolean;
                    download_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    team_id?: string | null;
                    name: string;
                    description?: string | null;
                    type: "checkpoint" | "lora" | "embedding" | "controlnet" | "vae" | "upscaler";
                    base_model?: "sd15" | "sd21" | "sdxl" | "flux" | "other";
                    file_path: string;
                    file_size?: number | null;
                    sha256?: string | null;
                    thumbnail_url?: string | null;
                    metadata?: Json;
                    trigger_words?: string[] | null;
                    is_public?: boolean;
                    is_system?: boolean;
                    download_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    team_id?: string | null;
                    name?: string;
                    description?: string | null;
                    type?: "checkpoint" | "lora" | "embedding" | "controlnet" | "vae" | "upscaler";
                    base_model?: "sd15" | "sd21" | "sdxl" | "flux" | "other";
                    file_path?: string;
                    file_size?: number | null;
                    sha256?: string | null;
                    thumbnail_url?: string | null;
                    metadata?: Json;
                    trigger_words?: string[] | null;
                    is_public?: boolean;
                    is_system?: boolean;
                    download_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            workflows: {
                Row: {
                    id: string;
                    user_id: string;
                    team_id: string | null;
                    name: string;
                    description: string | null;
                    nodes: Json;
                    edges: Json;
                    viewport: Json;
                    metadata: Json;
                    thumbnail_url: string | null;
                    tags: string[] | null;
                    is_public: boolean;
                    is_template: boolean;
                    version: number;
                    fork_count: number;
                    forked_from: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    team_id?: string | null;
                    name: string;
                    description?: string | null;
                    nodes?: Json;
                    edges?: Json;
                    viewport?: Json;
                    metadata?: Json;
                    thumbnail_url?: string | null;
                    tags?: string[] | null;
                    is_public?: boolean;
                    is_template?: boolean;
                    version?: number;
                    fork_count?: number;
                    forked_from?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    team_id?: string | null;
                    name?: string;
                    description?: string | null;
                    nodes?: Json;
                    edges?: Json;
                    viewport?: Json;
                    metadata?: Json;
                    thumbnail_url?: string | null;
                    tags?: string[] | null;
                    is_public?: boolean;
                    is_template?: boolean;
                    version?: number;
                    fork_count?: number;
                    forked_from?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            jobs: {
                Row: {
                    id: string;
                    user_id: string;
                    workflow_id: string | null;
                    type: "txt2img" | "img2img" | "inpaint" | "outpaint" | "upscale" | "video" | "workflow";
                    status: "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
                    priority: "free" | "standard" | "pro" | "enterprise";
                    params: Json;
                    progress: number;
                    current_step: number;
                    total_steps: number;
                    current_node: string | null;
                    credits_estimated: number;
                    credits_used: number;
                    gpu_time_ms: number | null;
                    outputs: Json;
                    error_message: string | null;
                    queued_at: string | null;
                    started_at: string | null;
                    completed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    workflow_id?: string | null;
                    type?: "txt2img" | "img2img" | "inpaint" | "outpaint" | "upscale" | "video" | "workflow";
                    status?: "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
                    priority?: "free" | "standard" | "pro" | "enterprise";
                    params?: Json;
                    progress?: number;
                    current_step?: number;
                    total_steps?: number;
                    current_node?: string | null;
                    credits_estimated?: number;
                    credits_used?: number;
                    gpu_time_ms?: number | null;
                    outputs?: Json;
                    error_message?: string | null;
                    queued_at?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    workflow_id?: string | null;
                    type?: "txt2img" | "img2img" | "inpaint" | "outpaint" | "upscale" | "video" | "workflow";
                    status?: "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
                    priority?: "free" | "standard" | "pro" | "enterprise";
                    params?: Json;
                    progress?: number;
                    current_step?: number;
                    total_steps?: number;
                    current_node?: string | null;
                    credits_estimated?: number;
                    credits_used?: number;
                    gpu_time_ms?: number | null;
                    outputs?: Json;
                    error_message?: string | null;
                    queued_at?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                };
            };
            assets: {
                Row: {
                    id: string;
                    user_id: string;
                    job_id: string | null;
                    type: "image" | "video" | "mask" | "reference";
                    file_path: string;
                    thumbnail_path: string | null;
                    width: number | null;
                    height: number | null;
                    file_size: number | null;
                    format: string | null;
                    duration_ms: number | null;
                    prompt: string | null;
                    negative_prompt: string | null;
                    seed: number | null;
                    model_name: string | null;
                    params: Json;
                    is_favorite: boolean;
                    is_deleted: boolean;
                    deleted_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    job_id?: string | null;
                    type?: "image" | "video" | "mask" | "reference";
                    file_path: string;
                    thumbnail_path?: string | null;
                    width?: number | null;
                    height?: number | null;
                    file_size?: number | null;
                    format?: string | null;
                    duration_ms?: number | null;
                    prompt?: string | null;
                    negative_prompt?: string | null;
                    seed?: number | null;
                    model_name?: string | null;
                    params?: Json;
                    is_favorite?: boolean;
                    is_deleted?: boolean;
                    deleted_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    job_id?: string | null;
                    type?: "image" | "video" | "mask" | "reference";
                    file_path?: string;
                    thumbnail_path?: string | null;
                    width?: number | null;
                    height?: number | null;
                    file_size?: number | null;
                    format?: string | null;
                    duration_ms?: number | null;
                    prompt?: string | null;
                    negative_prompt?: string | null;
                    seed?: number | null;
                    model_name?: string | null;
                    params?: Json;
                    is_favorite?: boolean;
                    is_deleted?: boolean;
                    deleted_at?: string | null;
                    created_at?: string;
                };
            };
            subscriptions: {
                Row: {
                    id: string;
                    user_id: string;
                    stripe_customer_id: string | null;
                    stripe_subscription_id: string | null;
                    stripe_price_id: string | null;
                    tier: "free" | "standard" | "pro" | "enterprise";
                    status: "active" | "canceled" | "past_due" | "trialing";
                    current_period_start: string | null;
                    current_period_end: string | null;
                    cancel_at_period_end: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    stripe_customer_id?: string | null;
                    stripe_subscription_id?: string | null;
                    stripe_price_id?: string | null;
                    tier: "free" | "standard" | "pro" | "enterprise";
                    status?: "active" | "canceled" | "past_due" | "trialing";
                    current_period_start?: string | null;
                    current_period_end?: string | null;
                    cancel_at_period_end?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    stripe_customer_id?: string | null;
                    stripe_subscription_id?: string | null;
                    stripe_price_id?: string | null;
                    tier?: "free" | "standard" | "pro" | "enterprise";
                    status?: "active" | "canceled" | "past_due" | "trialing";
                    current_period_start?: string | null;
                    current_period_end?: string | null;
                    cancel_at_period_end?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            credit_transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    amount: number;
                    type: "purchase" | "subscription" | "usage" | "refund" | "bonus" | "adjustment";
                    description: string | null;
                    job_id: string | null;
                    stripe_payment_id: string | null;
                    balance_after: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    amount: number;
                    type: "purchase" | "subscription" | "usage" | "refund" | "bonus" | "adjustment";
                    description?: string | null;
                    job_id?: string | null;
                    stripe_payment_id?: string | null;
                    balance_after?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    amount?: number;
                    type?: "purchase" | "subscription" | "usage" | "refund" | "bonus" | "adjustment";
                    description?: string | null;
                    job_id?: string | null;
                    stripe_payment_id?: string | null;
                    balance_after?: number | null;
                    created_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {
            model_type: "checkpoint" | "lora" | "embedding" | "controlnet" | "vae" | "upscaler";
            base_model: "sd15" | "sd21" | "sdxl" | "flux" | "other";
            job_status: "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
            job_type: "txt2img" | "img2img" | "inpaint" | "outpaint" | "upscale" | "video" | "workflow";
            asset_type: "image" | "video" | "mask" | "reference";
        };
        CompositeTypes: {};
    };
};

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];
export type Insertable<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Insert"];
export type Updatable<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
    Database["public"]["Enums"][T];

// Convenience types
export type Profile = Tables<"profiles">;
export type Team = Tables<"teams">;
export type TeamMember = Tables<"team_members">;
export type Model = Tables<"models">;
export type Workflow = Tables<"workflows">;
export type Job = Tables<"jobs">;
export type Asset = Tables<"assets">;
export type Subscription = Tables<"subscriptions">;
export type CreditTransaction = Tables<"credit_transactions">;

export type ModelType = Enums<"model_type">;
export type BaseModel = Enums<"base_model">;
export type JobStatus = Enums<"job_status">;
export type JobType = Enums<"job_type">;
export type AssetType = Enums<"asset_type">;
