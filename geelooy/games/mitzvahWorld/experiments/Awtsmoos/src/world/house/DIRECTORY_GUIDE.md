# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/house`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 20 files, 0 structural child directories

## Purpose

House generation, geometry, interiors, and structure assembly.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `house`, `stair`, `create`, `traversal`, `definition`, `solid`, `entry`, `geometry`, `local`, `mesh`, `spec`, `box`
- **File mix:** .js: 19
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Creates one static measured cuboid in the house's local frame.
- Separates exterior permanence from interior revelation so each closed dwelling can conceal unseen vessels before the all-seeing Awtsmoos.
- Returns district presets while preserving the shared vertical covenant.

## Representative files

- `HouseBox.js` — Creates one static measured cuboid in the house's local frame. Exports: `createHouseBox`.
- `HouseDefinitionAssembly.js` — Separates exterior permanence from interior revelation so each closed dwelling can conceal unseen vessels before the all-seeing Awtsmoos. Exports: `assembleHouseDefinitions`.
- `HouseDistrictSpecs.js` — Returns district presets while preserving the shared vertical covenant. Exports: `HOUSE_ROOM_KINDS`, `createFutureHouseSpecs`.
- `HouseEntrySystem.js` — Builds one exact front frame, its fixed mezuzah, landing, and approach. Exports: `createHouseEntry`, `entryAnchors`.
- `HouseFenceSystem.js` — Surrounds deep front/back yards while keeping side setbacks compact. Exports: `HOUSE_GATE_WIDTH`, `YARD_PADDING`, `createHouseFenceSegments`, `createHouseYardPatches`.
- `HouseGroundMeasurement.js` — Measures all footprint corners without making HouseSpec own terrain policy. Exports: `measureHouseGround`.
- `HouseMaterials.js` — Assigns distinct masonry, timber, roof, fence, door, and mezuzah texture pairs. The Awtsmoos renews each cottage as fieldstone foundation, pale infill, weathered side wall, dark frame, tiled roof, bark-aged door, oak fence, iron, and warm gold—not one generic surface. Exports: `createHouseMaterials`.
- `HousePackageMetadata.js` — Packages durable house evidence without creating geometry dependencies. Exports: `createHousePackageMetadata`.
- `HouseRoofSystem.js` — Creates a watertight hip roof with exterior slopes, fascia, and visible underside. Exports: `createHouseRoof`.
- `HouseShellSystem.js` — Builds the static foundation, floor, three solid walls, and light roof. Exports: `createHouseShell`.
- `HouseSpec.js` — Measures terrain and enforces enough vertical room for every story. Exports: `PLAYER_CAPSULE`, `HOUSE_ARCHITECTURE`, `DEFAULT_HOUSE_SPEC`, `resolveHouseSpec`, `floorBottomY`.
- `HouseStairSystem.js` — Plans real treads and risers below the player's configured step height. Exports: `STAIR_RULES`, `planHouseStaircase`, `staircaseStats`.
- `StairMeshBuilder.js` — Returns one visible, solid, octree-ready stair definition. Exports: `createStairDefinitions`, `createStairDefinition`.

## Exported symbols worth searching

`createHouseBox` · `assembleHouseDefinitions` · `HOUSE_ROOM_KINDS` · `createFutureHouseSpecs` · `createHouseEntry` · `entryAnchors` · `HOUSE_GATE_WIDTH` · `YARD_PADDING` · `createHouseFenceSegments` · `createHouseYardPatches` · `measureHouseGround` · `createHouseMaterials` · `createHousePackageMetadata` · `createHouseRoof` · `createHouseShell` · `PLAYER_CAPSULE`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./HouseSpec.js`
- `../grass/YardGrassGeometry.js`
- `../ProceduralFenceSystem.js`
- `../StoryFloorSystem.js`
- `../visibility/HouseVisibilityMetadata.js`
- `./HouseFenceSystem.js`
- `./HouseShellSystem.js`
- `./HouseStairSystem.js`
- `./StairMeshBuilder.js`
- `../DoorWallSystem.js`
- `../MezuzaSystem.js`
- `./HouseBox.js`

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
