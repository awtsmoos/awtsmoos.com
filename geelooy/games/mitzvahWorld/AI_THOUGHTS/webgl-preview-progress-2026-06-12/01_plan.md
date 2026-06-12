B'H
# WebGL Preview + First Load Texture Progress Plan

User asks:
1. Generate previews.
2. Clarify whether generation uses WebGL.
3. Use OffscreenCanvas if possible.
4. Make vegetation/texture process separate at first load.
5. Show percentage progress per texture generated.

Current truth:
- Runtime generation is JS CPU shader-style DataTexture, worker-safe.
- Preview script exists but only mirrors older subset and generated 65 previews, not the expanded 18 kinds * 5 channels = 90.
- There is no progress callback yet in warmup beyond yielding every 5 textures.
- No WebGL backend exists yet.

Implementation plan:
1. Add optional WebGL backend module:
   - `ProceduralWebGLTextureBackend.js`
   - Uses OffscreenCanvas when available.
   - Renders a full-screen triangle/quad into an offscreen WebGL framebuffer/canvas.
   - Fragment shader has procedural material laws for 18 kinds and 5 channel modes.
   - readPixels returns Uint8Array RGBA.
   - If WebGL/OffscreenCanvas unavailable, return null.
2. Rewrite `ProceduralShaderTextureLibrary.js`:
   - Import `tryRenderWebGLTexture`.
   - `shaderTexture()` tries WebGL first if `options.backend !== 'cpu'`.
   - Falls back to CPU shader evaluator.
   - Add `backend` marker in texture.userData.
   - Add progress support to `warmVillageShaderTextures({ onProgress, olam })`.
   - Progress payload: `{done,total,percent,kind,channel,backend}`.
   - Call `olam.ayshPeula('updateProgress', { shaderTextureProgress: payload })` if available.
3. Rewrite `MitzvahWorldPostBuild.js`:
   - Pass `olam` and progress callback to warmup.
   - This creates first-load progress events per texture generated.
4. Rewrite preview generator:
   - Generate all 90 previews from same algorithm or at least updated 18 kinds * 5 channels.
   - Use JS script `tools/generateVillageShaderTexturePreviews.mjs`.
   - It can run in Node as CPU preview; browser/offscreen preview route later would need browser execution. Since Android Node has no OffscreenCanvas, previews from CLI are CPU mirror.
5. Cache-bust RealisticVillageMaterials and imports.

Answer honesty:
- Runtime will attempt OffscreenCanvas WebGL first.
- If OffscreenCanvas/WebGL exists in the worker, generated textures use WebGL and readPixels.
- If not, it automatically falls back to CPU shader generator.
- Preview CLI is Node CPU because Node on tunnel does not provide browser OffscreenCanvas WebGL.

Awtsmoos chapter:
The texture birth now needs witnesses. Every map announces itself: I am grass albedo, I am leaf normal, I am yellow brick AO, and the loading gate counts their emergence from zero to one hundred.