B"H
Boruch Hashem
Blessed is He

# CobyK Original Lineage

The Awtsmoos renews source and successor before history can separate one spark from the next; Awtsmoos.com lets this document keep the preserved CobyK identity explicit while a modern vessel replaces obsolete technical context.

## Preserved source

The immutable evidence source is `/Users/awtsmoos/work/downloads/google-drive-1_YRPH2wl5Vw663hxOXxx4OIkGV-K9sIv`. It is titled **CobyK** and contains the original Processing.js/legacy-THREE implementation, editor, six-map `mapData.js`, and texture directory. Recovery work never edits that directory.

`mapData.js` SHA-256: `f96d518ec8988120133d8ed25748127749f334d0f64555d78eb01d6a89f5d2f5`.

The six canonical map hashes are recorded in `tests/support/OriginalLineageExpectations.mjs` and verified from the copied immutable row modules during tests. Level 4 intentionally reaches 54 columns; it must not be normalized to 53.

## Original gameplay identity

CobyK has six authored ASCII levels. `p` is the player spawn, `*` a solid brick, `s` a lethal spike, `c` a coin, `f` the coin-gated finisher, `u` an elevator, `d` a disappearing support, `l` a horizontally moving spike, and `^`, `>`, `<` directional force tiles. Digits `1` through `9` are the original tutorial anchors.

Every coin in a level must be collected before the finisher completes it. Restart/attempt rhythm, moving hazards, elevators, disappearing supports, directional forces, tutorial intent, and the editor concept belong to the game identity.

## Original texture identity

Fifteen real texture files were copied byte-for-byte into `assets/textures/`: `brick.png`, `coin.png`, `coin2.png`, `downArrow.png`, `elevator.png`, `finisher.png`, `fire.jpg`, `gold.jpg`, `hat.jpg`, `lava.jpg`, `leftArrow.png`, `player.png`, `rightArrow.png`, `shrinker.png`, and `upArrow.png`.

Every copied file was compared to the preserved source with SHA-256 and matched. `coin.png` and `coin2.png` are byte-identical. The historical runtime also used `gold.jpg` as its coin surface, so all three coin-related assets are retained as evidence rather than collapsed.

## What is modernized

The original implementation is not copied wholesale into production. Its global Processing sketch, bundled legacy THREE, COBY wrapper, absolute-position menus, global CSS, frame-dependent physics, direct camera lock, and obsolete external account hosts are implementation debt rather than CobyK identity.

The modern working tree is `geelooy/games/cobyk/`. It preserves canonical maps, tile semantics, mechanics, and local texture identity while replacing the engine with deterministic modular gameplay, a smoother bounded camera, direct Awtsmoos Procedural Core rendering, local-first persistence, scoped mobile-first UI, and optional richer materials/nature that never change collision truth.

The old remote hosts `coby.16mb.com` and `maamer.000webhostapp.com` must never be revived. Legacy `games.vex` data may only be read by an explicit migration adapter.

## Separate descendant

`geelooy/games/ohrbound/` is a rebuilt descendant whose own README describes it as an independent architecture descended from an older prototype. It is intentionally left untouched during this recovery. Compatible infrastructure ideas may be studied, but CobyK does not inherit Ohrbound's 48-level campaign or substitute its gameplay identity.
