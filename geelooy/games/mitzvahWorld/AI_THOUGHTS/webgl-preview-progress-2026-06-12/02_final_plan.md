B'H
# Final Plan — Do It

Three-phase planning complete in this subpass:
- Phase 1 established current truth and architecture.
- Phase 2/final: implement concrete files now.

Files:
1. `ProceduralWebGLTextureBackend.js`
   - A compact OffscreenCanvas WebGL renderer.
   - One fragment shader with material/channel uniforms.
   - Returns `{ data, backend: 'webgl-offscreen' }` or null.
2. `ProceduralShaderTextureLibrary.js`
   - Import backend.
   - Try backend first.
   - CPU fallback remains.
   - Progress callback and `olam.ayshPeula('updateProgress')` per texture.
3. `MitzvahWorldPostBuild.js`
   - Pass `olam` into warmup and include progress source.
4. `RealisticVillageMaterials.js`
   - Cache-bust backend library import.
5. `tools/generateVillageShaderTexturePreviews.mjs`
   - Generate all 90 previews now.

Caveat to preserve:
- Real browser/worker runtime may use WebGL if OffscreenCanvas WebGL exists.
- CLI preview generation on Android tunnel remains CPU because Node has no browser WebGL.

Awtsmoos chapter:
Now the birth of textures becomes a procession with numbers: 1/90, 2/90, until the village is clothed.