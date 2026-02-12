#!/bin/bash
SUPABASE_URL="https://zdpkjrbkgjflnqmdsxky.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcGtqcmJrZ2pmbG5xbWRzeGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI3OTUwMSwiZXhwIjoyMDg1ODU1NTAxfQ.t9bzLYUSEgzzJZiY1a0nPo4WjfPO6IM-c-OI6WdnYwA"

echo "🧹 Cleaning up duplicate models..."

# Delete all system models
curl -X DELETE "${SUPABASE_URL}/rest/v1/models?is_system=eq.true" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}"

function register_model() {
    local name=$1
    local type=$2
    local filename=$3
    local base_model=$4

    echo "📝 Registering $name ($type)..."
    curl -X POST "${SUPABASE_URL}/rest/v1/models" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$name\", \"type\": \"$type\", \"file_path\": \"$filename\", \"base_model\": \"$base_model\", \"is_public\": true, \"is_system\": true}"
    echo ""
}

# Register only unique set
register_model "Stable Diffusion v1.5" "checkpoint" "v1-5-pruned-emaonly.safetensors" "sd15"
register_model "SVD Video" "checkpoint" "svd.safetensors" "other"
register_model "ControlNet Canny" "controlnet" "control_v11p_sd15_canny.pth" "sd15"
register_model "LCM Fast Generation" "lora" "lcm-lora-sdv1-5.safetensors" "sd15"

echo "✅ Deduplication complete!"
