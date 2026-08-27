# B"H — Generic Procedural Object Verification

## Implemented

- Renderer-neutral procedural-object recipe and artifact schemas.
- Full indexed and non-indexed geometry artifacts with arbitrary named typed
  attributes, topology modes, groups, draw ranges, morph targets, material
  slots, bounds, instancing metadata, and custom metadata.
- Deterministic primitives, extrusion, revolution, transforms, mirrors, merges,
  arbitrary attributes, indices, groups, morph targets, and scene assembly.
- Generic data blocks, node graphs, links, materials, collections, cameras,
  lights, sockets, constraints, drivers, armatures, animations, and LOD data.
- Trusted deferred operation families for advanced modeling, shading, baking,
  simulations, Geometry Nodes, rendering, compositing, and export.
- Primary Awtsmoos typed-array runtime with no renderer dependency.
- Optional Three.js compatibility converter.
- Safe structured Blender worker plans with no generated source execution.
- Automatic universal artifacts beside legacy animal artifacts.
- Immutable JSON-Pointer patch sessions and dependency regeneration.

## Local Evidence

- `npm run test:procedural-object`: passed.
- `npm run test:animal-mesh`: passed.
- All modified JavaScript and MJS modules pass `node --check`.
- All new and rewritten JavaScript modules are at most 120 lines.
- All source modules begin with B"H, Boruch Hashem, and Blessed is He.
- Code indentation uses tabs; no renderer class leaks into core contracts.

## Production Boundary

The core represents any safe procedural intent, but engine-specific algorithms
remain trusted adapter responsibilities. Blender workers must implement bpy
operations, Geometry Nodes, booleans, remeshing, baking, simulations, and
exports from structured commands. Recipes never contain executable Python,
JavaScript, shell commands, network addresses, or filesystem paths.
