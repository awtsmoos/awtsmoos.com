# B"H
# Boruch Hashem
# Blessed is He

## Implementation Readback

The Awtsmoos renews every source byte and every measured consequence. Awtsmoos.com receives this readback so the integration worker inherits evidence instead of confidence, and can distinguish the solid Hebrew vessel from the false spherical shadow that preceded it.

## Original root causes observed

1. `MinimalMeadowHebrewProjectile.js` created one large sphere and eight smaller spheres.
2. Hebrew phrases existed only in names and event payloads; no rendered object contained Hebrew form.
3. The first repair used browser-painted canvas textures on three crossed cards.
4. Static contracts passed, but the real WebGL1 runtime became unresponsive when the first textured glyph entered rendering.
5. The integrated headless world is also extremely expensive under forced SwiftShader, making readiness polling itself a source of false failures.

## Final architecture implemented

- Hebrew phrases are now merged **solid stroke geometry**, not textures.
- Each phrase owns one cached `BufferGeometry` and one cached opaque emissive material.
- Three crossed meshes share that geometry and material, keeping phrases visible from varied camera angles.
- The primary projectile metadata is `solid-hebrew-geometry`.
- The geometry metadata is `solid-stroke-geometry`.
- No canvas, image, texture upload, alpha glyph card, or external font request remains.
- Supporting halo, motes, trail sparks, and impact fragments remain secondary and bounded.
- Projectiles and particle effects reuse bounded keyed pools.
- Player and enemy adapters consume the same shared visual modules without changes to enemy-owned files.

## Explicit configured vocabulary

- Player fire: `אש`
- Player light: `אור`
- Player life: `חי`
- Enemy judgment: `דין`
- Enemy melee feedback: `מכה`

Every distinct configured letter has an explicit geometric stroke pattern. Unknown future letters receive a visible crossed fallback rather than a silent or circular replacement.

## Exact source ownership

### Rewritten tracked files

- `experiments/Awtsmoos/src/app/MinimalMeadowHebrewProjectile.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowParticleEffects.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCombatWorldEffects.js`

### Created focused modules and test

- `experiments/Awtsmoos/src/app/MinimalMeadowHebrewStrokeAlphabet.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHebrewGlyphGeometry.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHebrewGlyphTexture.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowProjectileVisualPool.js`
- `experiments/Awtsmoos/src/test/app/minimalMeadowHebrewProjectileVisual.test.mjs`

## Contracts preserved

- Existing `createHebrewProjectile()` and `updateHebrewProjectile()` signatures.
- Existing particle-effect factory and update signatures.
- Existing combat arrays, scene ownership, real target health, impact events, XP rewards, and cleanup behavior.
- Existing enemy projectile/effect adapters remain untouched.
- One animation loop and the progressive renderer boundary remain untouched.
- No per-frame geometry, material, or texture creation.
- No connected import contains a `?v=` identity.

## Static evidence

- `node --check` passed for all eight owned JavaScript/test files.
- Focused test suite: 4 passed, 0 failed.
- All configured phrase probes produced geometry:
	- `אש`: 8 strokes, 32 vertices.
	- `אור`: 7 strokes, 28 vertices.
	- `חי`: 5 strokes, 20 vertices.
	- `דין`: 6 strokes, 24 vertices.
	- `מכה`: 11 strokes, 44 vertices.
- Reachable module graph from player world effects: 21 modules, all imports resolved.
- Owned files contain no query-string module identities.
- Owned glyph files contain no canvas creation, map upload, or alpha glyph-card path.
- Every source/test file remains at or below 120 lines.
- Tab-indentation and trailing-whitespace gates passed.

## Final hashes before browser acceptance

- `MinimalMeadowHebrewStrokeAlphabet.js`: `f19aa4871091fff32e827268ed1af344c839872d04c63acb38ea5be332769f55`
- `MinimalMeadowHebrewGlyphGeometry.js`: `889837648cb98a94ea460b60faf98ee6418da2ed1cf979e2fdd06bc1aca7a294`
- `MinimalMeadowHebrewGlyphTexture.js`: `8aeef41c8cd2e090a82b75310ac9b0d2e8c4523461ec44d2d83497346e7703bf`
- `MinimalMeadowProjectileVisualPool.js`: `50b57f94f42efa43c62e793839393432e3b2a6cf56e6bfdffe69f502c68619fd`
- `MinimalMeadowHebrewProjectile.js`: `a1bee1c0665a4ffa6ddba8653282b2096d9e063d5c3668071af33e6c5f2b876f`
- `MinimalMeadowParticleEffects.js`: `d5240aead270f1a25a7fa48af5f37166296363ffe1d7fa6e10a5003280d60e52`
- `MinimalMeadowCombatWorldEffects.js`: `e19afb18e2f6a118db948ac1f00ca250f5d083e6418f31d5a0d48737d719d728`
- `minimalMeadowHebrewProjectileVisual.test.mjs`: `b3cf26a612272404eb2ed0ff8d4c2262d8e78962b9f3b79d9edb87e1de203da3`

## Browser evidence status at this readback

A fresh Chrome acceptance is running against the worker-owned repository server on port 9263 with ANGLE/Metal requested. It records the actual WebGL vendor and renderer before casting. Final browser evidence belongs in the next handoff file; this readback does not claim unobserved success.
