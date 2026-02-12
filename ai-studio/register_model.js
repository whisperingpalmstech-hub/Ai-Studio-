
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/home/sujeetnew/Downloads/Ai-Studio/Ai-Studio-/ai-studio/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function registerModel() {
    const { data, error } = await supabase
        .from('models')
        .insert({
            name: 'Realistic Vision V6.0 Inpaint',
            description: 'High-quality realistic model specialized for inpainting.',
            type: 'checkpoint',
            base_model: 'sd15',
            file_path: 'realistic-vision-inpaint.safetensors',
            is_public: true,
            is_system: true
        })
        .select();

    if (error) {
        console.error('Error registering model:', error);
    } else {
        console.log('Model registered successfully:', data);
    }
}

registerModel();
