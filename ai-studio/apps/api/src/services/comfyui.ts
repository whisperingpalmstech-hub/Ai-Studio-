
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { config } from "../config/index.js";

interface ComfyUIHistory {
    [promptId: string]: {
        outputs: {
            [nodeId: string]: {
                images: {
                    filename: string;
                    subfolder: string;
                    type: string;
                }[];
            };
        };
        status: {
            status_str: string;
            completed: boolean;
            messages: any[];
        };
    };
}

export class ComfyUIService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.COMFYUI_URL || "http://127.0.0.1:8188";
    }

    async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
        try {
            const formData = new FormData();
            formData.append("image", imageBuffer, { filename });
            formData.append("overwrite", "true");

            // Needed for axios with form-data in Node.js
            const headers = formData.getHeaders();

            const response = await axios.post(`${this.baseUrl}/upload/image`, formData, {
                headers: {
                    ...headers,
                },
            });

            return response.data.name;
        } catch (error: any) {
            console.error("Failed to upload image to ComfyUI:", error.message);
            throw new Error(`ComfyUI Image Upload Failed: ${error.message}`);
        }
    }

    async queuePrompt(prompt: Record<string, any>, clientId: string): Promise<string> {
        try {
            const payload = {
                prompt,
                client_id: clientId,
            };

            const response = await axios.post(`${this.baseUrl}/prompt`, payload);

            if (response.data.error) {
                // ComfyUI sometimes returns 200 OK but with an error field
                throw new Error(JSON.stringify(response.data.error));
            }

            return response.data.prompt_id;
        } catch (error: any) {
            if (error.response) {
                console.error("ComfyUI API Error Details:", {
                    status: error.response.status,
                    data: error.response.data
                });
                throw new Error(`ComfyUI Error: ${JSON.stringify(error.response.data)}`);
            }
            console.error("Failed to queue prompt:", error.message);
            // Check for connection refused
            if (error.code === 'ECONNREFUSED') {
                throw new Error("ComfyUI is not reachable. Is it running?");
            }
            throw new Error(`ComfyUI Queue Prompt Failed: ${error.message}`);
        }
    }

    async getHistory(promptId: string): Promise<ComfyUIHistory> {
        try {
            const response = await axios.get(`${this.baseUrl}/history/${promptId}`);
            return response.data;
        } catch (error: any) {
            console.error("Failed to get history:", error.message);
            throw new Error(`ComfyUI Get History Failed: ${error.message}`);
        }
    }

    async getImage(filename: string, subfolder: string, type: string): Promise<Buffer> {
        try {
            const response = await axios.get(`${this.baseUrl}/view`, {
                params: {
                    filename,
                    subfolder,
                    type,
                },
                responseType: "arraybuffer",
            });
            return Buffer.from(response.data);
        } catch (error: any) {
            console.error("Failed to get image:", error.message);
            throw new Error(`ComfyUI Get Image Failed: ${error.message}`);
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            // /system_stats is a lightweight endpoint
            await axios.get(`${this.baseUrl}/system_stats`, { timeout: 2000 });
            return true;
        } catch {
            return false;
        }
    }
}

export const comfyUIService = new ComfyUIService();
