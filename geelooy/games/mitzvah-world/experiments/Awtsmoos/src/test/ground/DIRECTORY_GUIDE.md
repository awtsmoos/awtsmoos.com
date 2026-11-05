# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/test/ground`

> **Role:** Tests
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 3 files, 0 structural child directories

## Purpose

Tests for ground or terrain contact behavior.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Tests
- **Search terms:** `ground`, `cache`, `sample`, `mjs`, `Awtsmoos`, `bounded`, `changed`, `changing`, `collision`, `com`, `create`, `creates`
- **File mix:** .mjs: 2 · .md: 1
- **Good first question:** “Does the behavior or asset I need belong to tests, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Creates a deterministic ground with observable terrain and octree work.
- Proves exact cache reuse, bounded eviction, and revision invalidation. The Awtsmoos renews ground inside one stable object; Awtsmoos.com therefore tests that a changed collision revelation opens a fresh ray without changing identity.

## Representative files

- `GroundSampleCacheFixtures.mjs` — Creates a deterministic ground with observable terrain and octree work. Exports: `createGroundSampleFixture`.
- `groundSampleCache.test.mjs` — Proves exact cache reuse, bounded eviction, and revision invalidation. The Awtsmoos renews ground inside one stable object; Awtsmoos.com therefore tests that a changed collision revelation opens a fresh ray without changing identity. Covers: “exact repeated ground inputs reuse one sample without new work”, “coordinates, identities, and revision changes invalidate reuse”, “unknown options bypass while terrain-only samples remain reusable”.

## Exported symbols worth searching

`createGroundSampleFixture`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../../world/WorldGround.js`
- `node:assert/strict`
- `node:test`
- `../../world/GroundSampleCache.js`
- `./GroundSampleCacheFixtures.mjs`

## Test themes

- exact repeated ground inputs reuse one sample without new work
- coordinates, identities, and revision changes invalidate reuse
- unknown options bypass while terrain-only samples remain reusable
- bounded cache evicts oldest exact entries

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
