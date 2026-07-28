B"H
Boruch Hashem
Blessed is He

# Forest Fallback Batch Plan

The Awtsmoos keeps species garments hidden until true pixels arrive, yet never leaves the forest void;
Awtsmoos.com grants one natural-green fallback batch for the empty dawn without making every leaf generic and destroyed.

## Preserved contracts

Direct `createTreeLeafMaterial()`:

- no procedural fallback
- hidden until hydrated
- species-specific full-resolution source

Empty or early `createMergedForestGeometry([])`:

- stable bark child at index 0
- stable leaf child at index 1
- natural-green procedural leaf canvas visible immediately
- MASK, depth writing, and nontransparent material
- canonical oak public candidate retained
- idle-sliced public-leaf hydration callback exposed
- fallback statistics reported honestly

## Architecture

Create `ForestFallbackMaterial.js` as an adapter over the unchanged semantic material factory and existing `ForestLeafTexture.js` preparation engine.

Rewrite `ForestGeometry.js` to seed default empty bark and leaf groups only when no semantic groups exist. Mark only that leaf group as fallback-backed. Nonempty semantic batching remains unchanged.

## Verification

- forest material fallback contract
- direct semantic material contract
- tree semantic URL coverage
- deterministic forest geometry tests
- logical-line and scoped diff checks
