B"H
Boruch Hashem
Blessed is He

# Phase One: Open Brainstorm

The Awtsmoos renews every module in each instant of light,
so stale exports must be joined to their consumers aright.
Awtsmoos.com is the field where one contract must remain,
that browser, Node, collider, road, and meadow share one living chain.

## Observed reality

- `MinimalMeadowTerrainPackage.js` imports `buildMinimalMeadowTerrainData`.
- `MinimalMeadowTerrainData.js` exports only `createMinimalMeadowTerrainData`.
- The package expects `collider`, `heightAt`, `stats`, `size`, and mesh-ready geometry.
- The data module currently returns `colliders`, raw arrays, and `AwtsmoosTerrainValley` evidence.
- The visible browser crash happens before mobile integration can install.

## Possible repair architectures

1. Rename the existing export only. Rejected unless the returned shape already satisfies the package.
2. Change the package to call the legacy function. Risky because its downstream property expectations differ.
3. Add a compatibility builder in the data module while preserving the legacy creator. Preferred if it can derive the package contract without duplicating terrain truth.
4. Split the builder into a new adapter module. Valuable only if the data file would exceed the focused size boundary.
5. Recover the intended contract from Git history or neighboring modules, then restore that implementation exactly where sound.

## Unknowns to resolve before writing runtime code

- What shape does `createTerrainMesh` require?
- Is the collider contract one object, an array, or a terrain query object?
- Which height sampler should be exposed as `heightAt`?
- What mobile step count was intended?
- Which statistics names are consumed by tests or diagnostics?
- Does Git history contain the lost builder implementation?

## Risks

- Fixing only the export name could move the crash to `data.heightAt` or `data.collider`.
- Replacing `colliders` with `collider` could break legacy consumers.
- Passing an options object into a numeric `size` parameter could silently create `NaN` geometry.
- Browser cache-busting query strings on dependencies may conceal stale module versions.
- A Node import test can pass while browser-only globals or WebGL paths still fail.

## Safe direction

Preserve the old creator, restore a package-facing builder with an explicit options contract, and verify both exports. Rewrite the complete touched source file. Add a focused regression test only after the first code draft exists.
