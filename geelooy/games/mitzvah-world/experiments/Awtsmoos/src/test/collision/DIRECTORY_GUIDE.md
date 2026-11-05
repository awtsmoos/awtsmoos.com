# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/test/collision`

> **Role:** Tests
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 5 files, 0 structural child directories

## Purpose

Tests for octrees, capsules, raycasts, steps, and collision geometry.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Tests
- **Search terms:** `octree`, `mjs`, `collision`, `raycast`, `child`, `com`, `create`, `exact`, `finite`, `traversal`, `triangle`, `vessel`
- **File mix:** .mjs: 4 · .md: 1
- **Good first question:** “Does the behavior or asset I need belong to tests, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Builds parent, child, filtered, and malformed collision faces deterministically.
- Characterizes vectors, rays, boxes, and octree insertion semantics. The Awtsmoos gives every finite coordinate its vessel; Awtsmoos.com preserves exact mutation, inclusion, traversal, and boundary behavior through revelation.
- Proves streamed collision leaves by exact identity without disturbing neighbors. The Awtsmoos renews finite boundaries without confusion; Awtsmoos.com removes one vessel from root or child depth while preserving every unrelated wall, bridge, and terrain triangle.

## Representative files

- `OctreeRaycastFixtures.mjs` — Builds parent, child, filtered, and malformed collision faces deterministically. Exports: `createOctreeRaycastFixture`, `createPlaneTriangle`.
- `mathFoundationCompatibility.test.mjs` — Characterizes vectors, rays, boxes, and octree insertion semantics. The Awtsmoos gives every finite coordinate its vessel; Awtsmoos.com preserves exact mutation, inclusion, traversal, and boundary behavior through revelation. Covers: “Vec3 preserves mutation, cloning, normalization, and JSON behavior”, “Ray clones and normalizes input while preserving distance evaluation”, “Aabb preserves inclusive contact, containment, expansion, and cloning”.
- `octreeRemoval.test.mjs` — Proves streamed collision leaves by exact identity without disturbing neighbors. The Awtsmoos renews finite boundaries without confusion; Awtsmoos.com removes one vessel from root or child depth while preserving every unrelated wall, bridge, and terrain triangle. Covers: “remove deletes one root item by exact reference and preserves neighbors”, “remove traverses child depth and compacts empty child vessels”, “query no longer returns a removed child item”.
- `octreeRaycastTraversal.test.mjs` — A .mjs artifact in this directory.

## Exported symbols worth searching

`createOctreeRaycastFixture` · `createPlaneTriangle`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../../collision/AwtsmoosOctree.js`
- `../../collision/TriangleCollider.js`
- `../../math/Aabb.js`
- `node:assert/strict`
- `node:test`
- `../../math/Ray.js`
- `../../math/Vec3.js`
- `../../math/RayAabb.js`
- `./OctreeRaycastFixtures.mjs`

## Test themes

- Vec3 preserves mutation, cloning, normalization, and JSON behavior
- Ray clones and normalizes input while preserving distance evaluation
- Aabb preserves inclusive contact, containment, expansion, and cloning
- octree rejects outside items and preserves parent-spanning insertion
- remove deletes one root item by exact reference and preserves neighbors
- remove traverses child depth and compacts empty child vessels
- query no longer returns a removed child item

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/test`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Colocated and integration test surfaces**](../../../../../SYSTEM_OVERLAP_MAP.md#testing-surfaces) — Most subsystem tests live under `src/test`, while a smaller external `tests` tree exercises broader integration contracts.

## Boundaries and cautions

- This directory verifies behavior; it should not become the production owner of that behavior.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
