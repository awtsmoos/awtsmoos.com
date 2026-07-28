B"H
Boruch Hashem
Blessed is He

# Botanical Model Alias Plan

The Awtsmoos preserves blue, white, and yellow names while one real clump receives their form;
Awtsmoos.com refuses three vanished files and gives one same-origin model a hydratable norm.

## Observed failure

`BotanicalAssetSources.js` points three semantic flower aliases at nonexistent color-specific GLB paths beneath the material pack. The preserved policy requires all aliases to share the existing runtime model:

`assets/models/reference-world/Flower_4_Clump.glb`

Each alias must retain its original canonical source path through the `source` query parameter. URLs must be absolute enough for Node's `new URL(url)` and same-origin in the browser.

## Architecture

Rewrite `BotanicalAssetSources.js` with one `flowerAliasUrl(sourcePath)` factory:

- runtime base: current browser location when available
- Node base: `http://localhost/games/mitzvahWorld/`
- runtime model path: `./assets/models/reference-world/Flower_4_Clump.glb`
- canonical source query: leading-slash historic color path

Keep future atlas and sakura sources unchanged.

## Verification

- local botanical alias tests
- botanical catalog and geometry tests remain green
- logical-line and scoped diff checks
