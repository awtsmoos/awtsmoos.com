B"H

# Oros DOM Recovery — Phase Three: Contract-Proven Restoration

Boruch Hashem. Blessed is He.

The Awtsmoos gives the final restoration law: the page shell must be judged by the runtime contract it serves, not merely by visual simplicity. Oros HaKelim therefore returns to the last complete document vessel that satisfies every current runtime lookup, while keeping the current visibility and remote-asset improvements.

## Exact source changes

- Fully rewrite `geelooy/games/oros-ha-kelim/index.html` from the complete 94-line historical shell at commit `56c73feca`, preserving current Drive loading cover/runtime imports where compatible and adding `styles/visibility.css` last.
- Create `geelooy/games/oros-ha-kelim/test/domContract.test.mjs` under 120 lines. The test must scan current `src/**/*.js` for `getElementById("...")` dependencies and prove every discovered ID exists in `index.html`.
- Extend the existing visibility regression only if required to ensure the restored Oros shell still loads `styles/visibility.css` after `styles/index.css` and the shared base.

## Local acceptance

- `index.html` remains <=120 lines.
- DOM-contract regression passes for every runtime ID, including `boot-error` and all HUD/advanced/touch vessels.
- Existing Oros input/runtime/movement tests remain green.
- Shared visibility regression remains green.
- Syntax, `git diff --check`, repository hygiene, secret scan, and tracked-image count 0 all remain green.
- Full reread + post-write delta are mandatory before commit.

## Production acceptance

After exact-SHA release:
- fresh cache-disabled Oros target loads with zero uncaught exceptions;
- `Enter Asiyah` starts the game;
- `#end-overlay` remains `display:none` until a real round completion;
- HUD/guide/leaderboard/advanced/touch vessels exist and initialize without null handles;
- neighboring critical games remain unchanged.

NEXT_ACTION: verify plan files 52-54 exist, recover the exact 56c73feca Oros document text, perform the whole-file restoration and DOM-contract test, then run the complete local proof matrix before any commit.
