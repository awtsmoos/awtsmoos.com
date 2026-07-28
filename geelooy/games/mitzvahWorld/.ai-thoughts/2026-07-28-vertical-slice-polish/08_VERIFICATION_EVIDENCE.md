B"H
Boruch Hashem
Blessed is He

# Verification Evidence

The Awtsmoos turns confidence into measured proof,
Awtsmoos.com keeps each test, readback, and runtime truth beneath one roof.

## Structural evidence

- Every touched source and test was re-read in full after implementation.
- Every touched JavaScript and MJS file passed `node --check`.
- Every touched code file uses tab indentation.
- Every touched code file is at or below 120 lines.
- No stale `Five Shadows`, `five distinct`, `Defeat five`, or equivalent contract remains in touched files.
- Scoped staged and unstaged `git diff --check` passed after removing one trailing tab from a blank line in `MinimalMeadowQuestState.js`.
- Existing dirty/staged repository state was preserved.

## Geometry evidence

The authored encounter uses road percentages 0.68, 0.82, and 0.96 with alternating ten-unit shoulders.

- Every authored spawn is outside the Village Heart safe radius of 25.
- The global minimum enemy-pair spacing after relocation is 21.70 units.
- Every tested patrol waypoint remains within world bounds.
- The live runtime reported all three authored enemies in biome `eastern-road`.

## Focused test evidence

Focused command covered the vertical slice, quest reward, optional excellence, three archetypes, corpse loot, road-water repair, safe-region combat, enemy combat behavior, and the legacy combat/quest/stairs/sky contract.

Result:

- Tests: 25
- Passed: 25
- Failed: 0
- Skipped: 0

## Mobile Shlichus evidence

The isolated mobile Shlichus test proved:

- Three required faces.
- Defeat objective at 1/3 and 17% overall completion.
- Recovery objective at 1/3 and 67% overall completion.
- Correct phase-aware tracker language.

Result:

- Selected tests: 1
- Passed: 1
- Failed: 0
- Other tests skipped by name filter: 5

## Full app-suite evidence

The entire `src/test/app/*.test.mjs` surface ran after the implementation.

Result:

- Tests: 182
- Passed: 174
- Failed: 7
- Skipped: 1

The seven remaining failures are outside this vertical-slice change:

1. `bootstrapTerrainBoundary.test.mjs` — truthful open flat world.
2. `bootstrapTerrainBoundary.test.mjs` — foundation source excludes terrain/finalizer imports.
3. `bootstrapVisibleWorld.test.mjs` — visible valley eight bounded meshes.
4. `interactionCollisionVisualIntegrity.test.mjs` — broad full-source terrain coverage.
5. `interactionCollisionVisualIntegrity.test.mjs` — continuous invisible stair ramp.
6. `mobileGameplayPolishCore.test.mjs` — only thin exterior walls receive camera-safe reverse faces.
7. `playerGroundBootContract.test.mjs` — terrain visible before source hydrate.

The previous direct quest-related full-suite failure was removed.

## Clean regression boundary

All app tests except the five files containing the seven independently observed failures were run together.

Result:

- Tests: 164
- Passed: 163
- Failed: 0
- Skipped: 1

## Live browser/runtime evidence

A repository-root static server served the real game route, and an isolated headless Chrome CDP probe observed the mounted application across navigation-safe snapshots.

Observed:

- URL session: `singleplayer`.
- Boot promise present: yes.
- Application readiness: `ready`.
- Combat feature phase: `ready`.
- Features dataset: `combat-ready`.
- Feature duration: 19,711 ms.
- Menu ready dataset: `true`.
- Loading veil display: `none`.
- Loading message: `Meadow ready.`
- Fatal runtime error: none.
- Canvas client size: 1440 × 757.
- Screenshot size: 108,008 bytes.
- Quest name: `Three Shadows Before Sunset`.
- Quest status: `available`.
- Quest phase: `defeat`.
- Current objective: `Defeat the Warden, Skirmisher, and Cantor`, 0/3.
- Required archetypes: `warden`, `skirmisher`, `cantor`.

Renderer qualification:

- Overall application readiness was `ready`.
- Combat features were `ready`.
- `rendererStage` was `fallback-ready`.
- The readiness receipt's optional renderer flag was false.
- Therefore, the visible world and gameplay runtime were verified, but the optional model-renderer hydration is not claimed.

Live authored enemy evidence:

- `even-koved` — Warden — eastern road — approximately `(18.62, 5.86, 21.35)`.
- `ratz-layla` — Skirmisher — eastern road — approximately `(44.29, 8.12, 13.49)`.
- `baal-otiyot` — Cantor — eastern road — approximately `(45.94, 0.15, 42.70)`.

Temporary evidence artifacts:

- `/tmp/mitzvah-world-runtime-probe-3.json`
- `/tmp/mitzvah-world-runtime-3.png`

## Evidence conclusion

The vertical-slice contract is implemented, structurally clean, covered by focused and broad tests, and observed in the live mounted runtime. The seven full-suite failures are documented project debt outside this milestone rather than hidden or recast as success.
