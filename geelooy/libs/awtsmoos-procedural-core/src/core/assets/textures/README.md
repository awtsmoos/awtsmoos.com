# B"H

Boruch Hashem

Blessed is He

# Awtsmoos Drive Texture Discovery

The Awtsmoos renews every finite pixel before stone, bark, cloth, metal, or water can appear; Awtsmoos.com keeps remote surface truth behind one reusable procedural-core doorway so games never copy texture law from one another.

## Canonical remote source

Root:

`https://awtsmoos.com/sites/firebase_drive_migration/`

Canonical catalog counts:

- Ground: **35**
- Architecture: **33**
- Craft/material: **24**
- Tree/nature: **33**
- Total: **125**

Ground, architecture, and craft files resolve beneath `full-resolution/`. Tree files resolve beneath `awtsmoos-nature/ilanos/trees/`.

Exact spelling, spaces, case, and historical typos are remote storage keys. Never silently rename values such as `scortced floor.png`, `birtch leaf.png`, or `Olive tree bark.png`.

## Renderer-neutral discovery API

Import:

`/libs/awtsmoos-procedural-core/src/exports/textures.js`

Important exports:

- `AWTSMOOS_DRIVE_TEXTURE_ROOT`
- `AWTSMOOS_DRIVE_TEXTURE_FAMILIES`
- `awtsmoosDriveTextureUrl(family, filename)`
- `searchAwtsmoosDriveTextures(query)`
- `awtsmoosDriveTextureCatalogEvidence()`
- trusted path and URL helpers

Example:

`const stone = awtsmoosDriveTextureUrl("architecture", "limestone bricks 1.png");`

Use `searchAwtsmoosDriveTextures("oak")` or `searchAwtsmoosDriveTextures("stone")` to discover texture names without importing a renderer or another game.

## Native browser texture API

Import:

`/libs/awtsmoos-procedural-core/src/adapters/native/textures.js`

Public native texture classes:

- `NativeRemoteTextureLoader`
- `NativeTextureResponseSource`
- `NativeTextureResponseCache`
- `NativeLayeredMaterialHydrator`
- `NATIVE_TEXTURE_RESPONSE_CACHE_NAME`

The native renderer already supports `mapImage`, `mixImage`, repeat controls, blend strength, patch scale, patch sharpness, and texture policy. Do not build a second shader just to blend two images.

## Caching is always enabled when the browser supports it

Every texture load follows this order:

1. **Decoded in-page memory cache** — keyed by canonical URL plus decoded max dimension.
2. **Persistent Cache Storage** — keyed by canonical raw URL, shared across route reloads/pages for the same origin.
3. **Browser HTTP cache** — network fetches explicitly use `cache: "force-cache"`.
4. **Remote network** — used only when the earlier layers do not satisfy the request.

A successful network response is written through to persistent Cache Storage before it is returned for decode. A later mobile or desktop loader can reuse the same raw cached response and decode it at its own size policy.

Current persistent namespace:

`awtsmoos-procedural-textures-v1`

Change that version only when cached raw texture semantics must intentionally be invalidated. Do not invent per-game cache names unless the raw asset contract is truly different.

## Cache failure policy

Caching is an optimization layer, never a gameplay dependency.

- Cache Storage unavailable: continue through browser HTTP cache/network.
- Cache match failure: record diagnostics and continue to network.
- Cache write failure: texture still decodes and displays.
- Network failure: rejected decoded-memory promise is removed so the next request may retry.
- A good persistent entry is never deleted merely because a later network attempt fails.
- Fallback material color stays visible throughout every cache/network state.

## Cache diagnostics

`NativeRemoteTextureLoader.evidence()` exposes:

- decoded memory entries,
- decoded memory hits,
- decoded max dimension,
- raw response source evidence,
- persistent cache namespace/availability/hits/misses/writes/failures,
- network fetch count,
- active/queued texture work and queue priorities.

Use this evidence before assuming a URL, shader, or remote host is broken.

## Transport policy

The authoritative PNGs can be several megabytes each. Persistent caching reduces repeat downloads, but first-load pressure still needs bounded transport.

The reusable native path therefore also provides:

- bounded concurrency,
- priority ordering,
- one-microtask first-wave batching so high-priority surfaces can win before work starts,
- realistic bounded request timeout,
- retry after failure,
- `createImageBitmap()` decode when available,
- optional aspect-preserving decoded-bitmap dimension cap,
- shared decoded promises.

Do **not** preload all 125 textures.

## Progressive layered hydration

`NativeLayeredMaterialHydrator` is fallback-first:

1. Apply material URL/repeat/blend fields immediately.
2. Keep readable fallback color visible.
3. Load the primary map.
4. Assign `mapImage` immediately when ready.
5. Queue the mix image only after the primary succeeds.
6. Assign `mixImage` when ready.
7. Preserve map-only realism if the mix layer fails.
8. Record non-throwing state on `material.awtsmoosTextureStatus`.

## Route policy example

Temple Runner currently uses one shared surface library with:

- concurrency `2`,
- `45000ms` timeout,
- mobile decoded max dimension `1024`,
- desktop decoded max dimension `1536`,
- semantic priority so road/Jerusalem stone precede secondary props.

Those are route policy values. Persistent raw-response caching remains generic core behavior.

## UV requirement

Remote maps need meaningful UVs. The focused primitive path generates finite UVs for lightweight procedural primitives and native geometry binds a `uv` attribute.

When adding a new procedural generator, verify its UV data before expecting textures to render correctly.

## Complete filename catalogs

- [Ground + Architecture](./CATALOG_GROUND_ARCHITECTURE.md)
- [Craft + Trees](./CATALOG_CRAFT_TREES.md)

## Agent search vocabulary

Jerusalem, limestone, fieldstone, stone, cobblestone, oak, wood, plank, bark, copper, iron, ceramic, dirt, grass, sand, snow, mud, leaf, olive, palm, pine, cedar, willow, leather, cloth, rope, parchment, water, river, glass.

## AI-agent checklist

1. Discover names here or with `searchAwtsmoosDriveTextures()`.
2. Preserve exact canonical filenames.
3. Resolve URLs with `awtsmoosDriveTextureUrl()`.
4. Never disable texture caching in production code.
5. Reuse the native loader instead of direct `fetch()` calls from games.
6. Keep an immediate fallback color.
7. Load only surfaces actually needed by the route.
8. Prioritize important surfaces before secondary detail.
9. Keep blending subtle enough to preserve gameplay readability.
10. Verify UVs on every new geometry path.
11. Never import another game's runtime merely to discover or hydrate textures.
12. Never use Three.js for this path; use Awtsmoos procedural core and its native adapter.
