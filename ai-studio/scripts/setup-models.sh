#!/bin/bash

# Configuration
COMFY_DIR="/home/sujeetnew/Downloads/Ai-Studio/Ai-Studio-/ComfyUI"
SUPABASE_URL="https://zdpkjrbkgjflnqmdsxky.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcGtqcmJrZ2pmbG5xbWRzeGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI3OTUwMSwiZXhwIjoyMDg1ODU1NTAxfQ.t9bzLYUSEgzzJZiY1a0nPo4WjfPO6IM-c-OI6WdnYwA"

echo "🎨 Setting up AI Studio Models..."

# Create directories if they don't exist
mkdir -p "$COMFY_DIR/models/checkpoints"
mkdir -p "$COMFY_DIR/models/loras"
mkdir -p "$COMFY_DIR/models/controlnet"
mkdir -p "$COMFY_DIR/models/vae"
mkdir -p "$COMFY_DIR/models/clip_vision"

function register_model() {
    local name=$1
    local type=$2
    local filename=$3
    local base_model=$4

    echo "📝 Clean & Register $name ($type) in database..."
    
    # First, delete existing to avoid duplicates (using name + type as key)
    # We use name and type to uniquely identify system models in this script
    curl -X DELETE "${SUPABASE_URL}/rest/v1/models?name=eq.$(echo "$name" | sed 's/ /%20/g')&type=eq.$type" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}"

    # Register
    curl -X POST "${SUPABASE_URL}/rest/v1/models" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$name\", \"type\": \"$type\", \"file_path\": \"$filename\", \"base_model\": \"$base_model\", \"is_public\": true, \"is_system\": true}"
    
    echo ""
}

# 1. Download SD 1.5 Checkpoint
if [ ! -f "$COMFY_DIR/models/checkpoints/v1-5-pruned-emaonly.safetensors" ]; then
    echo "📥 Downloading SD 1.5..."
    wget -O "$COMFY_DIR/models/checkpoints/v1-5-pruned-emaonly.safetensors" "https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors"
fi
register_model "Stable Diffusion v1.5" "checkpoint" "v1-5-pruned-emaonly.safetensors" "sd15"

# 2. Download SVD (Video)
if [ ! -f "$COMFY_DIR/models/checkpoints/svd.safetensors" ]; then
    echo "📥 Downloading SVD (Video)..."
    wget -O "$COMFY_DIR/models/checkpoints/svd.safetensors" "https://huggingface.co/stabilityai/stable-video-diffusion-img2vid/resolve/main/svd.safetensors"
fi
register_model "SVD Video" "checkpoint" "svd.safetensors" "other"

# 3. Download ControlNet Canny
if [ ! -f "$COMFY_DIR/models/controlnet/control_v11p_sd15_canny.pth" ]; then
    echo "📥 Downloading ControlNet Canny..."
    wget -O "$COMFY_DIR/models/controlnet/control_v11p_sd15_canny.pth" "https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11p_sd15_canny.pth"
fi
register_model "ControlNet Canny" "controlnet" "control_v11p_sd15_canny.pth" "sd15"

# 4. Download popular LoRA (Example: LCM for fast generation)
if [ ! -f "$COMFY_DIR/models/loras/lcm-lora-sdv1-5.safetensors" ]; then
    echo "📥 Downloading LCM LoRA..."
    wget -O "$COMFY_DIR/models/loras/lcm-lora-sdv1-5.safetensors" "https://huggingface.co/latent-consistency/lcm-lora-sdv1-5/resolve/main/pytorch_lora_weights.safetensors"
fi
register_model "LCM Fast Generation" "lora" "lcm-lora-sdv1-5.safetensors" "sd15"

# 5. Download CLIP Vision Model (Required for SVD)
if [ ! -f "$COMFY_DIR/models/clip_vision/clip_vision_g.safetensors" ]; then
    echo "📥 Downloading CLIP Vision model..."
    wget -O "$COMFY_DIR/models/clip_vision/clip_vision_g.safetensors" "https://huggingface.co/comfyanonymous/clip_vision_g/resolve/main/clip_vision_g.safetensors"
fi
# Register as type 'other' for now if we don't have a specific CLIP_VISION type in UI list, 
# or just assume it's for the clipVision node which doesn't fetch from DB yet.
# Actually, let's keep it simple for now as the node currently uses a hardcoded list.

echo "✅ Model setup complete!"
echo "Note: SVD is now available for your video workflows."
