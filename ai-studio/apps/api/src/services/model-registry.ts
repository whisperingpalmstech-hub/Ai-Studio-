
export type WorkflowType =
    | "text_to_image"
    | "image_to_image"
    | "upscale"
    | "text_to_video"
    | "image_to_video"
    | "inpaint";

export interface ModelMetadata {
    id: string;
    name: string;
    type: "checkpoint" | "lora" | "upscaler" | "embedding" | "vae";
    compatibleWorkflows: WorkflowType[];
    architecture: "sd15" | "sdxl" | "flux" | "wan2.1" | "svd" | "esrgan" | "other";
    inputType: "text" | "text+image" | "image";
}

/**
 * @deprecated Use DB-driven metadata via modelScannerService
 * This registry is kept empty to avoid hardcoded dependency.
 */
export const MODEL_REGISTRY: Record<string, ModelMetadata> = {};

export function validateModelWorkflow(modelId: string, workflow: string): boolean {
    // Dynamic models are now validated via validateCompatibilityFromMetadata using DB metadata
    return true;
}

export function validateCompatibilityFromMetadata(metadata: any, workflow: string): boolean {
    if (!metadata || !metadata.compatibleWorkflows) return true; // Flexible for missing metadata

    const typeMap: Record<string, WorkflowType> = {
        "txt2img": "text_to_image",
        "img2img": "image_to_image",
        "upscale": "upscale",
        "t2v": "text_to_video",
        "i2v": "image_to_video",
        "inpaint": "inpaint"
    };

    const workflowType = typeMap[workflow];
    if (!workflowType) return false;

    // Support both new scanner format and legacy migration format
    const workflows = metadata.compatibleWorkflows;
    return workflows.includes(workflowType);
}
