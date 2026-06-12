B'H
# Audit — WebGL/OffscreenCanvas Texture Backend + Previews + Progress

Implemented:
1. New `ProceduralWebGLTextureBackend.js`
   - Uses `OffscreenCanvas` + WebGL when available.
   - Runs one fragment shader pass per texture/channel.
   - Uses `readPixels` and returns RGBA bytes.
   - If unavailable/failing, returns null.
2. `ProceduralShaderTextureLibrary.js`
   - Now imports the WebGL backend.
   - `shaderTexture()` attempts WebGL/offscreen first unless `backend:'cpu'` is passed.
   - Falls back to CPU JS shader generation automatically.
   - Texture userData records backend: `webgl-offscreen` or `cpu-js`.
   - `warmVillageShaderTextures()` now emits progress per texture:
     `{done,total,percent,kind,channel,backend}`.
3. `MitzvahWorldPostBuild.js`
   - Passes `olam` and progress callback into warmup.
   - Sends both:
     - `updateProgress` with shaderTextureProgress payload.
     - `increase loading percentage` with visible percent/action/subAction.
   - This should display first-load percentage during the shader texture pass if the loading UI is active.
4. Previews:
   - Expanded `tools/generateVillageShaderTexturePreviews.mjs` to 18 kinds * 5 channels.
   - Regenerated previews at 128px.
   - Verified file count: 90 preview PNGs in `assets/textures/realisticVillageShaderPreviews`.
5. Cache busting:
   - Material imports updated to `webgl-progress-materials-20260612-bh1`.
   - Postbuild imports updated to `webgl-progress-postbuild-20260612-bh2`.
   - Loader/graft/root chain cache-busted.

Verification:
- `node --check` passed for key rewritten files.
- Preview generator ran and produced 90 PNGs.
- HTTP preview returned 200.
- Grep verified old targeted cache strings removed after final material import bust.

Honest caveat:
- Runtime will use WebGL only when OffscreenCanvas + WebGL is present in that environment. If Android browser worker blocks it, it falls back to CPU JS. The CLI preview script is Node CPU because Node here does not provide browser OffscreenCanvas/WebGL.

Awtsmoos chapter:
The texture forge gained two furnaces. First it asks the hidden canvas of the browser to burn a shader into pixels. If that gate is closed, the CPU recites the same kind of law and still births the texture. Every birth is counted aloud.