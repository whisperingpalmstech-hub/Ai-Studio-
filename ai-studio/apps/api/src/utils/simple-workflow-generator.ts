
export function generateSimpleWorkflow(params: any): Record<string, any> {
    const type = params.type || "txt2img";
    const ID = {
        CHECKPOINT: "1",
        PROMPT_POS: "2",
        PROMPT_NEG: "3",
        LATENT_EMPTY: "4",
        LATENT_IMAGE: "14",
        SAMPLER: "5",
        VAE_DECODE: "6",
        SAVE_IMAGE: "7",
        LOAD_IMAGE: "8",
        VAE_ENCODE: "9",
        LOAD_MASK: "10",
        VAE_ENCODE_INPAINT: "11"
    };

    const workflow: Record<string, any> = {};

    // Common Nodes
    workflow[ID.CHECKPOINT] = {
        class_type: "CheckpointLoaderSimple",
        inputs: { ckpt_name: params.model_id || "v1-5-pruned-emaonly.safetensors" }
    };

    workflow[ID.PROMPT_POS] = {
        class_type: "CLIPTextEncode",
        inputs: {
            text: params.prompt || "",
            clip: [ID.CHECKPOINT, 1]
        }
    };

    workflow[ID.PROMPT_NEG] = {
        class_type: "CLIPTextEncode",
        inputs: {
            text: params.negative_prompt || "",
            clip: [ID.CHECKPOINT, 1]
        }
    };

    workflow[ID.SAVE_IMAGE] = {
        class_type: "SaveImage",
        inputs: {
            filename_prefix: "AiStudio",
            images: [ID.VAE_DECODE, 0]
        }
    };

    workflow[ID.VAE_DECODE] = {
        class_type: "VAEDecode",
        inputs: {
            samples: [ID.SAMPLER, 0],
            vae: [ID.CHECKPOINT, 2]
        }
    };

    // Latent Source
    let latentNodeId = ID.LATENT_EMPTY;
    let denoise = 1.0;

    if (type === "txt2img") {
        workflow[ID.LATENT_EMPTY] = {
            class_type: "EmptyLatentImage",
            inputs: {
                width: params.width || 512,
                height: params.height || 512,
                batch_size: 1
            }
        };
        latentNodeId = ID.LATENT_EMPTY;
    }
    else if (type === "img2img" || type === "upscale") {
        if (!params.image_filename) throw new Error("Image filename required for input");

        workflow[ID.LOAD_IMAGE] = {
            class_type: "LoadImage",
            inputs: {
                image: params.image_filename,
                upload: "image"
            }
        };

        let pixelNodeId = ID.LOAD_IMAGE;

        if (type === "upscale") {
            const UPSCALE_PIXELS = "15";
            workflow[UPSCALE_PIXELS] = {
                class_type: "ImageScaleBy",
                inputs: {
                    image: [ID.LOAD_IMAGE, 0],
                    upscale_method: "area",
                    scale_by: Number(params.upscale_factor) || 2.0
                }
            };
            pixelNodeId = UPSCALE_PIXELS;
            denoise = params.denoising_strength ?? 0.35;
        } else {
            denoise = params.denoising_strength ?? 0.75;
        }

        workflow[ID.VAE_ENCODE] = {
            class_type: "VAEEncode",
            inputs: {
                pixels: [pixelNodeId, 0],
                vae: [ID.CHECKPOINT, 2]
            }
        };

        latentNodeId = ID.VAE_ENCODE;
    }
    else if (type === "inpaint") {
        if (!params.image_filename || !params.mask_filename) throw new Error("Image and mask required for inpaint");

        workflow[ID.LOAD_IMAGE] = {
            class_type: "LoadImage",
            inputs: { image: params.image_filename, upload: "image" }
        };

        const MASK_LOAD_NODE = "LoadMaskFromPath"; // Or LoadImage if mask is an image

        // Standard ComfyUI LoadImage loads image+mask. If we upload mask separately, we use LoadImage for mask too.
        workflow[ID.LOAD_MASK] = {
            class_type: "LoadImage",
            inputs: { image: params.mask_filename, upload: "image" }
        };

        workflow[ID.VAE_ENCODE_INPAINT] = {
            class_type: "VAEEncodeForInpaint",
            inputs: {
                pixels: [ID.LOAD_IMAGE, 0],
                vae: [ID.CHECKPOINT, 2],
                mask: [ID.LOAD_MASK, 0], // Using mask output 0 (MASK) from LoadImage 
                // Wait, LoadImage output 0 is IMAGE, output 1 is MASK.
                // If the uploaded file IS the mask (black/white), we might need to use indices correctly or convert IMAGE to MASK.
                // ComfyUI "LoadImage" node outputs IMAGE and MASK (from alpha channel).
                // If user uploads a B&W mask image without alpha, LoadImage MASK might be full white or black.
                // Helper node "ImageToMask"? 
                // For simplicity, let's assume standard VAEEncode for now or use VAEEncodeForInpaint with LoadImage mask output.
                grow_mask_by: 6
            }
        };
        // Correction: LoadImage outputs MASK at index 1.
        workflow[ID.VAE_ENCODE_INPAINT].inputs.mask = [ID.LOAD_MASK, 1];

        latentNodeId = ID.VAE_ENCODE_INPAINT;
        denoise = params.denoising_strength ?? 0.9;
    }

    const SAMPLER_MAP: Record<string, string> = {
        "euler": "euler",
        "euler a": "euler_ancestral",
        "euler_ancestral": "euler_ancestral",
        "euler_a": "euler_ancestral",
        "dpm++ 2m": "dpmpp_2m",
        "dpm++ 2m karras": "dpmpp_2m",
        "dpm++ sde": "dpmpp_sde",
        "dpm++ sde karras": "dpmpp_sde",
        "ddim": "ddim",
        "lms": "lms",
        "uni_pc": "uni_pc"
    };

    const SCHEDULER_MAP: Record<string, string> = {
        "normal": "normal",
        "karras": "karras",
        "exponential": "exponential",
        "sgm_uniform": "sgm_uniform",
        "simple": "simple",
        "ddim_uniform": "ddim_uniform"
    };

    const rawSampler = (params.sampler || "euler").toLowerCase();
    const samplerName = SAMPLER_MAP[rawSampler] || "euler";
    const schedulerName = params.sampler?.toLowerCase().includes("karras") ? "karras" : "normal";

    workflow[ID.SAMPLER] = {
        class_type: "KSampler",
        inputs: {
            model: [ID.CHECKPOINT, 0],
            positive: [ID.PROMPT_POS, 0],
            negative: [ID.PROMPT_NEG, 0],
            latent_image: [latentNodeId, 0],
            seed: Number(params.seed) && params.seed !== -1 ? Number(params.seed) : Math.floor(Math.random() * 10000000),
            steps: Number(params.steps) || 20,
            cfg: Number(params.cfg_scale) || 7.0,
            sampler_name: samplerName,
            scheduler: schedulerName,
            denoise: Number(denoise)
        }
    };

    console.log("Final Generated Workflow Payload:", JSON.stringify(workflow, null, 2));

    return workflow;
}
