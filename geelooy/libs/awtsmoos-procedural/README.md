# B"H — @awtsmoos/procedural

Raw procedural geometry helpers for Awtsmoos games. This package emits plain mesh data only: `{ positions, indices, colors }`. It does not import THREE, Babylon, Pixi, PlayCanvas, or any renderer.

Current focus: stabilize world geometry for Nitzotz-style raw WebGL pipelines.

## Debug ritual

Use `makeGoldenProbe()` to submit one known cube into a render list. If the cube renders, the shader/camera/buffers can breathe. If city meshes fail but the probe works, inspect generated meshes with `inspectMesh(mesh)` and clamp building heights/spans.

## Exports

- deterministic RNG helpers
- primitive cube mesh
- finite mesh compaction
- mesh validation and summaries
- clamped building meshes
- deterministic city chunk meshes
- golden probe cube
