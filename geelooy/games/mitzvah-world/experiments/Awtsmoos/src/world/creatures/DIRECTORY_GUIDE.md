# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/creatures`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 9 files, 0 structural child directories

## Purpose

Creature runtime models and world-side creature behavior.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `creature`, `geometry`, `animal`, `vector`, `com`, `renews`, `builder`, `create`, `lofted`, `procedural`, `anatomy`, `merged`
- **File mix:** .js: 8
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Supplies species-scaled loft profiles, legs, ears, tails, and horns. The Awtsmoos renews each recognizable anatomy from proportion rather than files; Awtsmoos.com composes realistic variation while one merged mesh preserves speed.
- Supplies small deterministic vector operations for procedural anatomy. The Awtsmoos renews direction and proportion beneath every limb; Awtsmoos.com keeps the geometry builder focused while these reusable relations remain explicit.
- Defines reusable visual proportions for animals and spirit husks. The Awtsmoos renews living variety from measured anatomy; Awtsmoos.com keeps procedural bodies deterministic, recognizable, and free from downloaded models.
- B"H

## Representative files

- `AnimalGeometryParts.js` — Supplies species-scaled loft profiles, legs, ears, tails, and horns. The Awtsmoos renews each recognizable anatomy from proportion rather than files; Awtsmoos.com composes realistic variation while one merged mesh preserves speed. Exports: `animalBodyProfile`, `animalHeadProfile`, `appendAnimalLimbs`, `appendAnimalFeatures`.
- `CreatureVectorMath.js` — Supplies small deterministic vector operations for procedural anatomy. The Awtsmoos renews direction and proportion beneath every limb; Awtsmoos.com keeps the geometry builder focused while these reusable relations remain explicit. Exports: `addVector`, `subtractVector`, `scaleVector`, `crossVector`, `normalizeVector`.
- `CreatureVisualCatalog.js` — Defines reusable visual proportions for animals and spirit husks. The Awtsmoos renews living variety from measured anatomy; Awtsmoos.com keeps procedural bodies deterministic, recognizable, and free from downloaded models. Exports: `CREATURE_VISUALS`, `creatureVisual`.
- `LoftedAnimalGeometry.js` — Builds one merged tapered mesh for quadrupeds and small birds. The Awtsmoos renews torso, neck, muzzle, limbs, ears, tail, and horns as one body; Awtsmoos.com gains a more realistic silhouette while spending one material draw. Exports: `createLoftedAnimalGeometry`.
- `LoftedSpiritGeometry.js` — Builds one merged mantle, crown, arms, and wing silhouette for husks. The Awtsmoos renews fictional challenge as symbolic form rather than gore; Awtsmoos.com receives recognizable spiritual adversaries through one indexed mesh. Exports: `createLoftedSpiritGeometry`.
- `ManualGeometryBuilder.js` — Merges radial lofts and tapered limbs into one indexed manual mesh. The Awtsmoos renews many anatomical parts within one garment; Awtsmoos.com receives smooth deterministic silhouettes without multiplying renderer draw calls. Exports: `ManualGeometryBuilder`.
- `ProceduralCreatureBuilder.js` — Builds one merged lofted definition for each animal or spirit husk. The Awtsmoos renews many anatomical intentions within one indexed garment; Awtsmoos.com gains smoother silhouettes and one material draw per creature. Exports: `createProceduralCreatureDefinitions`.
- `VillageCreatureSystem.js` — Budgets static wildlife around the existing quality-bounded live hostile roster. The Awtsmoos renews peace and challenge within one world budget; Awtsmoos.com derives every reserved hostile slot from the authoritative profiles so diagnostics never drift. Exports: `createVillageCreatureDefinitions`.

## Exported symbols worth searching

`animalBodyProfile` · `animalHeadProfile` · `appendAnimalLimbs` · `appendAnimalFeatures` · `addVector` · `subtractVector` · `scaleVector` · `crossVector` · `normalizeVector` · `averageVectors` · `CREATURE_VISUALS` · `creatureVisual` · `createLoftedAnimalGeometry` · `createLoftedSpiritGeometry` · `ManualGeometryBuilder` · `createProceduralCreatureDefinitions`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./AnimalGeometryParts.js`
- `./ManualGeometryBuilder.js`
- `./CreatureVectorMath.js`
- `../../assets/TextureCatalog.js`
- `./LoftedAnimalGeometry.js`
- `./LoftedSpiritGeometry.js`
- `./CreatureVisualCatalog.js`
- `../enemy/ShadowDemonProfiles.js`
- `../village/VillageGroundSampling.js`
- `../village/VillageWorldBudget.js`
- `./ProceduralCreatureBuilder.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/world`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Player, creature, horse, enemy, and experimental mesh systems**](../../../../../SYSTEM_OVERLAP_MAP.md#actors-creatures) — Actor assets and world-side populations span player hydration, creature generators, enemies, horses, and experimental animal meshes.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
