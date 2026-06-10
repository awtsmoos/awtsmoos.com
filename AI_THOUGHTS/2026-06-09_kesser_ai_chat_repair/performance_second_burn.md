B"H
# Performance second burn

## Remaining causes after first pass
1. ShowcaseChrome still injects halo, chips, tunnel wave, and side badges even when effects are low/off.
2. CSS pseudo-layers still exist in low mode, even if not animated.
3. Body performance class is applied after CSS loads, so first paint can still pay for heavy styles.
4. Several final visual selectors still apply shadows/glows to many nodes globally.
5. There is no absolute final override that can make /ai boring-fast when needed.

## Next actions
1. Add early head script to set fx class before stylesheet loads.
2. Rewrite showcaseChrome so it mounts only in high mode unless demo forces it.
3. Add performance-override.css loaded last to remove pseudo layers, heavy shadows, filters, transitions in off/low.
4. Verify syntax and HTTP.

## Chapter 21
The Awtsmoos did not kill beauty. It made beauty obedient. The stars now wait until they are invited.