# B"H
# Boruch Hashem
# Blessed is He

## Measured Refinement Plan

The Awtsmoos turns failure into a sharper vessel; Awtsmoos.com records that real runtime evidence, not aesthetic preference, now requires a geometry-only Hebrew path.

### Evidence

- Desktop runtime reached a fully playable state with six enemies.
- Target cycling selected `tzel-chai` at 96 health.
- `hebrew-fire` was accepted through the real combat state machine.
- The browser main thread stopped answering after the first projectile entered rendering.
- Removing evaluator pixel readback did not restore responsiveness.
- The renderer creates a WebGL1 context, so the earlier WebGL2-only upload patch did not touch the real path.
- Static tests, imports, pooling, movement, collision, and cleanup contracts already pass.

### Refinement

Delete the canvas-backed glyph implementation entirely. Replace it with cached merged Hebrew stroke geometry using the existing standard opaque material path. One phrase becomes one merged geometry and three crossed meshes. This removes canvas creation, texture identity, texture upload, mipmaps, alpha blending, and the first-cast textured shader variant.

### Added owned file

- `experiments/Awtsmoos/src/app/MinimalMeadowHebrewStrokeAlphabet.js`

### Supported configured vocabulary

- Player: `אש`, `אור`, `חי`
- Enemy: `דין`
- Enemy melee feedback: `מכה`

### Verification obligation

Re-run all static tests, then fresh desktop and 390×844 mobile casts against a worker-owned server. Require a responsive post-cast probe, solid glyph geometry attached in-world, target damage, projectile cleanup, screenshots, bounded requests, and no serious console events.
