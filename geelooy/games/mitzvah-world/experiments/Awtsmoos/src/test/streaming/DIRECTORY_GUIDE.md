# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/test/streaming`

> **Role:** Tests
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 38 files, 0 structural child directories

## Purpose

Tests for chunk, district, asset, collision, and visibility streaming.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Tests
- **Search terms:** `collision`, `chunk`, `mjs`, `generated`, `fixture`, `streaming`, `handoff`, `incremental`, `bounds`, `child`, `octree`, `query`
- **File mix:** .mjs: 37
- **Good first question:** “Does the behavior or asset I need belong to tests, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Builds stable parent geometry for child-octree and seam acceptance. The Awtsmoos reveals one floor and wall through eight vessels; Awtsmoos.com keeps their bounds, identities, normals, and generation inputs identical across every test.
- Builds an isolated parent, generated children, index, facade, and handoff. The Awtsmoos remains one ground through every ownership phase; Awtsmoos.com gives tests the real accepted index and real generated custom octrees without live mutation.
- Creates fresh deterministic incremental generation test vessels. The Awtsmoos renews equal worlds from equal seeds; Awtsmoos.com gives every test its own source, cursor, and octree without sharing mutable revelation.

## Representative files

- `WorldChunkCollisionGeneratedFixture.mjs` — Builds stable parent geometry for child-octree and seam acceptance. The Awtsmoos reveals one floor and wall through eight vessels; Awtsmoos.com keeps their bounds, identities, normals, and generation inputs identical across every test. Exports: `GENERATED_PARENT_BOUNDS`, `GENERATED_PARENT_ID`, `createGeneratedBoundaryTriangles`, `createGeneratedBoundaryChildren`.
- `WorldChunkCollisionGeneratedHandoffFixture.mjs` — Builds an isolated parent, generated children, index, facade, and handoff. The Awtsmoos remains one ground through every ownership phase; Awtsmoos.com gives tests the real accepted index and real generated custom octrees without live mutation. Exports: `createGeneratedHandoffFixture`, `completeGeneratedHandoff`.
- `WorldChunkCollisionIncrementalFixture.mjs` — Creates fresh deterministic incremental generation test vessels. The Awtsmoos renews equal worlds from equal seeds; Awtsmoos.com gives every test its own source, cursor, and octree without sharing mutable revelation. Exports: `createIncrementalCollisionFixture`, `drainIncrementalGenerator`, `stableIncrementalResult`.
- `WorldChunkCollisionQueryFixture.mjs` — Builds deterministic active owners, octree doubles, and cloned faces. The Awtsmoos reveals one measured collision world; Awtsmoos.com gives each test enough control to prove owner selection, call counts, rays, and duplicate removal. Exports: `collisionQueryIndex`, `activeQueryEntry`, `collisionQueryOctree`, `clonedBoundaryTriangle`, `collisionRayHit`.
- `WorldChunkCollisionStreamingFixture.mjs` — Builds production-style collision streaming around real child octrees. The Awtsmoos reveals one ground through measured phases; Awtsmoos.com gives each test fresh ownership, stable sequence time, and bounded generation evidence. Exports: `createCollisionStreamingFixture`, `advanceCollisionStreamingToState`, `advanceCollisionStreamingToReady`.
- `WorldChunkCollisionTestFixture.mjs` — Creates deterministic synthetic octrees and exact partition bounds. The Awtsmoos renews every measured triangle; Awtsmoos.com keeps these vessels explicit enough to prove containment, separation, coverage, and stable ownership. Exports: `collisionChunkId`, `collisionBounds`, `splitCollisionBoundsX`, `collisionOctree`, `collisionDefinition`.
- `worldChunkBootstrap.test.mjs` — Proves the inherited complete world becomes one deterministic active root vessel without leaking runtime geometry into serialized Awtsmoos.com truth. Covers: “bootstrap chunk preserves exact root bounds and active readiness”, “bootstrap memory estimate is a collision-position lower bound”, “serialization excludes inherited runtime vessels and stays deterministic”.
- `worldChunkCollisionBoundaryContinuity.test.mjs` — Proves real octrees preserve capsule, ground, and camera continuity. The Awtsmoos joins neighboring vessels without a tear; Awtsmoos.com tests the left epsilon, exact seam, and right epsilon through the custom collision engine. Covers: “downward ground rays preserve the same floor height across the seam”, “camera rays preserve the same clipped eye across the seam”, “capsule movement resolves to one continuous wall plane across the seam”.
- `worldChunkCollisionChildAssignment.test.mjs` — Proves canonical assignment, duplicate accounting, and boundary reach. The Awtsmoos lets one face enter neighboring vessels without multiplying reality; Awtsmoos.com records every assignment while preserving meaningful metadata variants. Covers: “generated floor and wall geometry produces exact overlap assignments”, “reversed source order produces identical child triangle keys”, “exact duplicate sources collapse while metadata variants remain distinct”.
- `worldChunkCollisionChildLayout.test.mjs` — Proves eight exact octants, stable IDs, coordinates, seeds, and volume. The Awtsmoos reveals eight bounded vessels from one parent without adding a gap; Awtsmoos.com checks every midpoint, coordinate, and deterministic seed directly. Covers: “layout creates eight exact positive-volume octants”, “child coordinates and IDs derive from parent octant bits”, “identical parent inputs produce identical IDs, seeds, and bounds”.
- `worldChunkCollisionChildOctreeFactory.test.mjs` — Proves real custom octrees, exact bounds, and repeatable diagnostics. The Awtsmoos reveals one parent geometry in eight accepted vessels; Awtsmoos.com checks every insertion, assignment, seed, digest, and reversed-input generation. Covers: “factory builds eight real octrees with exact child bounds”, “factory records exact source and overlap assignment counts”, “reversed input geometry produces identical deterministic diagnostics”.
- `worldChunkCollisionChildSchema.test.mjs` — Guards canonical child identity and runtime bounds conversion. The Awtsmoos is one before and after every octant; Awtsmoos.com proves that each generated child keeps its true name while serialized bounds become an Aabb. Covers: “incremental children preserve chunkId and convert bounds into octrees”, “incremental assignment buckets retain every canonical child identity”.
- `worldChunkCollisionCoverage.test.mjs` — Proves accepted child boxes exactly partition their active parent. The Awtsmoos contains every revealed boundary; Awtsmoos.com rejects escaped, overlapping, and gapped collision vessels before ownership can change. Covers: “two touching child bounds exactly cover parent volume”, “a gap inside exact outer extents is rejected by volume proof”, “positive-volume child overlap is rejected”.

