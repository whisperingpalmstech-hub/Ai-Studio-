
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Auth Check - Must be authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch User's Jobs
        const { data: jobs, error: fetchError } = await supabase
            .from("jobs")
            .select("id")
            .eq("user_id", user.id);

        if (fetchError || !jobs || jobs.length === 0) {
            return NextResponse.json({ message: "No jobs to delete" });
        }

        const jobIds = jobs.map((job: any) => job.id);

        // 3. Delete from DB using Admin Client (Bypass RLS if restricted)
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        // Find assets associated with these jobs
        const { data: assets } = await supabaseAdmin
            .from("assets")
            .select("file_path")
            .in("job_id", jobIds);

        if (assets && assets.length > 0) {
            const pathsToRm = assets.map((a: any) => {
                const url = a.file_path;
                // Parse full URL or use raw if relative
                try {
                    if (url.startsWith('http')) {
                        const path = new URL(url).pathname.split('/public/assets/')[1];
                        return path;
                    }
                    return url;
                } catch (e) {
                    return null;
                }
            }).filter((p: any) => p !== null);

            if (pathsToRm.length > 0) {
                // Delete in chunks of 100 to avoid limits
                for (let i = 0; i < pathsToRm.length; i += 100) {
                    const chunk = pathsToRm.slice(i, i + 100);
                    await supabaseAdmin.storage.from("assets").remove(chunk);
                }
            }
        }

        // 4. Delete Records from DB
        await supabaseAdmin.from("assets").delete().in("job_id", jobIds);
        const { error: deleteError } = await supabaseAdmin
            .from("jobs")
            .delete()
            .in("id", jobIds);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${jobs.length} jobs.`
        });

    } catch (error: any) {
        console.error("Delete All Jobs Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete jobs" },
            { status: 500 }
        );
    }
}
