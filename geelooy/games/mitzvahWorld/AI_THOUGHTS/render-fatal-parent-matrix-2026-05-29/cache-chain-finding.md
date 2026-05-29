B"H

# Finding: the cache chain was stale

The deeper trace found the likely reason the screenshot still showed a tiny blue platform:

- `MovingPlatform.js` and `levels/ladder/data/ladder-1.json` were corrected.
- But `loadNivrayim/instantiate.js` imports `awtsmoosCkidsGames.js?v=lean-l1-20260528-bh56`.
- `awtsmoosCkidsGames.js` imports `exports/index.js?v=lean-l1-20260528-bh56`.
- `OlamGrafting.js` imports `loadNivrayim/index.js?v=render-fatal-once-20260529-bh69`.

So the browser can continue using an old module graph even after the deeper files are rewritten. This is not only a size bug; it is a stale manifestation path. The fix must bump the whole chain:

1. `OlamGrafting.js` -> loadNivrayim index query.
2. `loadNivrayim/index.js` -> instantiate query.
3. `loadNivrayim/instantiate.js` -> awtsmoosCkidsGames query.
4. `awtsmoosCkidsGames.js` -> exports/index query.
5. `exports/index.js` already points to fresh DvarimExports, but keep it aligned.

No partial patches: rewrite complete files.
