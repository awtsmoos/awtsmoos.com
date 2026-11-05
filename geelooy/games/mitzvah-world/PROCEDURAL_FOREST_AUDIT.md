# B"H — Mitzvah World Procedural Forest Audit

## Canonical system

The active generator is `geelooy/libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js`.
Its public entrypoint is `geelooy/libs/awtsmoos-procedural-core/src/index.js`.
The public API exposes `TreeGenerator`, `generateTreeProceduralData`, `getTreePreset`, `listTreePresets`, preset constants, material catalogs, and structural validation.

## Dependency graph

```text
src/index.js
  -> treeGenerator.js
    -> treePresets.js
      -> ezTreePresets.js
      -> special Sakura / Dead Tree presets
      -> legacyTreePresetBridge.js
        -> core/core/.../presets/index.js
      -> awtsmoosTreeVarietyPresets.js
      -> treeMaterialCatalog.js
    -> treeGrowthSystem.js
      -> rng.js
      -> treeMath.js
    -> treeGeometryBuilder.js
      -> treeMath.js
```

```text
Terrain3D.js
  -> ProceduralForestSystem.js
    -> ForestPolicy.js
    -> ForestPlacement.js
    -> ForestGeometry.js
      -> ForestLeafTexture.js
      -> tiny-runtime.js
    -> ForestCollision.js
    -> awtsmoos-procedural-core
  -> exact road collider triangles
  -> exact obstacle collider triangles
  -> terrain ground sampler
```

## Preset inventory

The public registry contains 36 presets.

Ez-tree lineage: Ash Small, Ash Medium, Ash Large, Aspen Small, Aspen Medium, Aspen Large, Bush 1, Bush 2, Bush 3, Oak Small, Oak Medium, Oak Large, Pine Small, Pine Medium, Pine Large, Trellis.

Special presets: Sakura, Dead Tree.

Recovered legacy presets: Pine Classic, Pine Tall, Oak Majestic, Birch Elegant, Ash Standard, Aspen Grove.

Awtsmoos varieties: Redwood Giant, Cedar Broad, Cypress Column, Willow Weeping, Maple Crown, Olive Ancient, Date Palm, Baobab Giant, Acacia Umbrella, Apple Orchard, Poplar Tall, Mangrove Roots.

## Geometry and generation

The generator is deterministic and seed-driven.
It grows branches recursively through a bounded queue.
Branches are tapered indexed tubes with normals and UVs.
Leaves are indexed single or crossed planes with normals, UVs, and colors.
The generator returns separate branch and leaf payloads plus generation statistics.
Preset defaults are cloned before use and remain immutable.

## Capability matrix

Implemented: trunks, recursive branches, twigs through deeper branch levels, tapering, curvature through directional forces and gnarliness, canopy shaping through branch parameters, leaf clusters, individual leaf planes, bark types, leaf types, dead-tree foliage suppression, deterministic variation.

Not implemented in the canonical generator: dedicated roots, fruit, flowers, seasonal simulation, fallen logs, explicit dead-branch tagging, L-systems, space colonization, spline branches, billboard sprites, runtime wind, collision, placement, instancing, or dynamic LOD.

Some preset names describe roots or orchard species, but the active geometry path still emits only branches and leaves.

## Mitzvah World integration

The Eretz forest contains 54 deterministic trees and represents all 36 presets.
Fourteen trees use the near-showcase policy; forty use the mobile-canopy policy.
Policies clone presets and cap recursion, children, sections, segments, leaves, and total branches without mutating canonical defaults.

Placement rejects real road triangles, measured obstacle bounds, unsafe terrain slopes, spawn proximity, and inter-tree spacing.
No hard-coded house coordinates or invisible forest barriers are used.

All branch geometry is merged into one indexed draw.
All foliage geometry is merged into one indexed alpha-cutout, double-sided draw.
Leaf colors remain per-vertex and a procedural alpha mask avoids external leaf-asset dependency.

Collision is extracted only from visible lower-branch triangles.
The trunk radius is measured per tree from its own generated lower vertices.
There are no proxy cylinders, canopy colliders, or oversized forest walls.

## Verified metrics

Forest population: 54 trees.
Preset coverage: 36 of 36.
Forest draw calls: 2.
Forest triangles: 72,857.
Branch vertices: 33,739.
Leaf vertices: 55,328.
Visible trunk collision triangles: 5,118.
Every rendered tree contributes collision triangles.

Full local scene: 246 draws and 141,319 triangles.
WebGL error: 0.
Renderer error list: empty.
True mobile viewport: 390 × 844, matching canvas and camera aspect.
Mobile jump and joystick controls: present.

## Regression evidence

The canonical 36-preset suite validates finite positions, normals, UVs, colors, indices, bounds, determinism, and immutable defaults.
The forest suite validates deterministic placement, all-preset coverage, the triangle budget, two draws, finite merged buffers, valid indices, spawn clearance, and exact visible collision.
The previous geometry suite still passes for five houses, fourteen doors and mezuzahs, four staircases, 1,288 visible stair triangles, and zero road gaps or intersections.

## Explicit limitations

Tree wind is static because the tiny renderer only exposes a grass-specific deformation path.
LOD is selected at generation time to preserve two draw calls; there is no distance-swapped runtime LOD.
Fruit, flowers, dedicated roots, and fallen logs require future canonical generator features rather than scene-specific fakes.
