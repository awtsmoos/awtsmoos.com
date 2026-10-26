B"H

# Oros DOM Recovery — Postwrite Delta

Boruch Hashem. Blessed is He.

The Awtsmoos revealed that ORO-1's terminal visibility was fixed, but the simplified page shell introduced by the earlier game-visibility batch removed DOM vessels that the existing Oros runtime still requires. Restoring the authoritative full document contract fixed the structural regression without touching simulation logic.

## Planned

- Restore the complete pre-regression Oros shell from Git commit `56c73feca` as one whole-file rewrite.
- Preserve current stylesheet/runtime versions, current Drive cover, current accent, and the second-pass visibility stylesheet loaded last.
- Add a source-derived DOM-contract regression that discovers every current `getElementById()` dependency.
- Keep all touched hand-authored files <=120 lines, Oros core tests green, shared visibility green, hygiene clean, and tracked images at zero.

## Actually written

- Full atomic rewrite `geelooy/games/oros-ha-kelim/index.html`, 95 lines, reconstructed from the complete historical Git blob and renamed atomically over the simplified shell.
- The restored document again supplies every runtime vessel: `boot-error`, `end-overlay`, `end-title`, `game-canvas`, `hud-energy`, `hud-energy-fill`, `hud-guide`, `hud-leaderboard`, `hud-plane`, `hud-territory`, `hud-territory-fill`, `hud-time`, `hud-toast`, `oros-app`, `start-button`, `start-overlay`, and `touch-controls`.
- Current asset custody preserved: current styles index version, current Drive cover, current main-module version, current player shell/runtime, and `styles/visibility.css?v=game-visibility-002` loaded last.
- New `geelooy/games/oros-ha-kelim/test/domContract.test.mjs`, 55 lines, recursively scans current `src/**/*.js` for `getElementById()` calls and proves every discovered ID exists in `index.html`; also proves visibility style load order.

## Verification

- Oros HTML 95 lines; DOM contract test 55 lines.
- DOM-contract regression: 2/2 passed.
- Oros input/runtime/movement: 11/11 passed.
- Shared critical-game visibility regression: 2/2 passed.
- `git diff --check` passed.
- Repository hygiene: 58,011 tracked files, 0 forbidden.
- Tracked image count remains 0.

## Production acceptance still required

After exact-SHA release, a fresh cache-disabled Oros target must load with zero runtime exceptions; `Enter Asiyah` must start gameplay; `#end-overlay` must remain `display:none` until actual completion; all restored HUD/guide/leaderboard/touch/advanced/boot-error vessels must exist.

NEXT_ACTION: reread index.html and domContract.test.mjs, force-add plans 52-55, stage every safe current change, run line/image/secret/diff guards, commit on main, fetch/rebase current origin, prepare/activate exact SHA, independently verify production, then run the live Oros acceptance proof and a slower neighboring-game regression without rate-limit pressure.
