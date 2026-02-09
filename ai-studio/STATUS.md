# Project Status

## Recent Updates
- **Fixed Workflow Editor Visibility**:
  - Resolved "white bar" issue on ReactFlow controls.
  - Improved contrast for grid, sidebar, and edges.
  - Fixed Node Handle visibility (removed overflow clipping) and Label overlaps.
  - Removed white background artifacts from custom nodes.
- **Fixed Node Connections**:
  - **Critical Fix**: Added unique `id` attributes to all node handles (Model, CLIP, VAE, etc.). This resolves the bug where selecting one handle would select the wrong one. Connections are now precise.
- **Added Missing Nodes**:
  - Implemented `EmptyLatentImageNode` for resolution control.
  - Added `VAEEncodeNode`, `VAEDecodeNode` for advanced pipelines.
  - Added `FaceSwapNode` (Reactor) and `InpaintNode` visual components.
- **Fixed Landing Page Layout**:
  - Enforced absolute positioning for hero section background elements to prevent layout shifts.
  - Cleaned up Flexbox alignment logic to ensure perfect centering.
  - **Fixed Interaction Issues**: Added `pointer-events: none` to background layers and boosted content Z-Index to ensure buttons are clickable.
- **API Updates**:
  - Updated Hugging Face API endpoint to `router.huggingface.co`.
  - **Enforced Model Allowlist**: Only supports `SD 2.1`, `SD 1.4`, `SDXL 1.0`, `SDXL Turbo`. Unsupported models fallback to efficient defaults.
  - **Restricted Features**: Explicitly blocked Img2Img on Serverless backend to prevent confusion/errors.
  - **Fixed Request Payload**: Removed complex parameters, now sending only `{ inputs }` to comply with Serverless requirements. Added `Accept: image/png` header.

## Next Steps
- Validate FaceSwap backend integration when available.
- Refine LoRA functionality.
