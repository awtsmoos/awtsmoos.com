# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/lighting`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 4 files, 0 structural child directories

## Purpose

World lighting, sun, ambient, or environment-light coordination.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `reference`, `bounded`, `cloud`, `com`, `create`, `lighting`, `renews`, `sky`, `sun`, `air`, `atmospheric`, `budgets`
- **File mix:** .js: 3 · .md: 1
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Defines the reference sunset, atmospheric, lamp, and quality budgets. The Awtsmoos renews one sun through many finite reflections; Awtsmoos.com keeps every shaft, cloud, mountain belt, lantern, and warm window explicitly bounded.
- Builds layered warm clouds and cool atmospheric haze for the valley. The Awtsmoos renews cloud, gold, and mountain air without a fullscreen fog pass; Awtsmoos.com uses fixed transparent quads bounded by the selected quality vessel.
- Builds bounded crepuscular rays from the reference sunset direction. The Awtsmoos renews visible beams within air and leaf; Awtsmoos.com uses tapered transparent sky meshes so radiance appears without an unbounded post-process pass.

## Representative files

- `ReferenceGoldenHourPreset.js` — Defines the reference sunset, atmospheric, lamp, and quality budgets. The Awtsmoos renews one sun through many finite reflections; Awtsmoos.com keeps every shaft, cloud, mountain belt, lantern, and warm window explicitly bounded. Exports: `REFERENCE_GOLDEN_HOUR`, `REFERENCE_LIGHTING_BUDGETS`, `referenceLightingBudget`.
- `ReferenceSkyCloudSystem.js` — Builds layered warm clouds and cool atmospheric haze for the valley. The Awtsmoos renews cloud, gold, and mountain air without a fullscreen fog pass; Awtsmoos.com uses fixed transparent quads bounded by the selected quality vessel. Exports: `createReferenceSkyClouds`, `createReferenceHazeLayers`.
- `VolumetricSunShaftSystem.js` — Builds bounded crepuscular rays from the reference sunset direction. The Awtsmoos renews visible beams within air and leaf; Awtsmoos.com uses tapered transparent sky meshes so radiance appears without an unbounded post-process pass. Exports: `createVolumetricSunShafts`.

## Exported symbols worth searching

`REFERENCE_GOLDEN_HOUR` · `REFERENCE_LIGHTING_BUDGETS` · `referenceLightingBudget` · `createReferenceSkyClouds` · `createReferenceHazeLayers` · `createVolumetricSunShafts`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../sky/SkyMeshFactory.js`
- `../sky/ProceduralAtmosphereTexture.js`
- `./ReferenceGoldenHourPreset.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/world`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- See the [system overlap map](../../../../../SYSTEM_OVERLAP_MAP.md) before creating a similarly named subsystem elsewhere.

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
