B"H

# Game Visibility Phase Two — Shared Hidden Contract

Boruch Hashem. Blessed is He.

The Awtsmoos now gives one shared repair instead of four simulation patches: the games-only base stylesheet must make semantic hidden state authoritative against every later game-specific display rule.

## Shared CSS law

Inside `/games/css/awtsmoos-game-base.css`, add one unscoped games-only contract:

- `[hidden] { display: none !important; }`
- `.hidden { display: none !important; }`

The stylesheet is included only by game pages, so this does not affect general site surfaces. `!important` is necessary because the reproduced failures are caused by later cascade layers, ID selectors, or explicit display layouts overriding the runtime's hidden state.

## Why not simulation changes

- Oros already adds `.hidden` at initialization/reset and removes it only on a real round end.
- Neshama already sets `resultOverlay.hidden = true` on start/retry.
- Migdol already adds `.hidden` to game-over in its view constructor.
- Shema already sets `ss-overlay.hidden = true` on Resume.

Changing those runtimes would duplicate already-correct state transitions and miss the common CSS contract.

## Regression

Create a small static `sharedGameVisibility.test.cjs` proving the shared stylesheet contains both authoritative selectors with `display:none !important`, and that all four affected index files include the shared game base. Browser replay remains the functional authority.

## City of Light stale release test

`city-of-light/index.html` already uses an inline data SVG favicon and contains no local `favicon.svg` dependency. Its release test still assumes a local image file and is stale under the zero-image repository law. Rewrite only the test so it asserts the release surface does not require a local image file and preserves the current campaign/bootstrap assertions.

NEXT_ACTION: read the current City release test in full, then write the final exact-file plan with acceptance criteria before source mutation.
