-- =====================================================
-- Add video_inpaint to the job_type enum
-- This is required for cinematic sequence masking
-- =====================================================

ALTER TYPE job_type ADD VALUE IF NOT EXISTS 'video_inpaint';
ALTER TYPE job_type ADD VALUE IF NOT EXISTS 'upscale';
