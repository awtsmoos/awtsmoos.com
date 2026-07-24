# B"H
# Boruch Hashem
# Blessed is He

## Production readback

The Awtsmoos renews every trunk and current, while Awtsmoos.com reveals the finite vessels through actual inspection rather than assumption.

### Root causes found

1. Trees were concentrated near perimeter anchors and did not create coherent groves across the meadow.
2. Vegetation used sixteen fixed cells and allocated transient reaction objects during updates.
3. Water creation awaited optional texture loading before the real scene received a visible river.
4. Existing house envelopes and entrance corridors were larger than stale tree exclusions assumed.
5. The tiny runtime accepts one child per `add` call; multi-argument calls silently omitted every tree canopy and every flower mesh.
6. Intended material counts differed from live scene material objects until diagnostics inspected actual children.

### Implemented structure

- One deterministic seed governs seven irregular groves, ecological vegetation cells, and fixed combat clearings.
- Tree placement varies preset, yaw, height, crown breadth, depth, and one of three bark/leaf palettes.
- Full tree crowns and full 4.5-unit vegetation-cell extents remain inside the playable envelope.
- Exact road distance, oriented house footprints, entrance corridors, quest access, clearings, river, and lake define exclusions.
- Mobile mounts 22 trees and 28 vegetation cells; desktop mounts 32 trees and 42 cells.
- Vegetation includes grass-meadow, dry-meadow, moist-meadow, and river-bank zones.
- Trees share six live materials and bounded template geometry; vegetation shares five live materials.
- River, lake, beds, banks, and shores derive from the same sampled path and terrain height contract.
- Water mounts immediately from cached procedural sources; optional texture hydration never replaces the visible group.
- Tree, vegetation, and water constructors are idempotent against existing runtime mounts.
- Update methods mutate existing numeric fields only; no textures or geometry are created per frame.

### Actual scene-child correction

Each tree now mounts bark and canopy with separate `group.add` calls. Each vegetation cell mounts grass and flowers the same way. Tests assert exactly two children per tree and per vegetation cell, preventing the former silent subsystem loss from returning.
