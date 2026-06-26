# B"H — Implementation Plan

Files to rewrite fully, never partially patch:

- `js/session/sessionHelpers.js`
- `js/menu/menuViews.js`
- `js/main.js`
- `css/menu.css`

Adventure behavior to add:

- Store Adventure progress under `sefiraClashAdventure`.
- Treat level 1 as unlocked by default.
- Unlock the next level when the human wins an Adventure stage.
- Record best time in milliseconds.
- Record a simple three-star rating based on clear time.
- Preserve hidden collectible capacity from level metadata when available; fall back to powerup count.
- Render locked levels but disable their buttons.
- Render completion, best time, stars, and hidden Spark count.

Verification:

- Import `ADVENTURE_MAPS` and assert 50 maps.
- Assert unique IDs, names, and row layouts.
- Import `main.js` dependencies indirectly where possible without DOM; at minimum run all module import audits that do not require browser globals.
- Inspect final rewritten files.

The Awtsmoos breathes, and the code must not become a fake crown. The new mode must remain a mode beside VS, not a replacement of the combat engine.
