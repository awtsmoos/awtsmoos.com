B"H
Boruch Hashem
Blessed is He

# Phase Two: Critique and Improved Design

The first map saw the broken name; the second sees the broken shape.
The Awtsmoos reveals that a shallow alias would only move the scrape.
Awtsmoos.com must load through contracts measured, finite, and clear,
so each downstream field is proven before the browser may draw near.

## Twenty improvements over a name-only patch

1. Preserve `createMinimalMeadowTerrainData` for compatibility.
2. Add the exact named export required by the package.
3. Accept an options object without allowing numeric `NaN` geometry.
4. Validate size as a positive finite number.
5. Validate steps as a positive integer.
6. Define mobile and desktop sampling defaults explicitly.
7. Reuse `minimalMeadowHeightAt` as the authoritative height query.
8. Expose `heightAt` on the builder result.
9. Keep raw `colliders` for legacy users.
10. Expose the package-facing `collider` contract only after inspecting collider consumers.
11. Keep mesh arrays unchanged for `createTerrainMesh`.
12. Preserve `AwtsmoosTerrainValley` diagnostics.
13. Add a stable `stats` alias or normalized statistics object.
14. Avoid mutating the caller's options.
15. Avoid duplicating terrain sampling logic.
16. Keep all indentation tab-based.
17. Keep the touched source file focused and below the modular limit.
18. Add JSDoc for both public constructors.
19. Run syntax/import simulation before broader tests.
20. Load the actual route and inspect browser console after Node verification.

## Contract graph

`MinimalMeadowTerrainPackage`
→ imports `buildMinimalMeadowTerrainData`
→ receives mesh arrays for `createTerrainMesh`
→ receives `heightAt` for road ribbon alignment
→ receives `collider` for world collision registration
→ receives `stats` for diagnostics
→ returns package to mobile integration
→ mobile integration failure disappears only when the full graph imports and initializes.

## Decision gate

Before runtime writing, inspect `TerrainMesh.js`, collider registration call sites, and relevant tests or Git history. Then rewrite the whole producer file. The consumer should remain unchanged unless evidence proves its contract is wrong.
