
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();

        // 1. Check Auth (Standard Next.js Pattern)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const jobId = params.id;

        // 2. Verify Job Ownership (Security)
        const { data: job, error: fetchError } = await supabase
            .from("jobs")
            .select("user_id")
            .eq("id", jobId)
            .single();

        if (fetchError || !job) {
            // If not found, it's already gone, so return success to clear UI
            return NextResponse.json({ success: true, message: "Job not found or already deleted" });
        }

        if ((job as any).user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. Delete from DB using Admin Client (Bypass RLS if restricted)
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        // Attempt to clean up specific assets via DB lookup first
        const { data: assets } = await supabaseAdmin
            .from("assets")
            .select("file_path")
            .eq("job_id", jobId);

        if (assets && assets.length > 0) {
            const paths = assets.map((a: any) => {
                try {
                    if (a.file_path && a.file_path.startsWith('http')) {
                        const url = new URL(a.file_path);
                        const parts = url.pathname.split('/public/assets/');
                        return parts[1] || null;
                    }
                    return a.file_path;
                } catch (e) {
                    return a.file_path;
                }
            }).filter((p: any) => p !== null && typeof p === 'string' && p.trim() !== '');

            if (paths.length > 0) {
                await supabaseAdmin.storage.from("assets").remove(paths);
            }
        }

        // Delete Assets Record
        await supabaseAdmin.from("assets").delete().eq("job_id", jobId);

        // Delete Job Record
        const { error: deleteError } = await supabaseAdmin
            .from("jobs")
            .delete()
            .eq("id", jobId);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({ success: true, message: "Job deleted" });

    } catch (error: any) {
        console.error("Delete Job Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete job" },
            { status: 500 }
        );
    }
}