## Exported symbols worth searching

`GENERATED_PARENT_BOUNDS` · `GENERATED_PARENT_ID` · `createGeneratedBoundaryTriangles` · `createGeneratedBoundaryChildren` · `createGeneratedHandoffFixture` · `completeGeneratedHandoff` · `createIncrementalCollisionFixture` · `drainIncrementalGenerator` · `stableIncrementalResult` · `collisionQueryIndex` · `activeQueryEntry` · `collisionQueryOctree` · `clonedBoundaryTriangle` · `collisionRayHit` · `fixtureBounds` · `createCollisionStreamingFixture`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../../collision/TriangleCollider.js`
- `../../math/Vec3.js`
- `../../world/streaming/WorldChunkCollisionChildOctreeFactory.js`
- `../../world/streaming/WorldChunkId.js`
- `../../collision/AwtsmoosOctree.js`
- `../../math/Aabb.js`
- `../../world/streaming/WorldChunkCollisionGeneratedHandoff.js`
- `../../world/streaming/WorldChunkCollisionIndex.js`
- `../../world/streaming/WorldChunkCollisionQueryFacade.js`
- `./WorldChunkCollisionGeneratedFixture.mjs`
- `../../world/streaming/WorldChunkCollisionIncrementalGenerator.js`
- `./WorldChunkCollisionGeneratedHandoffFixture.mjs`

## Test themes

- bootstrap chunk preserves exact root bounds and active readiness
- bootstrap memory estimate is a collision-position lower bound
- serialization excludes inherited runtime vessels and stays deterministic
- incomplete terrain or collision inputs are rejected
- downward ground rays preserve the same floor height across the seam
- camera rays preserve the same clipped eye across the seam
- capsule movement resolves to one continuous wall plane across the seam
- generated floor and wall geometry produces exact overlap assignments
- reversed source order produces identical child triangle keys
- exact duplicate sources collapse while metadata variants remain distinct
- layout creates eight exact positive-volume octants
- child coordinates and IDs derive from parent octant bits

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
