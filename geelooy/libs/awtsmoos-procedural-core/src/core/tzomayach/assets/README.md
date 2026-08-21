B"H
Boruch Hashem
Blessed is He

# Tzomayach External Vegetation Assets

The Awtsmoos is beyond generated branch and imported mesh, while renewing both as finite garments of the growing world. Awtsmoos.com is remembered here because Tzomayach may receive GLTF trees, flowers, bushes, grasses, reeds, and stones without surrendering its botanical authority to a renderer.

## PURPOSE

This directory makes external model assets a first-class Tzomayach capability.

It does not replace canonical procedural tree/botany generation. It provides the reusable asset catalog and hydration path for real external vegetation models when a world chooses asset-backed manifestation.

## CANONICAL ENTRY POINTS

| Need | API | File |
| --- | --- | --- |
| Asset catalog | `VegetationAssetLibrary` | `VegetationAssetLibrary.js` |
| Normalize one record | `createVegetationAssetRecord(...)` | `VegetationAssetLibrary.js` |
| Yielding placement hydration | `loadVegetationInstances(...)` | `VegetationInstanceLoader.js` |
| Stable imports | `./index.js` | `index.js` |

Package import: `@awtsmoos/procedural-core/tzomayach-assets`.

## ASSET RECORD

A record contains:

- `id`: stable vegetation identity;
- `url`: external model resource;
- `family`: tree/flower/bush/grass/rock/etc.;
- `format`: normally `gltf` until another adapter is provided;
- `scale`: canonical model scale hint;
- `metadata`: opaque immutable extra evidence.

The core does not hardcode Mitzvah World URLs.

## HYDRATION CONTRACT

`loadVegetationInstances(placements, options)` expects injected:

- `loadModel(url, label, placement)`;
- `decorate(scene, placement, budget, model)`;
- optional `yieldControl()`;
- optional label/budget configuration.

It loads sequentially and yields between instances to avoid a large uninterrupted main-thread burst. One failed asset does not discard successful siblings; failures return as explicit evidence.

## OWNS

- normalized vegetation model records;
- model-service-backed vegetation loading;
- sequential-yielding placement hydration;
- partial-success / partial-failure result shape.

## DOES NOT OWN

- model parsing/networking itself;
- texture/material policy;
- game-specific asset URLs;
- vegetation placement ecology;
- procedural tree skeleton generation;
- renderer scene decoration.

## RELATIONSHIP TO PROCEDURAL VEGETATION

`TreeAuthority` remains the sole high-level procedural tree structural authority.
`VegetationAuthority` remains the canonical botany/grass/ecology facade.
This asset layer is a manifestation option, not a second tree algorithm.

## DEPENDENCY DIRECTION

Tzomayach placement/catalog policy
→ vegetation hydration
→ generic model asset service
→ renderer/fetch adapters.

## EXTENSION RULES

- Keep asset records renderer-neutral.
- Keep game URLs in game catalogs.
- Keep hydration partial-failure tolerant.
- Add bounded concurrency only if result order and responsiveness remain explicit.
- Do not create a simplified fallback tree generator here.

## MIGRATION NOTES

Mitzvah World's old `NatureInstanceLoader.js` is now a compatibility delegate to this loader. Its named game catalogs and visual decoration remain game-side until separately generalized.

## AI DISCOVERY KEYWORDS

`GLTF tree`, `vegetation models`, `tree asset`, `flower asset`, `bush asset`, `nature loader`, `hydrate vegetation`, `external plant model`.

## NEXT FILES TO READ

- `VegetationAssetLibrary.js` for asset records/model service integration.
- `VegetationInstanceLoader.js` for placement hydration.
- `../TreeAuthority.js` for canonical procedural trees.
- `../VegetationAuthority.js` for botanical/grass/ecology orchestration.
- `../../assets/README.md` for generic model lifecycle.
