import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config/index.js";
import { supabaseAdmin } from "../services/supabase.js";
import { webSocketService } from "../services/websocket.js";

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
    const { comfyUIService } = await import("../services/comfyui.js");
    const { generateSimpleWorkflow } = await import("../utils/simple-workflow-generator.js");

    console.log(`Processing job ${jobId} of type ${type}`);

    let promptId: string | undefined;

    try {
        // Update job status to processing
        await ((supabaseAdmin as any)
            .from("jobs")
            .update({
                status: "processing",
                started_at: new Date().toISOString(),
            })
            .eq("id", jobId));

        let comfyPrompt: any;

        // 1. Construct ComfyUI Prompt based on type
        if (type === 'workflow') {
            try {
                const workflowData = (params as any).workflow;
                if (!workflowData || !workflowData.nodes || !workflowData.edges) {
                    throw new Error("Invalid workflow data: missing nodes or edges");
                }
                const { convertReactFlowToComfyUI } = await import("../utils/workflow-converter.js");
                comfyPrompt = convertReactFlowToComfyUI(workflowData.nodes, workflowData.edges);

                // Handle Image Uploads within Workflow Nodes
                for (const node of workflowData.nodes) {
                    if (node.type === 'loadImage' && node.data?.image?.startsWith('data:')) {
                        try {
                            const base64Data = node.data.image.split(",")[1];
                            const buffer = Buffer.from(base64Data, 'base64');
                            const filename = `wkf_${jobId}_${node.id}.png`;
                            const uploadedName = await comfyUIService.uploadImage(buffer, filename);

                            // Update the converted prompt with the actual uploaded filename
                            if (comfyPrompt[node.id]) {
                                comfyPrompt[node.id].inputs["image"] = uploadedName;
                                console.log(`Uploaded workflow image for node ${node.id}: ${uploadedName}`);
                            }
                        } catch (e) {
                            console.error(`Failed to upload image for node ${node.id}:`, e);
                        }
                    }
                }

                console.log("Generated ComfyUI Prompt for Workflow:", JSON.stringify(comfyPrompt, null, 2));
            } catch (err) {
                console.error("Failed to convert workflow:", err);
                throw new Error("Workflow conversion failed: " + (err instanceof Error ? err.message : String(err)));
            }
        } else {
            // Standard Generation (txt2img, img2img, etc.)

            // Handle Image Uploads for Img2Img / Inpaint
            if (params.image_url && typeof params.image_url === 'string' && params.image_url.startsWith('data:')) {
                try {
                    const base64Data = params.image_url.split(",")[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    // Upload to ComfyUI
                    // We need a unique filename
                    const filename = `input_${jobId}_image.png`;
                    const uploadedName = await comfyUIService.uploadImage(buffer, filename);
                    params.image_filename = uploadedName;
                    console.log(`Uploaded input image: ${uploadedName}`);
                } catch (e) {
                    console.error("Failed to upload input image:", e);
                    // Continue? Or fail?
                    // If it's img2img, we probably should fail.
                    if (type === 'img2img' || type === 'inpaint' || type === 'upscale') {
                        throw new Error("Failed to upload input image");
                    }
                }
            }

            if (params.mask_url && typeof params.mask_url === 'string' && params.mask_url.startsWith('data:')) {
                try {
                    const base64Data = params.mask_url.split(",")[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    const filename = `input_${jobId}_mask.png`;
                    const uploadedName = await comfyUIService.uploadImage(buffer, filename);
                    params.mask_filename = uploadedName;
                    console.log(`Uploaded mask image: ${uploadedName}`);
                } catch (e) {
                    console.error("Failed to upload mask:", e);
                    if (type === 'inpaint') {
                        throw new Error("Failed to upload mask image");
                    }
                }
            }

            comfyPrompt = generateSimpleWorkflow(params);
            console.log(`Generated standard workflow for ${type}`);
        }

        const { comfyUIWebSocketService } = await import("../services/comfyui-ws.js");
        promptId = await comfyUIService.queuePrompt(comfyPrompt, comfyUIWebSocketService.clientId);
        comfyUIWebSocketService.registerPrompt(promptId, userId, jobId);
        console.log(`ComfyUI Prompt Queued: ${promptId}`);

        // 3. Poll for Completion (Polling every 1s)
        let isComplete = false;
        let outputs: any = {};
        let finalStatus = "processing";

        const startTime = Date.now();
        const timeout = 600000; // 10 minutes timeout

        while (!isComplete) {
            if (Date.now() - startTime > timeout) {
                throw new Error("Job timed out");
            }

            try {
                const history = await comfyUIService.getHistory(promptId);

                // ComfyUI history is keyed by promptId (UUID)
                if (history && history[promptId]) {
                    const result = history[promptId];

                    if (result.status && result.status.completed) {
                        isComplete = true;
                        outputs = result.outputs;
                        finalStatus = "completed";
                    } else if (result.status && result.status.status_str === 'error') {
                        throw new Error(`ComfyUI Error: ${JSON.stringify(result.status)}`);
                    }
                }
            } catch (err) {
                // Ignore 404s or other fetch errors during polling?
                // If ComfyUI is down, we might want to fail eventually.
                console.warn(`Polling error for ${promptId}:`, err);
            }

            if (!isComplete) {
                // Wait 1 second before next poll
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        // 4. Process Outputs
        const nodeResults: Record<string, any[]> = {};
        const allProcessedImages: any[] = [];

        for (const nodeId of Object.keys(outputs)) {
            const nodeOutput = outputs[nodeId];

            // Handle Images
            if (nodeOutput.images) {
                if (!nodeResults[nodeId]) nodeResults[nodeId] = [];
                for (const img of nodeOutput.images) {
                    if (img.type === 'output') {
                        try {
                            const buffer = await comfyUIService.getImage(img.filename, img.subfolder, img.type);
                            const storagePath = `generations/${userId}/${jobId}/${img.filename}`;
                            await supabaseAdmin.storage.from('assets').upload(storagePath, buffer, { contentType: 'image/png', upsert: true });
                            const { data: { publicUrl } } = supabaseAdmin.storage.from('assets').getPublicUrl(storagePath);

                            const imageData = { filename: img.filename, url: publicUrl, width: Number(img.width) || 512, height: Number(img.height) || 512, type: 'image' };
                            nodeResults[nodeId].push(imageData);
                            allProcessedImages.push(imageData);
                        } catch (e) {
                            console.error(`Failed to process output image for node ${nodeId}:`, e);
                        }
                    }
                }
            }

            // Handle Videos/GIFs (VideoHelperSuite returns videos under "gifs" key mostly)
            const videoData = nodeOutput.gifs || nodeOutput.videos;
            if (videoData) {
                if (!nodeResults[nodeId]) nodeResults[nodeId] = [];
                for (const vid of videoData) {
                    if (vid.type === 'output') {
                        try {
                            const buffer = await comfyUIService.getImage(vid.filename, vid.subfolder, vid.type);
                            const storagePath = `generations/${userId}/${jobId}/${vid.filename}`;
                            const contentType = vid.format || (vid.filename.endsWith('.gif') ? 'image/gif' : 'video/mp4');
                            await supabaseAdmin.storage.from('assets').upload(storagePath, buffer, { contentType, upsert: true });
                            const { data: { publicUrl } } = supabaseAdmin.storage.from('assets').getPublicUrl(storagePath);

                            const videoResult = {
                                filename: vid.filename,
                                url: publicUrl,
                                width: 1024, // SVD default
                                height: 576,
                                type: 'video'
                            };
                            nodeResults[nodeId].push(videoResult);
                            allProcessedImages.push(videoResult);
                        } catch (e) {
                            console.error(`Failed to process output video for node ${nodeId}:`, e);
                        }
                    }
                }
            }
        }

        if (allProcessedImages.length === 0) throw new Error("No output generated from ComfyUI execution");

        // 5. Save Assets to DB
        const primaryImage = allProcessedImages[0];
        const { data: asset, error: assetError } = await (supabaseAdmin
            .from("assets")
            .insert({
                user_id: userId,
                job_id: jobId,
                type: primaryImage.type || "image",
                file_path: primaryImage.url,
                width: primaryImage.width,
                height: primaryImage.height,
                params: params as any,
                model_name: "stable-diffusion-v1-5",
                prompt: params.prompt as string || "Workflow Results",
                created_at: new Date().toISOString()
            } as any)
            .select()
            .single() as any);

        if (assetError) throw new Error("Asset creation failed: " + assetError.message);

        // Notify User with node-specific results
        webSocketService.sendToUser(userId, {
            type: "job_complete",
            jobId,
            status: "completed",
            result: asset,
            results: nodeResults
        });

        // Update Job
        await ((supabaseAdmin as any)
            .from("jobs")
            .update({
                status: "completed",
                progress: 100,
                outputs: asset ? [asset.id] : [],
                completed_at: new Date().toISOString(),
            })
            .eq("id", jobId));

        console.log(`Job ${jobId} completed successfully`);
        comfyUIWebSocketService.unregisterPrompt(promptId);
        return { success: true, assetId: asset?.id };

    } catch (error: any) {
        console.error(`Job ${jobId} failed:`, error);

        webSocketService.sendToUser(userId, {
            type: "job_failed",
            jobId,
            status: "failed",
            error: error.message || "Unknown error",
        });

        // Update job as failed
        await ((supabaseAdmin as any)
            .from("jobs")
            .update({
                status: "failed",
                error_message: error.message || "Unknown error",
                completed_at: new Date().toISOString(),
            })
            .eq("id", jobId));

        // Don't rethrow to BullMQ to avoid infinite retries if logic failed? 
        // BullMQ will treat throw as fail and obey 'removeOnFail' and retry attempts.
        // We probably want to stop retrying if it's a logic/workflow error.
        // For now, let it fail.
        if (promptId) {
            const { comfyUIWebSocketService } = await import("../services/comfyui-ws.js");
            comfyUIWebSocketService.unregisterPrompt(promptId);
        }
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
    if (job) {
        console.error(`Job ${job.id} has failed:`, err);
    } else {
        console.error(`Job failed (undefined job):`, err);
    }
});

jobWorker.on("progress", (job: Job<GenerationJobData, any, string>, progress: any) => {
    // BullMQ progress is slightly loose in typing, so we can cast if needed or just use as is if compatible.
    console.log(`Job ${job.id} is ${JSON.stringify(progress)}% complete`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("Shutting down job queue...");
    await jobWorker.close();
    await jobQueue.close();
    connection.disconnect();
});

console.log("Job queue initialized");
