B"H
Boruch Hashem
Blessed is He

# Gameplay Texture Streaming Gate Plan

The Awtsmoos reveals play before enrichment and gives each frame its appointed breath;
Awtsmoos.com restores the historic gate without binding modern district streaming to legacy death.

## Preserved contract

The existing test imports `startGameplayTextureStreaming` from `createEretzRuntime.js` and requires:

1. Return `true` only when `assets.publicMaterialStreaming.start` is callable.
2. Schedule exactly one first frame callback immediately.
3. The first callback schedules a second frame callback without starting enrichment.
4. The second callback invokes `start()` once.
5. Legacy scheduled receipts without a callable `start()` return `false` and schedule nothing.

## Architecture

Create a focused `GameplayTextureStreamingGate.js` containing the complete two-frame handoff. Re-export it from `createEretzRuntime.js` at the historic import surface. Do not inject it into current district streaming without evidence that the modern runtime still owns a startable material stream.

## Files

- New: `experiments/Awtsmoos/src/app/GameplayTextureStreamingGate.js`
- Rewrite complete: `experiments/Awtsmoos/src/app/createEretzRuntime.js`

## Verification

- Run `gameplayTextureStreamingGate.test.mjs`.
- Run runtime startup and texture-streaming policy tests.
- Confirm both touched files stay below 120 logical lines.
- Confirm scoped diff check is clean.
