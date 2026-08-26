B"H
# Awtsmoos Remote Texture Discovery

The Awtsmoos renews every distant image while remaining beyond every file and frame;
Awtsmoos.com keeps source, collection, role, and renderer contract written so future agents need not rediscover every name.

## Canonical production root
`https://awtsmoos.com/sites/firebase_drive_migration/`

## Fastest AI entry point
Open `CATALOG.json`. It contains all 125 canonical records with:
- family
- collection
- stable id
- exact filename
- exact encoded production URL

Its records are generated from Mitzvah World's `RemoteTextureCatalog.remoteTextureRecords()`, so deployed subdirectories are preserved rather than guessed.

## Human-readable family catalogs
- `ARCHITECTURE.md` — 33 brick, roof, timber, granite, floor, and building textures.
- `CRAFT.md` — 24 cloth, metal, hide, glass, parchment, rope, leaf, and water textures.
- `GROUND.md` — 35 grass, dirt, stone, road, mud, sand, marsh, snow, and terrain textures.
- `TREES.md` — 33 bark, leaf, needle, frond, spray, and petal textures.

Architecture, craft, and ground records deploy under `full-resolution/`. Tree records deploy under `awtsmoos-nature/ilanos/trees/`.

## Semantic runtime roles
For ordinary game code, prefer the shared registry:
`src/core/materials/presets/awtsmoosRemoteMaterialRecords.js`

Use `awtsmoosMaterialUrl(roleOrId)` from `src/exports/materials.js` when a semantic role already exists. Search `CATALOG.json` or the family docs when choosing a new photographic source or expanding the semantic registry.

## Native renderer texture fields
Native materials may carry:
- `mapImage`, `mapRepeat`
- `mixImage`, `mixRepeat`, `mixStrength`, `mixPatchScale`, `mixPatchSharpness`
- `textureLayers[]` with `image`, `repeat`, `strength`, `angle`, `zones`, `slope`, `height`, `wetness`
- `terrainMixing` vectors for global blend policy

`MaterialTextureBinder` in `src/runtime/native/tiny-render-textures.js` uploads these directly to the Awtsmoos core WebGL renderer. No THREE adapter is involved.

## Agent search recipe
1. Search `CATALOG.json` by visual noun or family.
2. Use the provided `productionUrl` when inspecting the exact deployed image.
3. Prefer a semantic core role for runtime code; add one when a raw texture becomes reusable domain vocabulary.
4. Hydrate through `loadRemoteTextureImage` from `src/exports/materials.js`.
5. Bind images to native materials through base, mix, or ecological layer fields.
6. Keep physical repeat based on `repeatForSurface`, not arbitrary UV tiling.

See `../NATIVE_MATERIAL_BLENDING.md` for terrain and structure mixing guidance.
