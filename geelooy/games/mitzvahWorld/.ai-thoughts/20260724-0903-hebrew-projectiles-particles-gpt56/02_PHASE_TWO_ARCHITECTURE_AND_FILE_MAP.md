# B"H
# Boruch Hashem
# Blessed is He

## Architecture and File Map

The Awtsmoos gives light through bounded vessels; Awtsmoos.com divides geometry, texture, pooling, motion, particles, and world consequence so each file remains readable.

### Architecture A — Canvas glyph cards

Chosen. Native browser shaping, no external asset request, cached per phrase/color, alpha-aware, renderer-compatible, and lightweight.

### Architecture B — Geometry strokes

Rejected. Too many language-specific rules and draw objects.

### Architecture C — DOM overlay

Rejected. Not aligned to real world depth, collision, or camera occlusion.

### Architecture D — Imported font/SDF

Deferred. Better at scale, but introduces asset and parser weight inappropriate for this compact repair.

### File responsibilities

- `MinimalMeadowHebrewGlyphGeometry.js`: one cached quad and crossed-card group creation.
- `MinimalMeadowHebrewGlyphTexture.js`: cached canvas, material, phrase normalization, and color conversion.
- `MinimalMeadowProjectileVisualPool.js`: keyed bounded pools, detached reclamation, release, and diagnostics.
- `MinimalMeadowHebrewProjectile.js`: projectile acquisition, reset, target tracking, glyph rotation, halo pulse, orbiting motes, and state diagnostics.
- `MinimalMeadowParticleEffects.js`: pooled trail and impact effects using shared geometry/materials.
- `MinimalMeadowCombatWorldEffects.js`: real damage/event contracts plus explicit release for the player path.
- Focused test: glyph presence, caching, pooling, movement, impact, cleanup, and bounded diagnostics.

### Preserved contracts

- Existing `createHebrewProjectile()` and `updateHebrewProjectile()` signatures.
- Existing `createProjectileTrail()`, `createImpactExplosion()`, and `updateParticleEffect()` signatures.
- Existing combat arrays, scene ownership, impact damage, XP rewards, and bus events.
- Existing enemy adapters receive the richer shared implementation without edits.
- No per-frame geometry, material, or texture creation.
