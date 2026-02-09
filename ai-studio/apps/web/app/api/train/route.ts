import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Check Credits (Training costs 50)
        const { data: profile } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", user.id)
            .single();

        if (!profile || profile.credits < 50) {
            return NextResponse.json(
                { error: "Insufficient credits. Training requires 50 credits." },
                { status: 402 }
            );
        }

        const body = await request.json();
        const { name, type, trigger_word, params } = body;

        // 2. Insert Training Job
        const { data, error } = await supabase
            .from("trainings")
            .insert({
                user_id: user.id,
                name,
                type,
                trigger_word,
                params,
                status: 'pending' // Queued execution
            })
            .select()
            .single();

        if (error) throw error;

        // 3. Deduct Credits
        await supabase.rpc('decrement_credits', { userid: user.id, amount: 50 });

        return NextResponse.json({ success: true, training: data });

    } catch (error: any) {
        console.error("Training error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
