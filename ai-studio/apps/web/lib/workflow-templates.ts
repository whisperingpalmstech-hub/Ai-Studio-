export const WORKFLOW_TEMPLATES = [
    {
        id: 'tpl-txt2img',
        name: 'Standard Text-to-Image',
        description: 'The foundation of AI art. Generate high-quality images from pure text descriptions.',
        category: 'Essentials',
        nodes: [
            { id: '1', type: 'loadModel', position: { x: 50, y: 50 }, data: { label: 'Load Checkpoint' } },
            { id: '2', type: 'prompt', position: { x: 400, y: 50 }, data: { label: 'Positive Prompt', prompt: 'a beautiful futuristic city, high detail, 8k' } },
            { id: '3', type: 'prompt', position: { x: 400, y: 250 }, data: { label: 'Negative Prompt', prompt: 'blurry, distorted, low quality, text' } },
            { id: '4', type: 'emptyLatent', position: { x: 400, y: 450 }, data: { label: 'Empty Latent', width: 512, height: 512 } },
            { id: '5', type: 'sampler', position: { x: 750, y: 50 }, data: { label: 'KSampler', steps: 25, cfg: 7.5 } },
            { id: '6', type: 'vaeDecode', position: { x: 1050, y: 50 }, data: { label: 'VAE Decode' } },
            { id: '7', type: 'output', position: { x: 1350, y: 50 }, data: { label: 'Save Image' } }
        ],
        edges: [
            { id: 'e1-5', source: '1', target: '5', sourceHandle: 'model', targetHandle: 'model' },
            { id: 'e1-2', source: '1', target: '2', sourceHandle: 'clip', targetHandle: 'clip' },
            { id: 'e1-3', source: '1', target: '3', sourceHandle: 'clip', targetHandle: 'clip' },
            { id: 'e2-5', source: '2', target: '5', sourceHandle: 'conditioning', targetHandle: 'positive' },
            { id: 'e3-5', source: '3', target: '5', sourceHandle: 'conditioning', targetHandle: 'negative' },
            { id: 'e4-5', source: '4', target: '5', sourceHandle: 'latent', targetHandle: 'latent_in' },
            { id: 'e5-6', source: '5', target: '6', sourceHandle: 'latent_out', targetHandle: 'samples' },
            { id: 'e1-6', source: '1', target: '6', sourceHandle: 'vae', targetHandle: 'vae' },
            { id: 'e6-7', source: '6', target: '7', sourceHandle: 'image', targetHandle: 'images' }
        ]
    },
    {
        id: 'tpl-img2img',
        name: 'Creative Image-to-Image',
        description: 'Transform existing images into new styles while maintaining composition and structure.',
        category: 'Transformation',
        nodes: [
            { id: '1', type: 'loadModel', position: { x: 50, y: 50 }, data: { label: 'Load Checkpoint' } },
            { id: '2', type: 'prompt', position: { x: 400, y: 50 }, data: { label: 'Positive Prompt', prompt: 'oil painting style, vibrant colors' } },
            { id: '3', type: 'prompt', position: { x: 400, y: 250 }, data: { label: 'Negative Prompt' } },
            { id: '4', type: 'loadImage', position: { x: 50, y: 350 }, data: { label: 'Load Image' } },
            { id: '5', type: 'vaeEncode', position: { x: 400, y: 450 }, data: { label: 'VAE Encode' } },
            { id: '6', type: 'sampler', position: { x: 750, y: 50 }, data: { label: 'KSampler', steps: 30, cfg: 8.0, denoise: 0.6 } },
            { id: '7', type: 'vaeDecode', position: { x: 1050, y: 50 }, data: { label: 'VAE Decode' } },
            { id: '8', type: 'output', position: { x: 1350, y: 50 }, data: { label: 'Save Image' } }
        ],
        edges: [
            { id: 'e1-6', source: '1', target: '6', sourceHandle: 'model', targetHandle: 'model' },
            { id: 'e1-2', source: '1', target: '2', sourceHandle: 'clip', targetHandle: 'clip' },
            { id: 'e1-3', source: '1', target: '3', sourceHandle: 'clip', targetHandle: 'clip' },
            { id: 'e2-6', source: '2', target: '6', sourceHandle: 'conditioning', targetHandle: 'positive' },
            { id: 'e3-6', source: '3', target: '6', sourceHandle: 'conditioning', targetHandle: 'negative' },
            { id: 'e4-5', source: '4', target: '5', sourceHandle: 'image', targetHandle: 'pixels' },
            { id: 'e1-5', source: '1', target: '5', sourceHandle: 'vae', targetHandle: 'vae' },
            { id: 'e5-6', source: '5', target: '6', sourceHandle: 'latent', targetHandle: 'latent_in' },
            { id: 'e6-7', source: '6', target: '7', sourceHandle: 'latent_out', targetHandle: 'samples' },
            { id: 'e1-7', source: '1', target: '7', sourceHandle: 'vae', targetHandle: 'vae' },
            { id: 'e7-8', source: '7', target: '8', sourceHandle: 'image', targetHandle: 'images' }
        ]
    },
    {
        id: 'tpl-lora',
        name: 'LoRA Style Integration',
        description: 'Inject specific styles or characters into your generations using specialized LoRA models.',
        category: 'Advanced',
        nodes: [
            { id: '1', type: 'loadModel', position: { x: 50, y: 50 }, data: { label: 'Load Checkpoint' } },
            { id: '2', type: 'lora', position: { x: 350, y: 50 }, data: { label: 'Load LoRA', strength_model: 1.0, strength_clip: 1.0 } },
            { id: '3', type: 'prompt', position: { x: 650, y: 50 }, data: { label: 'Positive Prompt' } },
            { id: '4', type: 'prompt', position: { x: 650, y: 250 }, data: { label: 'Negative Prompt' } },
            { id: '5', type: 'emptyLatent', position: { x: 650, y: 450 }, data: { label: 'Empty Latent' } },
            { id: '6', type: 'sampler', position: { x: 950, y: 50 }, data: { label: 'KSampler' } },
            { id: '7', type: 'vaeDecode', position: { x: 1250, y: 50 }, data: { label: 'VAE Decode' } },
            { id: '8', type: 'output', position: { x: 1550, y: 50 }, data: { label: 'Save Image' } }
        ],
        edges: [
            { id: 'e1-2m', source: '1', target: '2', sourceHandle: 'model', targetHandle: 'model_in' },
            { id: 'e1-2c', source: '1', target: '2', sourceHandle: 'clip', targetHandle: 'clip_in' },
            { id: 'e2-6', source: '2', target: '6', sourceHandle: 'model_out', targetHandle: 'model' },
            { id: 'e2-3', source: '2', target: '3', sourceHandle: 'clip_out', targetHandle: 'clip' },
            { id: 'e2-4', source: '2', target: '4', sourceHandle: 'clip_out', targetHandle: 'clip' },
            { id: 'e3-6', source: '3', target: '6', sourceHandle: 'conditioning', targetHandle: 'positive' },
            { id: 'e4-6', source: '4', target: '6', sourceHandle: 'conditioning', targetHandle: 'negative' },
            { id: 'e5-6', source: '5', target: '6', sourceHandle: 'latent', targetHandle: 'latent_in' },
            { id: 'e6-7', source: '6', target: '7', sourceHandle: 'latent_out', targetHandle: 'samples' },
            { id: 'e1-7', source: '1', target: '7', sourceHandle: 'vae', targetHandle: 'vae' },
            { id: 'e7-8', source: '7', target: '8', sourceHandle: 'image', targetHandle: 'images' }
        ]
    },
    {
        id: 'tpl-inpaint',
        name: 'Professional Inpainting',
        description: 'Edit specific parts of an image by masking them. Perfect for fixing details or changing objects.',
        category: 'Repair',
        nodes: [
            { id: '1', type: 'loadModel', position: { x: 50, y: 50 }, data: { label: 'Load Checkpoint', model: 'realistic-vision-inpaint.safetensors' } },
            { id: '2', type: 'prompt', position: { x: 400, y: 50 }, data: { label: 'Positive Prompt' } },
            { id: '3', type: 'prompt', position: { x: 400, y: 250 }, data: { label: 'Negative Prompt' } },
            { id: '4', type: 'loadImage', position: { x: 50, y: 350 }, data: { label: 'Load Image & Mask' } },
            { id: '5', type: 'inpaint', position: { x: 400, y: 450 }, data: { label: 'Inpaint VAE' } },
            { id: '6', type: 'sampler', position: { x: 750, y: 50 }, data: { label: 'KSampler', denoise: 0.7 } },
            { id: '7', type: 'vaeDecode', position: { x: 1050, y: 50 }, data: { label: 'VAE Decode' } },
            { id: '8', type: 'output', position: { x: 1350, y: 50 }, data: { label: 'Save Image' } }
        ],
        edges: [
            { id: 'e1-6', source: '1', target: '6', sourceHandle: 'model', targetHandle: 'model' },
            { id: 'e1-2', source: '1', target: '2', sourceHandle: 'clip', targetHandle: 'clip' },
            { id: 'e1-3', source: '1', target: '3', sourceHandle: 'clip', targetHandle: 'clip' },
            { id: 'e2-6', source: '2', target: '6', sourceHandle: 'conditioning', targetHandle: 'positive' },
            { id: 'e3-6', source: '3', target: '6', sourceHandle: 'conditioning', targetHandle: 'negative' },
            { id: 'e4-5p', source: '4', target: '5', sourceHandle: 'image', targetHandle: 'pixels' },
            { id: 'e4-5m', source: '4', target: '5', sourceHandle: 'mask', targetHandle: 'mask' },
            { id: 'e1-5', source: '1', target: '5', sourceHandle: 'vae', targetHandle: 'vae' },
            { id: 'e5-6', source: '5', target: '6', sourceHandle: 'latent', targetHandle: 'latent_in' },
            { id: 'e6-7', source: '6', target: '7', sourceHandle: 'latent_out', targetHandle: 'samples' },
            { id: 'e1-7', source: '1', target: '7', sourceHandle: 'vae', targetHandle: 'vae' },
            { id: 'e7-8', source: '7', target: '8', sourceHandle: 'image', targetHandle: 'images' }
        ]
    },
    {
        id: 'tpl-controlnet',
        name: 'ControlNet Edge Detection',
        description: 'Guided generation using structural constraints like Canny edges or Depth maps.',
        category: 'Transformation',
        nodes: [
            { id: '1', type: 'loadModel', position: { x: 50, y: 50 }, data: { label: 'Load Checkpoint' } },
            { id: '2', type: 'prompt', position: { x: 700, y: 50 }, data: { label: 'Positive Prompt' } },
            { id: '3', type: 'prompt', position: { x: 400, y: 250 }, data: { label: 'Negative Prompt' } },
            { id: '4', type: 'loadImage', position: { x: 50, y: 350 }, data: { label: 'Load Control Image' } },
            { id: '5', type: 'controlNet', position: { x: 400, y: 50 }, data: { label: 'Apply ControlNet', strength: 1.0 } },
            { id: '6', type: 'emptyLatent', position: { x: 700, y: 450 }, data: { label: 'Empty Latent' } },
            { id: '7', type: 'sampler', position: { x: 1000, y: 50 }, data: { label: 'KSampler' } },
            { id: '8', type: 'vaeDecode', position: { x: 1300, y: 50 }, data: { label: 'VAE Decode' } },
            { id: '9', type: 'output', position: { x: 1600, y: 50 }, data: { label: 'Save Image' } }
        ],
        edges: [
            { id: 'e1-7', source: '1', target: '7', sourceHandle: 'model', targetHandle: 'model' },
            { id: 'e1-2', source: '1', target: '2', sourceHandle: 'clip', targetHandle: 'clip' },
            { id: 'e2-5', source: '2', target: '5', sourceHandle: 'conditioning', targetHandle: 'conditioning_in' },
            { id: 'e5-7', source: '5', target: '7', sourceHandle: 'conditioning_out', targetHandle: 'positive' },
            { id: 'e4-5', source: '4', target: '5', sourceHandle: 'image', targetHandle: 'image' },
            { id: 'e1-3', source: '1', target: '3', sourceHandle: 'clip', targetHandle: 'clip' },
            { id: 'e3-7', source: '3', target: '7', sourceHandle: 'conditioning', targetHandle: 'negative' },
            { id: 'e6-7', source: '6', target: '7', sourceHandle: 'latent', targetHandle: 'latent_in' },
            { id: 'e7-8l', source: '7', target: '8', sourceHandle: 'latent_out', targetHandle: 'samples' },
            { id: 'e1-8', source: '1', target: '8', sourceHandle: 'vae', targetHandle: 'vae' },
            { id: 'e8-9', source: '8', target: '9', sourceHandle: 'image', targetHandle: 'images' }
        ]
    },
    {
        id: 'tpl-video',
        name: 'Generative AI Video (SVD)',
        description: 'Bring static images to life. Transform a single image into a cinematic high-fidelity video clip.',
        category: 'Advanced',
        nodes: [
            { id: '1', type: 'loadModel', position: { x: 50, y: 50 }, data: { label: 'SVD Checkpoint' } },
            { id: '2', type: 'loadImage', position: { x: 50, y: 350 }, data: { label: 'Input Image' } },
            { id: '3', type: 'svdLoader', position: { x: 400, y: 50 }, data: { label: 'SVD Conditioning', fps: 12, motion_bucket_id: 127, augmentation_level: 0.0 } },
            { id: '4', type: 'videoLinearCFG', position: { x: 400, y: 350 }, data: { label: 'Video CFG', min_cfg: 1.0 } },
            { id: '5', type: 'sampler', position: { x: 750, y: 50 }, data: { label: 'Video Sampler', steps: 20, cfg: 2.5 } },
            { id: '6', type: 'vaeDecode', position: { x: 1050, y: 50 }, data: { label: 'Video Decode' } },
            { id: '7', type: 'videoCombine', position: { x: 1350, y: 50 }, data: { label: 'Video Combine', format: 'video/h264-mp4', fps: 12 } },
            { id: '8', type: 'clipVision', position: { x: 50, y: 200 }, data: { label: 'CLIP Vision Loader', model: 'clip_vision_vit_h.safetensors' } },
            { id: '9', type: 'output', position: { x: 1350, y: 350 }, data: { label: 'Save Frames' } }
        ],
        edges: [
            { id: 'e8-3', source: '8', target: '3', sourceHandle: 'clip_vision', targetHandle: 'clip_vision' },
            { id: 'e1-3v', source: '1', target: '3', sourceHandle: 'vae', targetHandle: 'vae' },
            { id: 'e2-3', source: '2', target: '3', sourceHandle: 'image', targetHandle: 'init_image' },
            { id: 'e1-4', source: '1', target: '4', sourceHandle: 'model', targetHandle: 'model' },
            { id: 'e4-5', source: '4', target: '5', sourceHandle: 'model_out', targetHandle: 'model' },
            { id: 'e3-5p', source: '3', target: '5', sourceHandle: 'positive', targetHandle: 'positive' },
            { id: 'e3-5n', source: '3', target: '5', sourceHandle: 'negative', targetHandle: 'negative' },
            { id: 'e3-5l', source: '3', target: '5', sourceHandle: 'latent', targetHandle: 'latent_in' },
            { id: 'e5-6', source: '5', target: '6', sourceHandle: 'latent_out', targetHandle: 'samples' },
            { id: 'e1-6', source: '1', target: '6', sourceHandle: 'vae', targetHandle: 'vae' },
            { id: 'e6-7', source: '6', target: '7', sourceHandle: 'image', targetHandle: 'images' },
            { id: 'e6-9', source: '6', target: '9', sourceHandle: 'image', targetHandle: 'images' }
        ]
    }
];
