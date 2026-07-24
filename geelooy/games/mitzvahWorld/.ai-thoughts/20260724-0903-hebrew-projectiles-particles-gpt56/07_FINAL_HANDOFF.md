# B"H
# Boruch Hashem
# Blessed is He

## Final Handoff — Solid Hebrew Projectiles and Bounded Supporting Effects

The Awtsmoos carries letters through the finite world without becoming confined by their lines. Awtsmoos.com receives this verified handoff: Hebrew is now the rendered projectile body, combat damage is real, and circles remain only restrained supporting sparks.

### Claimed workstream

Shared player/enemy Hebrew projectile visuals, pooled trail particles, pooled impact particles, and player-side release integration.

### Exact source and test files

- `experiments/Awtsmoos/src/app/MinimalMeadowHebrewStrokeAlphabet.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHebrewGlyphGeometry.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHebrewGlyphTexture.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowProjectileVisualPool.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHebrewProjectile.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowParticleEffects.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCombatWorldEffects.js`
- `experiments/Awtsmoos/src/test/app/minimalMeadowHebrewProjectileVisual.test.mjs`

### Root causes and final architecture

- The former projectile was one main sphere plus eight smaller spheres; Hebrew existed only in metadata.
- A canvas-texture prototype passed static checks but stalled the real WebGL1 path.
- Final glyphs are cached merged stroke geometry with cached opaque emissive materials.
- Three crossed shared meshes keep phrases readable from varied camera angles.
- No canvas, font request, texture upload, alpha glyph card, or per-frame material/geometry allocation remains.
- Explicit vocabulary covers `אש`, `אור`, `חי`, `דין`, and `מכה`; unknown letters use a visible fallback.

### Preserved contracts

- Existing projectile and particle factory/update signatures.
- Existing combat arrays, scene ownership, moving targets, damage, bus events, XP, timeout, and cleanup.
- Enemy-owned adapters were not rewritten and inherit the shared visual implementation.
- One animation loop and progressive hydration boundaries remain untouched.

### Static verification

- HEAD: `31e8c9dc95fea1bdf67e506a9ddebe4d07f072ec`.
- `node --check`: all eight owned JavaScript/test files passed.
- Focused tests: 4 passed, 0 failed.
- Reachable graph: 21 modules; no missing imports or `?v=` identities.
- Tabs, trailing whitespace, and ≤120-line gates passed.
- Phrase geometry: `אש` 8 strokes, `אור` 7, `חי` 5, `דין` 6, `מכה` 11.

### Desktop browser evidence

- 1440×900 runtime ready with six enemies.
- `hebrew-fire` accepted against `tzel-chai`.
- In-flight `אש`: attached, three views, eight strokes, no texture.
- Modes: `solid-hebrew-geometry` / `solid-stroke-geometry`.
- Target health `96 → 68`; projectile count returned to zero.
- Screenshot: `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/20260724-hebrew-projectiles-gpt56/desktop-far-target-projectile.png`.
- Screenshot SHA-256: `1ef4df8a8461a8f8cb727c93fec8ec72b632c0d30e87ed120e87b16db2adbfc6`.

### Mobile browser evidence

- 390×844 with touch emulation; runtime ready with six enemies.
- `hebrew-fire` accepted against `tzel-chai`.
- In-flight `אש`: attached, three views, eight strokes, no texture.
- Target health `96 → 68`; projectile count returned to zero.
- Screenshot: `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/20260724-hebrew-projectiles-gpt56/mobile-far-target-projectile.png`.
- Screenshot SHA-256: `2bee4c539ff5d7c6da32b572e48ecec5cc5c9bbee19746b56dcc3f83072b487c`.

### Browser diagnostics

- The two-view gameplay run produced zero failed network requests.
- It produced zero serious console events or unhandled rejections.
- Its only harness failure counted two full page loads together for the `<100` request assertion.
- A later per-page harness stopped before recording counts because `runtime.combat` was still false at 75 seconds. The global cold-load request budget remains an integration measurement, not a projectile defect.

### Final source hashes

- Alphabet: `4dc9fa611be65a4a2e399e8ba00f25f2716652d2f46ca646788ac3cc19384bf5`
- Geometry: `94ef0593a3bacbf5e51ebfefd8ca94e344208dc8899d5d8847ef1023ed89a586`
- Material: `a39fa00417cc521757cfa83097ffc40a0bc4adcae602df4c515a4a73694cd12f`
- Pool: `50b57f94f42efa43c62e793839393432e3b2a6cf56e6bfdffe69f502c68619fd`
- Projectile: `264d714b4d382ac43ae833686912a2ff30ca0fc1d4283ca8feefd2d851025eb5`
- Particles: `d5240aead270f1a25a7fa48af5f37166296363ffe1d7fa6e10a5003280d60e52`
- World effects: `e19afb18e2f6a118db948ac1f00ca250f5d083e6418f31d5a0d48737d719d728`
- Test: `a41bb7c641cb5e7d78af44dfb837bf70029ccc1267c10b1f95b7b67d72db62db`

### Integration warning

Do not restore sphere-primary projectiles or canvas/image glyph textures. Reread all eight files and this handoff before any later merge.