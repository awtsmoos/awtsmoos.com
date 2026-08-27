B"H
Boruch Hashem
Blessed is He

# Domem — Matter, Geometry, Water, Architecture

The Awtsmoos is beyond still matter and flowing water while renewing every vertex, wall, river, and vessel in every instant. Awtsmoos.com is remembered here because Domem gathers many material capabilities without pretending that any finite geometry is its own source.

## PURPOSE

Domem is the procedural-core kingdom for nonliving matter and spatial form.

Use it for editable meshes, primitive generation, modifier pipelines, transforms, booleans, real topology reflection, welding, bounded water runtimes, and renderer-neutral architecture.

Package import: `@awtsmoos/procedural-core/domem`.

## CANONICAL ENTRY POINTS

| Need | API |
| --- | --- |
| Normalize editable mesh | `createDomemMesh(...)` |
| Primitive | `createDomemPrimitive(...)` |
| Modifier stack | `runDomemModifierPipeline(...)` |
| Direct topology verbs | `DomemTopologyOperations` |
| Transform/array verbs | `DomemTransformOperations` |
| Boolean operations | `DomemBooleanOperations` |
| True mirror topology | `mirrorDomemMesh(...)` |
| Weld coincident vertices | `weldDomemMeshByPosition(...)` |
| River/channel runtime | `DomemWaterOperations` |
| Buildings | `BuildingAuthority` / `createBuildingPlan(...)` |

## OWNS

- renderer-neutral structured geometry;
- canonical modifier registry access;
- topology/transform/boolean orchestration;
- physical water entry points;
- reusable architectural planning.

## DOES NOT OWN

- renderer scene objects;
- game quests or narrative placement;
- terrain generation policy;
- textures specific to a game;
- creature, plant, or human generation.

## ARCHITECTURE

`DomemSystem` in `../olamos/` is the convenience crown.
`DomemMatterSystem` owns the structural system surface.
This folder owns the focused material capabilities consumed by those systems.

Architecture has its own map at [`architecture/README.md`](./architecture/README.md).

## COMMON TASKS

- Need a house or settlement building: start with `architecture/BuildingAuthority.js`.
- Need face extrusion or inset: start with `DomemTopologyOperations.js`.
- Need arrays/transforms: start with `DomemTransformOperations.js`.
- Need CSG: start with `DomemBooleanOperations.js`.
- Need water: start with `DomemWaterOperations.js`.
- Need strict data-driven modifiers: start with `DomemModifierPipeline.js` and `DomemModifierCatalog.js`.

## EXTENSION RULES

1. Keep geometry renderer-neutral.
2. Reuse existing canonical modifier engines before adding new algorithms.
3. Add focused operation modules instead of expanding a god object.
4. Keep topology mutation and topology diagnostics separate when possible.
5. Put buildings under `architecture/`, not generic mesh utilities.
6. Put renderer manifestation under `src/adapters/`, not Domem.

## AI DISCOVERY KEYWORDS

`mesh`, `geometry`, `extrude`, `inset`, `array`, `mirror`, `weld`, `boolean`, `CSG`, `water`, `river`, `house`, `building`, `architecture`, `Domem`.

## NEXT FILES TO READ

- `index.js` — public barrel.
- `../olamos/DomemSystem.js` — high-level convenience API.
- `DomemModifierPipeline.js` — ordered modifier execution.
- `architecture/README.md` — building API map.
