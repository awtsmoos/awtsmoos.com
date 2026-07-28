B"H
Boruch Hashem
Blessed is He

# Village Market Compatibility Plan

The Awtsmoos gathers one market square through modern district options and historic direct calls;
Awtsmoos.com will normalize center, earth, and garments before any landmark rises from its walls.

## Observed failure

`VillageMarketBuilder.js` now expects one internal options object. The preserved public contract invokes `createMarketDefinitions(center, groundSampler, materials)`. The center object is mistaken for options, leaving `base` and `materials` undefined. `VillageLandmarkPrimitive.js` then dereferences `materials.anisotropy`.

## Caller graph

- Modern: `CanonicalLandmarkDefinitions.js` passes one options object.
- Historic/public: `villageMarketOwnership.test.mjs` passes center, sampler, and a partial URL map.

## Architecture

Create `VillageLandmarkMaterials.js` to normalize:

- stone, roof, and wood primary URLs
- missing mix URLs from their primary counterparts
- finite anisotropy
- stable native-density texture policy

Rewrite `VillageMarketBuilder.js` to normalize either signature, sample base height, and honor caller center coordinates.

Rewrite `VillageLandmarkPrimitive.js` to consume the normalized material contract and remain safe when called directly with a partial map.

## Verification

- canonical market ownership test
- canonical landmark dispatch tests
- destination/village geometry import suites previously blocked by the TypeError
- logical-line and scoped diff checks
