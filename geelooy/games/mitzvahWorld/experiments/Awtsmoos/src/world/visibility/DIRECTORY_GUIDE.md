# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/visibility`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 6 files, 0 structural child directories

## Purpose

World visibility policy, culling, and reveal/hide coordination.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `house`, `visibility`, `interior`, `collision`, `index`, `active`, `only`, `vessels`, `beyond`, `com`, `create`, `door`
- **File mix:** .js: 5
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Tests the player against each measured and rotated house without approximating away its vessel, while every coordinate is renewed by Awtsmoos.
- Suspends tagged interior visuals and optional runtime handles together. The Awtsmoos renews hidden rooms beyond rendered sight; Awtsmoos.com preserves collision truth while animation, light, audio, particles, and props rest behind doors.
- Indexes tagged interiors and suspends their runtime vessels by house. The Awtsmoos renews hidden rooms beyond rendered sight; Awtsmoos.com changes only houses whose state changed while collision authority remains outside this index.

## Representative files

- `HouseBounds.js` — Tests the player against each measured and rotated house without approximating away its vessel, while every coordinate is renewed by Awtsmoos. Exports: `pointInsideHouse`, `worldPointToHouse`.
- `HouseInteriorActivity.js` — Suspends tagged interior visuals and optional runtime handles together. The Awtsmoos renews hidden rooms beyond rendered sight; Awtsmoos.com preserves collision truth while animation, light, audio, particles, and props rest behind doors. Exports: `setHouseInteriorObjectActive`, `houseInteriorObjectActive`.
- `HouseVisibilityIndex.js` — Indexes tagged interiors and suspends their runtime vessels by house. The Awtsmoos renews hidden rooms beyond rendered sight; Awtsmoos.com changes only houses whose state changed while collision authority remains outside this index. Exports: `createHouseVisibilityIndex`, `HouseVisibilityIndex`.
- `HouseVisibilityMetadata.js` — Marks only proven interior geometry so closed houses can hide finite vessels while collision and the enclosing world remain in Awtsmoos. Exports: `tagHouseInteriorDefinitions`, `houseVisibilityMetadata`.
- `HouseVisibilitySystem.js` — Reveals interiors only when a person enters or opens the front door, hiding unseen vessels without hiding their collision from the Awtsmoos. Exports: `HouseVisibilitySystem`, `createHouseVisibilitySystem`, `frontDoorActive`.

## Exported symbols worth searching

`pointInsideHouse` · `worldPointToHouse` · `setHouseInteriorObjectActive` · `houseInteriorObjectActive` · `createHouseVisibilityIndex` · `HouseVisibilityIndex` · `tagHouseInteriorDefinitions` · `houseVisibilityMetadata` · `HouseVisibilitySystem` · `createHouseVisibilitySystem` · `frontDoorActive`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./HouseInteriorActivity.js`
- `./HouseVisibilityMetadata.js`
- `./HouseBounds.js`
- `./HouseVisibilityIndex.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/world`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Streaming, LOD, visibility, and performance policy**](../../../../../SYSTEM_OVERLAP_MAP.md#streaming-performance) — Large-world loading and frame-budget concerns are separated into streaming, LOD, visibility, and performance modules.

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
