
interface ReactFlowNode {
    id: string;
    type: string;
    data: any;
}

interface ReactFlowEdge {
    source: string;
    target: string;
    sourceHandle?: string | null; // e.g. "model", "clip", "latent"
    targetHandle?: string | null;
}

interface ComfyINode {
    class_type: string;
    inputs: Record<string, any>;
}

export function convertReactFlowToComfyUI(nodes: ReactFlowNode[], edges: ReactFlowEdge[]): Record<string, ComfyINode> {
    const comfyWorkflow: Record<string, ComfyINode> = {};

    // Map ReactFlow Node Types to ComfyUI Class Types
    // and map easy input values
    nodes.forEach(node => {
        let class_type = "";
        let inputs: Record<string, any> = {};

        switch (node.type) {
            case "loadModel":
                class_type = "CheckpointLoaderSimple";
                inputs["ckpt_name"] = node.data.model || "v1-5-pruned-emaonly.ckpt";
                break;
            case "prompt":
                class_type = "CLIPTextEncode";
                inputs["text"] = node.data.prompt || "";
                break;
            case "sampler":
                class_type = "KSampler";
                inputs["seed"] = node.data.seed || Math.floor(Math.random() * 10000000);
                inputs["steps"] = node.data.steps || 20;
                inputs["cfg"] = node.data.cfg || 8.0;
                inputs["sampler_name"] = node.data.sampler || "euler";
                inputs["scheduler"] = "normal";
                inputs["denoise"] = 1.0;
                break;
            case "emptyLatent":
                class_type = "EmptyLatentImage";
                inputs["width"] = node.data.width || 512;
                inputs["height"] = node.data.height || 512;
                inputs["batch_size"] = node.data.batch_size || 1;
                break;
            case "vaeEncode":
                class_type = "VAEEncode";
                break;
            case "vaeDecode":
                class_type = "VAEDecode";
                break;
            case "output":
                class_type = "SaveImage";
                inputs["filename_prefix"] = "AiStudio";
                break;
            case "loadImage":
                class_type = "LoadImage";
                inputs["image"] = node.data.filename || "example.png";
                inputs["upload"] = "image";
                break;
            case "lora":
                class_type = "LoraLoader";
                inputs["lora_name"] = node.data.lora_name || "lcm-lora-sdv1-5.safetensors";
                inputs["strength_model"] = node.data.strength_model || 1.0;
                inputs["strength_clip"] = node.data.strength_clip || 1.0;
                break;
            case "controlNet": {
                const loaderId = `${node.id}_loader`;
                comfyWorkflow[loaderId] = {
                    class_type: "ControlNetLoader",
                    inputs: {
                        control_net_name: node.data.model || "control_v11p_sd15_canny.pth"
                    }
                };
                class_type = "ControlNetApply";
                inputs["strength"] = node.data.strength || 1.0;
                inputs["start_percent"] = 0.0;
                inputs["end_percent"] = 1.0;
                inputs["control_net"] = [loaderId, 0];
                break;
            }
            case "upscale":
                class_type = "ImageUpscaleWithModel";
                // upscale_model, image from edges
                break;
            case "faceSwap":
                class_type = "ReActorFaceSwap";
                inputs["enabled"] = true;
                inputs["input_faces_order"] = "large-small";
                inputs["input_faces_index"] = "0";
                inputs["detect_gender_input"] = "no";
                inputs["detect_gender_source"] = "no";
                inputs["face_restore_model"] = "codeformer-v0.1.0.pth";
                inputs["face_restore_visibility"] = 1;
                inputs["codeformer_weight"] = 0.5;
                break;
            case "inpaint":
                class_type = "VAEEncodeForInpaint";
                inputs["grow_mask_by"] = node.data.blur || 6;
                break;
            case "latentUpscale":
                class_type = "LatentUpscale";
                inputs["upscale_method"] = node.data.upscale_method || "nearest-exact";
                inputs["width"] = node.data.width || 1024;
                inputs["height"] = node.data.height || 1024;
                inputs["crop"] = "disabled";
                break;
            case "conditioningAverage":
                class_type = "ConditioningAverage";
                inputs["conditioning_to_strength"] = node.data.strength || 0.5;
                break;
            case "svdLoader":
                class_type = "SVD_img2vid_Conditioning";
                inputs["video_frames"] = node.data.video_frames || 25;
                inputs["motion_bucket_id"] = node.data.motion_bucket_id || 127;
                inputs["fps"] = node.data.fps || 12;
                inputs["augmentation_level"] = node.data.augmentation_level || 0.0;
                inputs["width"] = node.data.width || 1024;
                inputs["height"] = node.data.height || 576;
                break;
            case "videoLinearCFG":
                class_type = "VideoLinearCFGGuidance";
                inputs["min_cfg"] = node.data.min_cfg || 1.0;
                break;
            case "clipVision":
                class_type = "CLIPVisionLoader";
                inputs["clip_name"] = node.data.model || "clip_vision_g.safetensors";
                break;
            case "videoCombine":
                class_type = "VHS_VideoCombine";
                inputs["frame_rate"] = node.data.fps || 12;
                inputs["loop_count"] = 0;
                inputs["filename_prefix"] = "AiStudio_Video";
                inputs["format"] = node.data.format || "video/h264-mp4";
                inputs["pix_fmt"] = "yuv420p";
                inputs["crf"] = 19;
                inputs["save_output"] = true;
                inputs["pingpong"] = false;
                inputs["save_metadata"] = true;
                inputs["trim_last_frame"] = 0;
                break;
            default:
                console.warn(`Unknown node type: ${node.type}`);
                class_type = node.type;
                inputs = { ...node.data };
        }

        comfyWorkflow[node.id] = { class_type, inputs };
    });

    // Map Edges to Inputs
    edges.forEach(edge => {
        const targetNode = comfyWorkflow[edge.target];
        if (!targetNode) return;

        let inputName = edge.targetHandle || "";

        // Handle name normalization to ComfyUI standards
        const handleMap: Record<string, string> = {
            "latent_in": "latent_image",
            "clip_in": "clip",
            "model_in": "model",
            "conditioning_in": "conditioning",
            "image_in": "image",
            "image": "image",
            "pixels": "pixels",
            "vae": "vae",
            "samples": "samples",
            "mask": "mask",
            "face": "face_image",
            "clip_vision": "clip_vision",
            "init_image": "init_image",
            "images": "images"
        };

        if (handleMap[inputName]) {
            inputName = handleMap[inputName];
        }

        // Specific override for VAE Decode which might use 'latents' or 'samples'
        if (comfyWorkflow[edge.target].class_type === "VAEDecode" && inputName === "latent") {
            inputName = "samples";
        }

        if (inputName) {
            let outputIndex = 0;
            const sourceNode = nodes.find(n => n.id === edge.source);
            const sourceNodeType = sourceNode?.type;
            const sourceHandle = edge.sourceHandle;

            // Output index mappings
            if (sourceNodeType === "loadModel") {
                if (sourceHandle === "model") outputIndex = 0;
                else if (sourceHandle === "clip") outputIndex = 1;
                else if (sourceHandle === "vae") outputIndex = 2;
            } else if (sourceNodeType === "lora") {
                if (sourceHandle === "model_out") outputIndex = 0;
                else if (sourceHandle === "clip_out") outputIndex = 1;
            } else if (sourceNodeType === "sampler" && sourceHandle === "latent_out") {
                outputIndex = 0;
            } else if (sourceNodeType === "loadImage") {
                if (sourceHandle === "image") outputIndex = 0;
                else if (sourceHandle === "mask") outputIndex = 1;
            } else if (sourceNodeType === "latentUpscale" || sourceNodeType === "emptyLatent" || sourceNodeType === "vaeEncode" || sourceNodeType === "inpaint") {
                outputIndex = 0; // SAMPLES / LATENT
            } else if (sourceNodeType === "vaeDecode" || sourceNodeType === "upscale" || sourceNodeType === "faceSwap") {
                outputIndex = 0; // IMAGE
            } else if (sourceNodeType === "conditioningAverage" || sourceNodeType === "prompt") {
                outputIndex = 0; // CONDITIONING
            } else if (sourceNodeType === "svdLoader") {
                if (sourceHandle === "positive") outputIndex = 0;
                else if (sourceHandle === "negative") outputIndex = 1;
                else if (sourceHandle === "latent") outputIndex = 2;
            } else if (sourceNodeType === "videoLinearCFG") {
                outputIndex = 0; // MODEL
            } else if (sourceNodeType === "clipVision") {
                outputIndex = 0; // CLIP_VISION
            }

            // Final fallback: if class is CLIPVisionLoader, it must be 0
            if (sourceNode?.type === "clipVision") outputIndex = 0;

            targetNode.inputs[inputName] = [edge.source, outputIndex];
        }
    });

    return comfyWorkflow;
}
