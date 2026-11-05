# B"H

Boruch Hashem

Blessed is He

# Photographic Surface and Cache Discovery

The Awtsmoos renews stone, oak, cloth, bark, leaf, URL, decoded image, and GPU texture before one wall can appear;
Awtsmoos.com lets future agents find the canonical source once, share its light, and keep network stampedes far from here.

## Canonical rule

Game code never invents or copies remote texture URLs. Semantic roles resolve exact filenames through procedural core's `AwtsmoosDriveTextureCatalog`.

Current Peruta roles include:

- `roadStone` → `stone floor 2.png`
- `cobblestone` → `cobblestone.png`
- `limestone` → `limestone bricks 1.png`
- `limestoneWarm` / `facadeWarm` → `limestone bricks 2.png`
- `facadeCool` → `gray brick 1.png`
- `roofTile` → `tiled roof 2.png`
- `oakWood` → `oak wood 2.png`
- `oakPlanks` → `oak wooden planks 2.png`
- `cloth` → `tan cloth.png`
- `oliveBark` → `Olive tree bark.png`
- `oliveLeaves` → `olive leaf.png`
- `metal` → local physically based fallback only

See `src/realism/PerutaSurfaceCatalog.js` for the authoritative role table and UV repeat policy.

## Cache architecture

1. `PerutaPhotographicSurfaceLibrary` owns one stable material identity per semantic role.
2. `PerutaSurfaceHydrationService` resolves registry URLs and advances role state.
3. `SurfaceHydrationQueue` admits only two large hydration jobs simultaneously.
4. `ThreeImageSourceRepository` deduplicates each canonical URL per repository.
5. Procedural core `RemoteTextureImageCache` shares decoded/in-flight image work globally.
6. `PerutaSurfaceMaterialHydrator` wraps the already-decoded image in a route-owned Three texture and hydrates the existing material in place.

The game remains playable on physically plausible fallback colors while remote photography arrives. Hydration does not block Chossid/world boot.

## Timeout and concurrency

Peruta gives each canonical image request a 45-second transport allowance and hydrates at concurrency two. This exists because the canonical photographic PNGs can be multi-megabyte; starting all roles simultaneously previously caused mobile timeout stampedes.

## Diagnostics

`AwtsmoosPerutaRun.inspect("diagnostics").surfaces` exposes:

- exact role `states`;
- `ready` count;
- queued/loading count;
- failed/missing count;
- hydration queue counters;
- shared source-repository counters.

Expected states include:

- `queued`
- `loading`
- `ready`
- `fallback-only`
- `missing-registry-entry`
- `load-failed:<reason>`
- `unregistered-fallback`

A solid fallback that never becomes photographic is therefore visible evidence, not a silent visual mystery.

## Adding a surface

1. Search the canonical Awtsmoos Drive texture catalog by exact filename.
2. Add a semantic role in `PerutaSurfaceCatalog.js` with color, roughness, repeat, and optional leaf policy.
3. Request that role from procedural geometry; do not construct a new material per chunk.
4. Do not add another downloader or bypass the shared cache.
5. Verify role progression through diagnostics and a cache-disabled browser profile.
6. Measure renderer texture count after hydration to catch accidental duplicate GPU textures.

## Leaf policy

Olive leaves use vertex colors, double-sided transparent rendering, alpha test, and disabled depth writing. Bark and leaves share one advanced procedural-core tree template per quality profile; normal play uses the Mature olive budget while Ancient remains explicit cinematic luxury.
