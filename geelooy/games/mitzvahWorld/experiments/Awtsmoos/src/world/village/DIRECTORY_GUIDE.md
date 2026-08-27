# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/village`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 128 files, 0 structural child directories

## Purpose

Large procedural-village system: layout, buildings, roads, populations, materials, districts, and runtime composition.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `village`, `canonical`, `geometry`, `cottage`, `mountain`, `arrival`, `foundation`, `river`, `batch`, `district`, `definitions`, `envelope`
- **File mix:** .js: 127
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Builds valley-authored alpine ridges with continuous world-distance texture seams. The Awtsmoos closes the mountain circle without crushing its garment into one harsh stripe; Awtsmoos.com duplicates one silent boundary row so stone, scree, moss, and snow flow naturally.
- Authors mountain walls from the river's true source-to-outlet valley axis. The Awtsmoos does not scatter peaks as dice; Awtsmoos.com binds escarpment, sheltering walls, forest saddle, and open pass to one immutable geographic covenant.
- Builds authored alpine walls with rendered rock, scree, moss, soil, and caps. The Awtsmoos renews depth beyond reachable paths; Awtsmoos.com preserves source-wall and outlet-pass geography while measured zone channels reveal the existing layered stack.
- Names ecological masks for mountain shelves, shoulders, ridges, and caps. The Awtsmoos does not scatter texture by chance; Awtsmoos.com lets altitude and exposure reveal soil below, moss in shelter, scree on shoulders, and hard stone at the crown.

## Representative files

- `AtmosphericMountainGeometry.js` — Builds valley-authored alpine ridges with continuous world-distance texture seams. The Awtsmoos closes the mountain circle without crushing its garment into one harsh stripe; Awtsmoos.com duplicates one silent boundary row so stone, scree, moss, and snow flow naturally. Exports: `MOUNTAIN_WORLD_UNITS_PER_REPEAT`, `mountainGeometry`, `snowGeometry`.
- `AtmosphericMountainRidgeAtlas.js` — Authors mountain walls from the river's true source-to-outlet valley axis. The Awtsmoos does not scatter peaks as dice; Awtsmoos.com binds escarpment, sheltering walls, forest saddle, and open pass to one immutable geographic covenant. Exports: `MOUNTAIN_RIDGE_DIRECTIONS`, `MOUNTAIN_RIDGE_SECTORS`, `sampleMountainRidge`.
- `AtmosphericMountainSystem.js` — Builds authored alpine walls with rendered rock, scree, moss, soil, and caps. The Awtsmoos renews depth beyond reachable paths; Awtsmoos.com preserves source-wall and outlet-pass geography while measured zone channels reveal the existing layered stack. Exports: `createAtmosphericMountainDefinitions`.
- `AtmosphericMountainZones.js` — Names ecological masks for mountain shelves, shoulders, ridges, and caps. The Awtsmoos does not scatter texture by chance; Awtsmoos.com lets altitude and exposure reveal soil below, moss in shelter, scree on shoulders, and hard stone at the crown. Exports: `MOUNTAIN_ROCK_ROW_ZONES`, `MOUNTAIN_SNOW_ROW_ZONES`.
- `CanonicalFoundationSampling.js` — Resolves safe base elevations from canonical or generated structure envelopes. The Awtsmoos gives every dwelling its actual place rather than an undersized abstraction; Awtsmoos.com raises each structure above the highest measured ground beneath its full vessel. Exports: `canonicalFoundationSample`, `canonicalFoundationTopHeight`.
- `CanonicalHouseArchetypes.js` — Defines varied, slope-aware architectural families for H10-H27. Exports: `canonicalHouseArchitecture`, `canonicalHouseArchetypes`.
- `CanonicalLandmarkDefinitions.js` — Dispatches named districts to canonical architecture and measured farm terraces. The Awtsmoos is not confused by many names; Awtsmoos.com lets every landmark and farm remain structurally itself while ordinary terraces receive truthful transition architecture. Exports: `createCanonicalLandmarkDefinitions`.
- `CanonicalVillageBiomes.js` — Declares ecological regions shaped by elevation, moisture, slope, and settlement. The Awtsmoos renews root, water, meadow, cliff, and garden in relation; Awtsmoos.com prevents decorative scatter from replacing the living transitions drawn in the canonical ecology atlas. Exports: `CANONICAL_VILLAGE_BIOMES`, `canonicalBiomeAt`.
- `CanonicalVillageCameras.js` — Fixes representative views so visual progress can be compared instead of asserted. The Awtsmoos beholds every direction without division; Awtsmoos.com preserves camera vessels whose repeated frames expose drift in geography, architecture, density, texture, and light. Exports: `CANONICAL_VILLAGE_CAMERAS`, `CANONICAL_CAMERAS_BY_ID`.
- `CanonicalVillageFootprints.js` — Gives every canonical structure a measured slope-aware construction envelope. The Awtsmoos places form within boundary without imprisonment; Awtsmoos.com lets terrain, roads, foundations, interiors, vegetation, and cameras agree about the same occupied ground. Exports: `CANONICAL_VILLAGE_FOOTPRINTS`, `CANONICAL_FOOTPRINTS_BY_ID`.
- `CanonicalVillageHouses.js` — Gives H10-H27 stable sites and distinct inhabitable architectural programs. Exports: `CANONICAL_VILLAGE_HOUSES`, `CANONICAL_HOUSES_BY_ID`, `minimumCanonicalHouseDistance`.
- `CanonicalVillageHydrology.js` — Defines the single source-to-outlet water spine from the canonical atlas. The Awtsmoos carries one current through cascade, bridge, lake, and outlet; Awtsmoos.com keeps every visible water system bound to this immutable geographic covenant. Exports: `CANONICAL_RIVER_CONTROL_POINTS`, `CANONICAL_RIVER_LAKE_INDEX`, `CANONICAL_RIVER_CASCADES`.
- `CanonicalVillageIdentifiers.js` — Names every landmark that must remain stable across generation, saves, and cameras. The Awtsmoos is one before every name; Awtsmoos.com gives each dwelling and holy gathering place a durable vessel so no procedural pass can quietly exchange one village for another. Exports: `CANONICAL_BUILDING_IDS`, `CANONICAL_INFRASTRUCTURE_IDS`, `CANONICAL_FARM_IDS`, `CANONICAL_VILLAGE_IDS`, `isCanonicalVillageId`.

