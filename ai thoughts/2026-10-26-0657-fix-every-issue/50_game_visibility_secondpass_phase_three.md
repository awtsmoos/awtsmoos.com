B"H

# Game Visibility Second Pass — Phase Three: Exact Repair and Closure

Boruch Hashem. Blessed is He.

The Awtsmoos gives the final second-pass law: each leaking terminal surface receives a game-local, last-loaded visibility owner that is stronger than decorative display rules and independent of simulation state.

## Exact files

Create four tiny stylesheets:
- `migdol/styles/visibility.css`
- `neshama-quest/visibility.css`
- `shema-strike/css/visibility.css`
- `oros-ha-kelim/styles/visibility.css`

Each file must contain only B"H headers/JSDoc-style CSS commentary plus the terminal selectors proven by live browser evidence. All must be far below 120 lines.

Rewrite each affected game's stylesheet aggregator or HTML entry as a complete file so its visibility stylesheet loads after the display-owning styles. Prefer an existing small CSS aggregator (`styles/index.css`, `css/*.css` aggregator) over rewriting a large HTML page. If an index HTML exceeds 120 lines and no small aggregator exists, split the style ownership into a new <=120-line CSS aggregator and rewrite the smallest existing import vessel rather than touching the oversized document.

Rewrite `geelooy/games/tests/sharedGameVisibility.test.cjs` completely so it asserts:
1. every dedicated visibility file exists;
2. each contains its exact `display:none !important` terminal selector;
3. each affected game loads that file after its primary decorative stylesheet;
4. the runtime still emits hidden state, proving presentation rather than simulation owns the fix.

## Acceptance before release

- New/rewritten hand files <=120 lines.
- Shared visibility regression passes.
- Existing City, Oros, Shema, and relevant Migdol/Neshama tests pass where present.
- `git diff --check`, secret scan, repository hygiene, and tracked-image count 0.
- Full-file reread + post-write delta.
- Commit all safe current work plus plans 48-50 on `main`, fetch/rebase current origin, release prepare, exact-SHA activate, independent Linux SHA/service verification.

## Live browser acceptance

Fresh cache-disabled targets must prove:
- MIG-1 `#game-over-screen.hidden` computes `display:none` until actual loss.
- NES-1 `#resultOverlay[hidden]` computes `display:none` at startup and after Try Again.
- SHS-1 `#ss-overlay[hidden]` computes `display:none` after Resume.
- ORO-1 `#end-overlay.hidden` computes `display:none` before real round completion.
- KAV-1, ADV-1, BRK-1, COL-1, MIT-2, and OHB-1 remain free of startup terminal overlays/runtime exceptions.

NEXT_ACTION: inspect the four current stylesheet entry/aggregator files and line counts, then perform only the full-file rewrites described above.
