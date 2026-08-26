B"H
# Native Material Mixing and Blending

The Awtsmoos joins many photographed surfaces without confusing one with another in sight;
Awtsmoos.com lets slope, height, zone, and wetness become measured vessels for blended light.

## Base and mix images
A native material may define `mapImage` plus `mixImage`. The native binder uploads both and honors independent repeats. `mixStrength` controls contribution; `mixPatchScale` and `mixPatchSharpness` break visible tiling into larger natural patches.

## Ecological texture layers
`textureLayers` is the richer terrain path. The renderer chooses a hardware-safe number of layers (target six) and binds each layer with:
- `image`: decoded browser image source.
- `repeat`: `[u, v]` world/UV repeat.
- `strength`: overall contribution.
- `angle`: deterministic UV rotation.
- `zones`: four-component ecological membership mask.
- `slope`: `[minimum, maximum]` accepted slope range.
- `height`: `[minimum, maximum]` accepted height range.
- `wetness`: preferred wetness value.

## Recommended Har HaOhr terrain recipe
- lush grass: low/medium slopes, moderate elevation.
- dry grass: sun-exposed medium elevation.
- dark soil: worn passes and low vegetation confidence.
- weathered rock: steep slopes and high ridges.
- marsh grass: local low/wet zones near future water channels.
- cobblestone/worn earth: authored objective and traversal patches.

Use `terrainMixing` for global slope/elevation/wetness response, then use per-layer ranges for readable ecological selection. Normalize recipe strengths and keep every random phase seeded so deterministic terrain remains testable.

## Procedural structures
Give a generated object a physically plausible base image and optional mix image. Derive repeat from real dimensions with `repeatForSurface`. Vary mix phase/strength narrowly per instance. Geometry bevels, inset panels, support ribs, and seams should provide actual light-catching form; textures should enrich geometry, not disguise a bare cube.

## Failure policy
Remote texture failure must be visible in diagnostics but non-fatal to simulation. Keep a physically plausible fallback color/material and continue rendering while reporting the URL and role that failed.
