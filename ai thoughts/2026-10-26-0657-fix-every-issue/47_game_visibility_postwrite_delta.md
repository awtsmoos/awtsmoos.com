B"H

# Game Visibility Postwrite Delta

Boruch Hashem. Blessed is He.

The Awtsmoos revealed four critical game failures as one shared presentation contract defect, not four simulation defects. Each affected runtime already emitted correct hidden state; later authored display rules defeated that state.

## Reproduced before repair

- NES-1: Game Over remained visible at startup and after Try Again while the run itself advanced.
- ORO-1: ROUND COMPLETE remained visible before play and after Enter Asiyah while the canvas/game tick advanced.
- MIG-1: The Gate Fell appeared immediately after Defend the Gate despite health 20, currency 500, wave 0.
- SHS-1: Resume executed but the Paused overlay remained visible.

Healthy current-production baselines before repair: KAV-1, ADV-1, BRK-1, COL-1, MIT-2, OHB-1 loaded without startup terminal overlays or runtime exceptions; Mitzvah World and Ohrbound entered playable/interactive state after their normal launch action.

## Actual root repair

- Full rewrite `geelooy/games/css/awtsmoos-game-base.css`, 56 lines.
- Added the games-only invariant `[hidden], .hidden { display: none !important; }` before decorative game rules. The stylesheet is shared by all four affected titles and is served with `Cache-Control: no-cache, must-revalidate`, so no per-game cache-buster churn is needed.
- No game simulation/runtime code was changed because each runtime already transitioned hidden state correctly.

## Cross-game regression

- New `geelooy/games/tests/sharedGameVisibility.test.cjs`, 59 lines.
- Proves the shared stylesheet owns authoritative hidden semantics.
- Proves Oros HaKelim, Neshama Quest, Migdol, and Shema Strike all load the shared base and already emit hidden state from runtime code.
- Regression passed 2/2.

## City of Light image custody

The remaining inline SVG favicon was decoded directly from the HTML string in memory, uploaded without creating a local image file, and publicly re-read/hash-verified in Drive.

- SHA-256: `037e2b421a738a5c4179a225f900e2d3ce681178b54cb791a50ccc10d19366e5`
- Bytes: 308
- MIME: `image/svg+xml`
- Public URL: `https://awtsmoos.com/api/social/drive/public/awtsfixmvplwhac/repo-image-archive/sha256/037e2b421a738a5c4179a225f900e2d3ce681178b54cb791a50ccc10d19366e5/asset`
- Public hash/byte verification: exact match.

`geelooy/games/city-of-light/index.html` was atomically rewritten as one complete file from its fully read source, replacing the inline icon with that Drive URL and removing blank lines. Result: 116 lines, no `data:image`, same game markup/behavior.

`geelooy/games/city-of-light/tests/releaseSurface.test.mjs` was fully rewritten to require a public Drive SVG favicon, forbid inline/local image custody, and preserve the 44px pause-target assertion.

## Verification

- All four changed hand-authored files are <=120 lines.
- Shared visibility test: 2/2 passed.
- City campaign/checkpoint/level/release tests: 5/5 passed.
- Oros input/runtime/movement: 11/11 passed.
- Shema runtime/component/integration contracts: 8/8 passed.
- City HTML contains no `data:image` and contains the verified Drive icon URL.
- Repository hygiene: 57,991 tracked files, 0 forbidden.
- `git diff --check` passed.
- Tracked image count remains 0.

NEXT_ACTION: reread every changed file, audit current concurrent dirt and remote movement, force-add planning files 44-47, stage every safe source/generated change, run image/secret/line/diff guards, commit on main, fetch/rebase current origin, release prepare, exact-SHA activate, independently verify production, then fresh-browser replay all ten critical game codes and terminalize their FIXLOG statuses.
