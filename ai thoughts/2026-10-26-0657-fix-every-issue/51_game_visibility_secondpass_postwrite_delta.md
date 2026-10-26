B"H

# Game Visibility Second Pass — Postwrite Delta

Boruch Hashem. Blessed is He.

The Awtsmoos revealed that the first shared hidden contract reached production correctly but could still be defeated by each game's own authored display ownership. The second pass therefore moved semantic visibility into four tiny, last-loaded game-local vessels without touching simulation logic.

## Planned

- Keep runtime state unchanged because live evidence proved each runtime already emits hidden state.
- Add one tiny dedicated visibility stylesheet per affected game.
- Load each stylesheet after every decorative/shared stylesheet through a full-file index rewrite.
- Rewrite the shared regression so it verifies exact terminal selectors, load order, and preserved runtime hidden signals.
- Keep every hand-authored touched file <=120 lines and retain zero tracked images.

## Actually written

- New `migdol/styles/visibility.css`, 9 lines: hides `#game-over-screen.hidden` and `[hidden]` with `!important`.
- New `neshama-quest/visibility.css`, 8 lines: hides `.resultOverlay[hidden]` with `!important`.
- New `shema-strike/css/visibility.css`, 9 lines: hides `#ss-overlay[hidden]` and `.ss__overlay[hidden]` with `!important`.
- New `oros-ha-kelim/styles/visibility.css`, 9 lines: hides `.oros-app .overlay.hidden` and `[hidden]` with `!important`, outside the Oros cascade-layer ordering.
- Full rewrite `migdol/index.html`, 87 lines, adding the visibility stylesheet last.
- Full rewrite `neshama-quest/index.html`, 61 lines, adding the visibility stylesheet last.
- Full rewrite `shema-strike/index.html`, 82 lines, adding the visibility stylesheet last.
- Full rewrite `oros-ha-kelim/index.html`, 70 lines, adding the visibility stylesheet last.
- Full rewrite `games/tests/sharedGameVisibility.test.cjs`, 72 lines, asserting exact local selectors, last-load order, and runtime hidden-state ownership.

## Verification

- All nine hand-authored files are <=120 lines.
- Shared game visibility regression: 2/2 passed.
- Oros input/runtime/movement suite: 11/11 passed.
- Shema runtime/component/integration suite: 8/8 passed.
- `git diff --check` passed.
- Repository hygiene: 58,001 tracked files, 0 forbidden.
- Tracked-image count remains 0.

## Live acceptance still required after release

Fresh cache-disabled Chrome targets must prove the four exact terminal elements compute `display:none` while hidden and that the six neighboring critical games remain free of startup terminal overlays/runtime exceptions.

NEXT_ACTION: reread all nine touched source/test files, audit current concurrent dirt and remote movement, force-add plans 48-51, stage every safe current change, run image/secret/line/diff guards, commit on main, fetch/rebase origin, prepare/activate exact SHA, independently verify production, then run the four computed-style checks plus the full ten-game browser matrix.
