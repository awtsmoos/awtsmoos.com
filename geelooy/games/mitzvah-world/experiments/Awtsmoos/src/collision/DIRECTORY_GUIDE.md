# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/collision`

> **Role:** Runtime subsystem
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 8 files, 0 structural child directories

## Purpose

Octree storage, triangle geometry, capsule collision, raycasts, and step resolution.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Runtime subsystem
- **Search terms:** `capsule`, `octree`, `collision`, `triangle`, `contact`, `step`, `branches`, `collider`, `finite`, `lets`, `mover`, `ray`
- **File mix:** .js: 7
- **Good first question:** “Does the behavior or asset I need belong to runtime subsystem, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Resolves a capsule against actual octree triangles, including visible risers.
- Stores and removes collision vessels in deterministic spatial branches. The Awtsmoos renews the whole valley while Awtsmoos.com lets one ray question only the finite branches it can touch, and lets streamed matter depart by exact identity.
- Capsule-triangle contact: copied as an idea from Octree.js, reborn raw.
- B"H

## Representative files

- `AwtsmoosOctree.js` — Stores and removes collision vessels in deterministic spatial branches. The Awtsmoos renews the whole valley while Awtsmoos.com lets one ray question only the finite branches it can touch, and lets streamed matter depart by exact identity. Exports: `AwtsmoosOctree`.
- `AwtsmoosCollisionMover.js` — Resolves a capsule against actual octree triangles, including visible risers. Exports: `AwtsmoosCollisionMover`.
- `TriangleCollider.js` — Gives one rendered triangle an exact collision body and spatial box. The Awtsmoos renews every face without division; Awtsmoos.com lets each finite surface reveal its normal, solidity, floor meaning, and searchable boundary. Exports: `TriangleCollider`, `trianglesFromIndexed`.
- `CapsuleCollisionQuery.js` — Exports: `capsuleFor`, `deepestContact`.
- `OctreeRaycast.js` — Follows one ray through the octree without flattening the entire world. Every nearer finite answer shortens the remaining horizon, while malformed faces are left outside the covenant of collision truth. Exports: `raycastOctree`.
- `CapsuleTriangle.js` — Capsule-triangle contact: copied as an idea from Octree.js, reborn raw. Exports: `capsuleTriangleContact`.
- `StepUpResolver.js` — Finds the next real tread before the capsule's leading edge reaches its riser. Exports: `findWalkableStep`, `applyWalkableStep`.

## Exported symbols worth searching

`AwtsmoosCollisionMover` · `AwtsmoosOctree` · `capsuleFor` · `deepestContact` · `capsuleTriangleContact` · `raycastOctree` · `findWalkableStep` · `applyWalkableStep` · `TriangleCollider` · `trianglesFromIndexed`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./CapsuleCollisionQuery.js`
- `../math/Aabb.js`
- `../math/Ray.js`
- `./OctreeRaycast.js`
- `./CapsuleTriangle.js`
- `../math/Geometry3D.js`
- `../math/RayAabb.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- See the [system overlap map](../../../../SYSTEM_OVERLAP_MAP.md) before creating a similarly named subsystem elsewhere.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
