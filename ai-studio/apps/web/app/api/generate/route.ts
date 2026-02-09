import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // 1. Verify User Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check Credits
        const { data: profile } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", user.id)
            .single();

        if (!profile || profile.credits < 1) {
            return NextResponse.json(
                { error: "Insufficient credits. Please upgrade your plan." },
                { status: 402 }
            );
        }

        // 3. Parse Request
        const body = await request.json();
        const {
            prompt,
            negative_prompt,
            num_inference_steps = 20,
            guidance_scale = 7.5,
            image,          // Base64 string for Img2Img
            model,          // Selected Model ID
            controlnet      // { model, strength }
        } = body;

        // 4. Determine Model & Endpoint (Enforce Serverless Allowlist)
        const HF_SERVERLESS_ALLOWLIST = [
            "stabilityai/stable-diffusion-2-1",
            "CompVis/stable-diffusion-v1-4",
            "stabilityai/stable-diffusion-xl-base-1.0",
            "stabilityai/sdxl-turbo"
        ];

        let modelId = model;
        if (!HF_SERVERLESS_ALLOWLIST.includes(modelId)) {
            console.warn(`Model ${modelId} not supported on Serverless. Defaulting to SD 2.1`);
            modelId = "stabilityai/stable-diffusion-2-1";
        }

        let apiUrl = `https://router.huggingface.co/models/${modelId}`;
        let payload: any = {};

        // 5. Check Capabilities
        if (image) {
            return NextResponse.json({
                error: "Img2Img is not supported on Hugging Face Serverless Inference. Please use Text-to-Image only or upgrade to a dedicated GPU backend."
            }, { status: 400 });
        }

        // Txt2Img Payload
        payload = {
            inputs: prompt,
            // parameters: {
            //     negative_prompt: negative_prompt || "blurry, low quality, distorted, ugly, bad anatomy",
            //     num_inference_steps: num_inference_steps,
            //     guidance_scale: guidance_scale
            // }
        };

        console.log(`Generating with ${modelId} (Img2Img: ${!!image})`);

        // 5. Call Hugging Face API
        const hfResponse = await fetch(
            apiUrl,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN || "hf_..."}`,
                    "Content-Type": "application/json",
                    "Accept": "image/png", // Required for HF Serverless
                },
                body: JSON.stringify(payload),
            }
        );

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error("HF API Error:", errorText, hfResponse.status);

            // Handle Loading State
            if (errorText.includes("currently loading")) {
                return NextResponse.json(
                    { error: "Model is warming up. Please try again in 20 seconds." },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: `Generation failed: ${hfResponse.statusText}` },
                { status: hfResponse.status }
            );
        }

        // 6. Process Response (HF returns binary image blob)
        const blob = await hfResponse.blob();
        const buffer = await blob.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;

        // 7. Save to DB
        const { error: insertError } = await supabase.from('generations').insert({
            user_id: user.id,
            prompt: prompt,
            image_url: imageUrl, // Storing Base64 directly for MVP (Storage bucket recommended for prod)
            width: 1024,
            height: 1024,
            steps: num_inference_steps,
            guidance_scale: guidance_scale,
            model_id: modelId,
            status: 'completed'
        });

        if (insertError) console.error("Failed to save generation:", insertError);

        // 8. Deduct Credits (Mock for now if RPC missing)
        // await supabase.rpc('decrement_credits', { userid: user.id, amount: 1 });

        return NextResponse.json({
            success: true,
            images: [imageUrl]
            // credits: profile.credits - 1 
        });

    } catch (error: any) {
        console.error("Generation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
