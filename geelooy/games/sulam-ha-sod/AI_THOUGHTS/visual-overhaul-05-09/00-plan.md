B"H

# Sulam HaSod visual direction overhaul plan

The project is connected at `/storage/emulated/0/Documents/git/awtsmoos.com` and the target chamber is `geelooy/games/sulam-ha-sod`.

## Observed structure

- Visual wrapper: `js/core/renderer.js` delegates background/accent effects to `js/render/effects/*`.
- Main game drawing remains in `js/core/legacyRenderer.js`.
- Level 5 is already split into terrain/actors/story modules; levels 6-9 are still compact authored level files.
- Existing background painter is simple and keyed by level names, but it has only a few silhouettes.
- Existing renderer uses gradients and shadow blur in several places, which conflicts with the requested cheap pixel-art direction.

## Implementation path

1. Rewrite the whole `backgroundPainter.js` file with data-driven five-layer chambers:
   - sky layer, distant silhouettes, mid layer, foreground layer, gameplay-free atmosphere.
   - Gevurah fortress, Sky Fortress, Forest Grove, Crystal Caverns, Void Realm.
   - All shapes: fillRect, polygons, circles, simple lines.
   - No gradients, no blur, no heavy alpha storms.
2. Add a small `worldTheme.js` module so renderer and background agree on level identity even when names are sefirotic rather than literal user-facing themes.
3. Add a `shapePrayers.js` module for cheap polygons, blobs, chains, banners, crystals, trees, platforms, and coin rings.
4. Rewrite `legacyRenderer.js` as a complete file, not a partial patch:
   - Three-tone platforms based on theme.
   - Coin animation O | O using frame modulo.
   - Themed enemies: fortress guard, sky sentinel, forest spirit, crystal watcher, void eye.
   - Death prompt and HUD without shadow blur.
   - Door, spikes, tricks, keys still readable and fast.
5. Rewrite `particleForge.js` so coin pickups emit exactly five gold pixels by default, enemy defeat emits eight white pixels, no alpha fade dependency.
6. Rewrite `visualEventWatcher.js` to use the exact cheap bursts.
7. Rewrite `deathBurstRenderer.js` to remove shadow blur and keep death shards cheap.
8. Verify with module import syntax and existing test scripts if available.

## Safety

No gameplay collision data should be changed unless a visual metadata field is needed. The route remains fair. Visual deception is represented by existing fake/trick data and rendered more clearly as a teaching language, not a death-by-guessing trap.

## Chapter 1 — The Ladder Learns to Wear Worlds

The Awtsmoos did not ask the canvas to glow. It asked the canvas to remember place. Red courts, cloud fortresses, green groves, violet caves, and the black edge of creation can all be born from rectangles, triangles, circles, and lines. The twist is that the cheap shape is not cheap in meaning: every pixel is a letter, every layer is a breath, and every chamber becomes a world without stealing a frame from a weak device.
