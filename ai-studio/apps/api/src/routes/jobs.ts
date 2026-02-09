import { Router, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { jobQueue } from "../queues/job-queue.js";
import { supabaseAdmin } from "../services/supabase.js";
import { BadRequestError, InsufficientCreditsError, NotFoundError } from "../middleware/error.js";
import { config } from "../config/index.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Validation schemas
const txt2imgSchema = z.object({
    prompt: z.string().min(1).max(2000),
    negative_prompt: z.string().max(2000).optional().default(""),
    width: z.number().min(128).max(2048).optional().default(512),
    height: z.number().min(128).max(2048).optional().default(512),
    steps: z.number().min(1).max(150).optional().default(20),
    cfg_scale: z.number().min(1).max(30).optional().default(7),
    seed: z.number().optional().default(-1),
    sampler: z.string().optional().default("euler_a"),
    model_id: z.string().uuid().optional(),
    lora_ids: z.array(z.string().uuid()).optional().default([]),
    batch_size: z.number().min(1).max(4).optional().default(1),
    batch_count: z.number().min(1).max(4).optional().default(1),
});

const img2imgSchema = txt2imgSchema.extend({
    image_url: z.string().url(),
    denoising_strength: z.number().min(0).max(1).optional().default(0.75),
});

const inpaintSchema = img2imgSchema.extend({
    mask_url: z.string().url(),
});

// POST /api/v1/jobs - Create a new generation job
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { type = "txt2img", ...params } = req.body;

    // Validate job type
    const validTypes = ["txt2img", "img2img", "inpaint", "outpaint", "upscale"];
    if (!validTypes.includes(type)) {
        throw new BadRequestError(`Invalid job type: ${type}`);
    }

    // Validate params based on job type
    let validatedParams;
    try {
        switch (type) {
            case "txt2img":
                validatedParams = txt2imgSchema.parse(params);
                break;
            case "img2img":
                validatedParams = img2imgSchema.parse(params);
                break;
            case "inpaint":
            case "outpaint":
                validatedParams = inpaintSchema.parse(params);
                break;
            default:
                validatedParams = params;
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new BadRequestError(
                `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
            );
        }
        throw error;
    }

    // Check tier limits
    const tierLimits = config.tierLimits[user.tier as keyof typeof config.tierLimits];
    if (validatedParams.width > tierLimits.maxResolution ||
        validatedParams.height > tierLimits.maxResolution) {
        throw new BadRequestError(
            `Resolution exceeds tier limit of ${tierLimits.maxResolution}px`
        );
    }
    if (validatedParams.steps > tierLimits.maxSteps) {
        throw new BadRequestError(
            `Steps exceeds tier limit of ${tierLimits.maxSteps}`
        );
    }

    // Calculate credit cost
    const baseCost = config.creditCosts[type as keyof typeof config.creditCosts] || 1;
    const batchMultiplier = (validatedParams.batch_size || 1) * (validatedParams.batch_count || 1);
    const creditCost = baseCost * batchMultiplier;

    // Check credits
    if (user.credits < creditCost) {
        throw new InsufficientCreditsError(creditCost, user.credits);
    }

    // Create job in database
    const jobId = uuidv4();
    const { data: job, error } = await supabaseAdmin
        .from("jobs")
        .insert({
            id: jobId,
            user_id: user.id,
            type: type,
            status: "pending",
            priority: user.tier,
            params: validatedParams,
            credits_estimated: creditCost,
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to create job:", error);
        throw new Error("Failed to create job");
    }

    // Add to job queue
    await jobQueue.add(
        type,
        {
            jobId: job.id,
            userId: user.id,
            type,
            params: validatedParams,
        },
        {
            priority: getPriorityNumber(user.tier),
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        }
    );

    // Update job status to queued
    await supabaseAdmin
        .from("jobs")
        .update({ status: "queued", queued_at: new Date().toISOString() })
        .eq("id", job.id);

    res.status(201).json({
        id: job.id,
        type: job.type,
        status: "queued",
        credits_estimated: creditCost,
        created_at: job.created_at,
    });
});

// GET /api/v1/jobs - List user's jobs
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { limit = 20, offset = 0, status } = req.query;

    let query = supabaseAdmin
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status && typeof status === "string") {
        query = query.eq("status", status);
    }

    const { data: jobs, count, error } = await query;

    if (error) {
        throw new Error("Failed to fetch jobs");
    }

    res.json({
        data: jobs,
        pagination: {
            total: count,
            limit: Number(limit),
            offset: Number(offset),
        },
    });
});

// GET /api/v1/jobs/:id - Get job details
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { id } = req.params;

    const { data: job, error } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error || !job) {
        throw new NotFoundError("Job not found");
    }

    // Get associated assets
    const { data: assets } = await supabaseAdmin
        .from("assets")
        .select("*")
        .eq("job_id", id);

    res.json({
        ...job,
        assets: assets || [],
    });
});

// DELETE /api/v1/jobs/:id - Cancel a job
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { id } = req.params;

    const { data: job, error } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error || !job) {
        throw new NotFoundError("Job not found");
    }

    // Can only cancel pending or queued jobs
    if (!["pending", "queued"].includes(job.status)) {
        throw new BadRequestError(`Cannot cancel job with status: ${job.status}`);
    }

    // Remove from queue if present
    const queueJob = await jobQueue.getJob(id);
    if (queueJob) {
        await queueJob.remove();
    }

    // Update job status
    await supabaseAdmin
        .from("jobs")
        .update({ status: "cancelled" })
        .eq("id", id);

    res.json({ message: "Job cancelled successfully" });
});

// Helper function to map tier to priority number (lower = higher priority)
function getPriorityNumber(tier: string): number {
    switch (tier) {
        case "enterprise":
            return 1;
        case "pro":
            return 2;
        case "standard":
            return 3;
        default:
            return 4;
    }
}

export { router as jobsRouter };
