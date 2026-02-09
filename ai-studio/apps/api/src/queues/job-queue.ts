import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config/index.js";
import { supabaseAdmin } from "../services/supabase.js";

// Redis connection
const connection = new IORedis(config.redis.url, {
    maxRetriesPerRequest: null,
});

// Job queue
export const jobQueue = new Queue("ai-generation", {
    connection,
    defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});

// Job data interface
interface GenerationJobData {
    jobId: string;
    userId: string;
    type: string;
    params: Record<string, unknown>;
}

// Job processor (this would communicate with GPU workers)
async function processJob(job: Job<GenerationJobData>) {
    const { jobId, userId, type, params } = job.data;

    console.log(`Processing job ${jobId} of type ${type}`);

    try {
        // Update job status to processing
        await supabaseAdmin
            .from("jobs")
            .update({
                status: "processing",
                started_at: new Date().toISOString(),
            })
            .eq("id", jobId);

        // Simulate progress updates
        const totalSteps = (params.steps as number) || 20;

        for (let step = 1; step <= totalSteps; step++) {
            // Update progress
            await job.updateProgress((step / totalSteps) * 100);

            await supabaseAdmin
                .from("jobs")
                .update({
                    progress: Math.round((step / totalSteps) * 100),
                    current_step: step,
                    total_steps: totalSteps,
                })
                .eq("id", jobId);

            // Simulate step processing time
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // TODO: Actually send job to GPU worker and wait for result
        // For now, simulate a completed job

        // Create a placeholder asset
        // In production, this would come from the GPU worker
        const { data: asset } = await supabaseAdmin
            .from("assets")
            .insert({
                user_id: userId,
                job_id: jobId,
                type: "image",
                file_path: `generations/${jobId}/output.png`,
                width: (params.width as number) || 512,
                height: (params.height as number) || 512,
                prompt: params.prompt as string,
                negative_prompt: params.negative_prompt as string || "",
                seed: (params.seed as number) || Math.floor(Math.random() * 2147483647),
                model_name: "stable-diffusion-v1-5",
                params: params,
            })
            .select()
            .single();

        // Deduct credits
        const creditsUsed = job.data.type === "txt2img" ? 1 : 2;

        await supabaseAdmin.rpc("deduct_credits", {
            p_user_id: userId,
            p_amount: creditsUsed,
            p_job_id: jobId,
        });

        // Update job as completed
        await supabaseAdmin
            .from("jobs")
            .update({
                status: "completed",
                progress: 100,
                credits_used: creditsUsed,
                outputs: asset ? [asset.id] : [],
                completed_at: new Date().toISOString(),
            })
            .eq("id", jobId);

        console.log(`Job ${jobId} completed successfully`);

        return { success: true, assetId: asset?.id };
    } catch (error) {
        console.error(`Job ${jobId} failed:`, error);

        // Update job as failed
        await supabaseAdmin
            .from("jobs")
            .update({
                status: "failed",
                error_message: error instanceof Error ? error.message : "Unknown error",
                completed_at: new Date().toISOString(),
            })
            .eq("id", jobId);

        throw error;
    }
}

// Create worker
export const jobWorker = new Worker("ai-generation", processJob, {
    connection,
    concurrency: 5,
});

// Worker event handlers
jobWorker.on("completed", (job: Job<GenerationJobData>) => {
    console.log(`Job ${job.id} has completed`);
});

jobWorker.on("failed", (job: Job<GenerationJobData> | undefined, err: Error) => {
    console.error(`Job ${job?.id} has failed:`, err);
});

jobWorker.on("progress", (job: Job<GenerationJobData>, progress: number | object) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("Shutting down job queue...");
    await jobWorker.close();
    await jobQueue.close();
    connection.disconnect();
});

console.log("Job queue initialized");