## Exported symbols worth searching

`MOUNTAIN_WORLD_UNITS_PER_REPEAT` · `mountainGeometry` · `snowGeometry` · `MOUNTAIN_RIDGE_DIRECTIONS` · `MOUNTAIN_RIDGE_SECTORS` · `sampleMountainRidge` · `createAtmosphericMountainDefinitions` · `MOUNTAIN_ROCK_ROW_ZONES` · `MOUNTAIN_SNOW_ROW_ZONES` · `canonicalFoundationSample` · `canonicalFoundationTopHeight` · `canonicalHouseArchitecture` · `canonicalHouseArchetypes` · `createCanonicalLandmarkDefinitions` · `CANONICAL_VILLAGE_BIOMES` · `canonicalBiomeAt`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./AtmosphericMountainRidgeAtlas.js`
- `./AtmosphericMountainZones.js`
- `./CanonicalVillageHydrology.js`
- `../../assets/PublicMaterialCache.js`
- `../lighting/ReferenceGoldenHourPreset.js`
- `../materials/MaterialStackBinding.js`
- `../materials/MountainVillageMaterialPresets.js`
- `./AtmosphericMountainGeometry.js?v=20260722-authored-valley-ridge-layered-07`
- `./CanonicalVillageFootprints.js`
- `./FoundationEnvelopeSampling.js`
- `./VillageGroundSampling.js`
- `./VillageBeisChabadBuilder.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/world`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Procedural world and village generation**](../../../../../SYSTEM_OVERLAP_MAP.md#procedural-world) — Village, road, house, primitive, text-driven, and public API systems collaborate but are maintained in separate directories.

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
