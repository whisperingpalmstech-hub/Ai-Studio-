
import axios from "axios";

export interface GrokMaskData {
    mask_regions: string[];
    preserve_regions: string[];
    dino_prompt: string;
    confidence: number;
    change_type: string;
    reasoning: string;
}

const REGION_MAPPING: Record<string, string[]> = {
    // Clothing - Upper
    "t-shirt": ["upper_body", "torso", "chest", "shirt", "clothes"],
    "shirt": ["upper_body", "torso", "shirt", "clothes"],
    "blouse": ["upper_body", "torso", "shirt", "clothes"],
    "saree": ["upper_body", "lower_body", "torso", "legs", "dress", "clothes"],
    "dress": ["upper_body", "lower_body", "torso", "legs", "dress", "clothes"],
    "jacket": ["upper_body", "torso", "outerwear", "clothes"],

    // Clothing - Lower
    "jeans": ["lower_body", "legs", "pants", "trousers"],
    "pants": ["lower_body", "legs", "pants", "trousers"],
    "skirt": ["lower_body", "legs", "skirt"],
    "shorts": ["lower_body", "legs", "shorts"],

    // Body Parts
    "face": ["face", "head", "skin"],
    "hair": ["hair", "head", "hairstyle"],
    "expression": ["face", "mouth", "eyes"],
    "smile": ["mouth", "face", "lips"],

    // Accessories
    "glasses": ["face", "eyes", "eyewear", "spectacles"],
    "jewelry": ["neck", "ears", "face", "accessories"],
    "necklace": ["neck", "chest", "jewelry"],
    "earrings": ["ears", "face", "jewelry"],
    "watch": ["wrist", "hand", "accessories"],

    // Context
    "background": ["background", "scenery", "room", "wall"],
    "holding": ["hands", "object", "item"],
    "sitting": ["lower_body", "legs", "posture"],

    // Indian Specific
    "bindi": ["face", "forehead"],
    "bangles": ["wrist", "hand", "arms", "jewelry"],
    "dupatta": ["shoulder", "chest", "head", "scarf"],
    "lehenga": ["lower_body", "legs", "dress", "skirt"],
    "kurta": ["upper_body", "torso", "shirt", "long_shirt"],
    "salwar": ["lower_body", "legs", "pants", "trousers"]
};

export class GrokService {
    static async parsePrompt(userPrompt: string, apiKey: string): Promise<GrokMaskData> {
        console.log(`🧠 Grok is parsing prompt: "${userPrompt}"`);

        const systemPrompt = `You are a precise image inpainting assistant. 
Analyze the user's prompt and identify:
1. What physical regions need to be masked/changed
2. What should be preserved (protected from change)
3. Confidence score for each region

Return ONLY valid JSON in this exact format:
{
    "mask_regions": ["clothes", "upper_body", "torso"],
    "preserve_regions": ["face", "hands", "background"],
    "dino_prompt": "clothes, upper body, shirt, torso",
    "confidence": 0.95,
    "change_type": "clothing_replace",
    "reasoning": "User wants to change outfit to t-shirt"
}

Rules:
- mask_regions: Use simple terms GroundingDINO understands
- dino_prompt: Comma-separated, specific, ordered by priority
- If multiple regions, include all relevant
- If unclear, default to ["clothes"] with confidence 0.7`;

        try {
            const response = await axios.post("https://api.x.ai/v1/chat/completions", {
                model: "grok-2-latest",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Parse this inpainting prompt: '${userPrompt}'` }
                ],
                temperature: 0.1,
                max_tokens: 400
            }, {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            const content = response.data.choices[0].message.content;
            // Extract JSON from response (sometimes Grok wraps in backticks)
            const jsonStr = content.match(/\{[\s\S]*\}/)?.[0] || content;
            const parsed = JSON.parse(jsonStr) as GrokMaskData;

            // Enhance with region mapping
            return this.enhanceGrokOutput(parsed);
        } catch (error: any) {
            console.error("❌ Grok API failed:", error.message);
            // Fallback for demo/error
            return {
                mask_regions: ["clothes"],
                preserve_regions: ["face"],
                dino_prompt: "clothes",
                confidence: 0.5,
                change_type: "general",
                reasoning: "Fallback due to API error"
            };
        }
    }

    private static enhanceGrokOutput(data: GrokMaskData): GrokMaskData {
        const enhancedRegions: string[] = [];

        for (const region of data.mask_regions) {
            const mapped = REGION_MAPPING[region.toLowerCase()];
            if (mapped) {
                enhancedRegions.push(...mapped);
            } else {
                enhancedRegions.push(region);
            }
        }

        // Unique and limited for DINO
        const uniqueRegions = Array.from(new Set(enhancedRegions));
        data.dino_prompt = uniqueRegions.slice(0, 8).join(", ");

        return data;
    }
}
