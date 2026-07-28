B"H
Boruch Hashem
Blessed is He

# Final Handoff

The Awtsmoos renews the village, the road, the struggle, and the return,
Awtsmoos.com keeps the map of every vessel so the next Shliach may learn.

## Milestone delivered

The live Mitzvah World route now supports one coherent vertical slice:

Village → Reb Mendel offers `Three Shadows Before Sunset` → the player follows the visible eastern road → defeats the Warden, Skirmisher, and Cantor → manually opens and empties each required corpse → returns to Reb Mendel → sees a permanent completion chapter → receives the exact-once base reward and any earned optional excellence.

## Runtime behavior

- Only `warden`, `skirmisher`, and `cantor` archetypes advance the defeat phase.
- Duplicate archetypes and unrelated enemies do not advance the Shlichus.
- The quest remembers the actor ID associated with each required defeated archetype.
- Loot progress advances only from a required defeated corpse's `enemy:looted` receipt.
- Return readiness begins only after all three required corpses are empty.
- Parchment, tracker, and Shlichus menu share the same current objective.
- Completion remains exact-once and preserves optional learning and unbroken-return rewards.

## Authored road encounter

The three authored demons stand beside successive measured Bézier-road stations beyond Village Heart:

- Warden — `even-koved` — road 68%, positive shoulder.
- Skirmisher — `ratz-layla` — road 82%, negative shoulder.
- Cantor — `baal-otiyot` — road 96%, positive shoulder.

The resulting catalog preserves more than 20 units of global enemy spacing and keeps tested patrol waypoints inside world bounds.

## Source map

### Quest domain

- `src/app/MinimalMeadowQuestEncounterContract.js` — archetype, defeat, loot, completion, and current-objective authority.
- `src/app/MinimalMeadowQuestDefinition.js` — story, objectives, rewards, optional excellence, and visible copy.
- `src/app/MinimalMeadowQuestState.js` — event subscriptions and state transitions.
- `src/app/MinimalMeadowQuestSnapshot.js` — UI-facing immutable snapshot.
- `src/app/MinimalMeadowQuestCompletion.js` — preserved exact-once reward authority.

### Road encounter

- `src/app/MinimalMeadowRoadEncounterStations.js` — road-relative station geometry.
- `src/app/MinimalMeadowRoadEnemyProfiles.js` — authored Warden, Skirmisher, and Cantor.
- `src/app/MinimalMeadowSupportingEnemyProfiles.js` — six supporting shadows.
- `src/app/MinimalMeadowEnemyProfiles.js` — stable combined catalog.

### Presentation

- `src/ui/MinimalMeadowQuestProgress.js` — six-step defeat and recovery progress.
- `src/ui/MinimalMeadowQuestPresentation.js` — offer, defeat, recovery, and return parchment/tracker.
- `src/ui/MinimalMeadowQuestCompletionPresentation.js` — permanent completion chapter.
- `src/ui/MinimalMeadowMenuQuestRecord.js` — dedicated mission normalization.
- `src/ui/MinimalMeadowMenuShlichus.js` — shared Shlichus book rendering and prioritization.

### Contracts

- `src/test/app/minimalMeadowVerticalSlice.test.mjs`
- `src/test/app/minimalMeadowQuestCompletion.test.mjs`
- `src/test/app/minimalMeadowQuestOptionalObjectives.test.mjs`
- `src/test/app/enemyWardenArchetype.test.mjs`
- `src/test/app/enemySkirmisherArchetype.test.mjs`
- `src/test/app/enemyCantorArchetype.test.mjs`
- `src/test/app/mobileGameplayPolishCore.test.mjs`
- `src/test/app/mobileGameplayPolishFixture.mjs`

## Verification summary

- Focused vertical-slice and supporting contracts: 25 passed, 0 failed.
- Targeted mobile Shlichus contract: 1 passed, 0 failed.
- Clean broad app boundary: 163 passed, 0 failed, 1 skipped.
- Entire app surface: 174 passed, 7 independent failures, 1 skipped.
- Live mounted application: readiness `ready`, combat features `ready`, menu ready, visible 1440 × 757 canvas, no fatal runtime error.
- Live quest: `Three Shadows Before Sunset`, phase `defeat`, objective 0/3, required archetypes correct.
- Live authored trio: all present in biome `eastern-road`.
- Scoped staged and unstaged `git diff --check`: passed.
- Every touched source and test: syntax checked, tab-indented, no more than 120 lines, and re-read in full.

See `08_VERIFICATION_EVIDENCE.md` for exact commands, counts, failure names, runtime fields, coordinates, and evidence paths.

## Renderer qualification

The live application reached overall readiness `ready` and combat feature phase `ready`, but `rendererStage` was `fallback-ready` and the optional renderer receipt remained false. The playable visible runtime is verified. Optional model-renderer hydration is not claimed.

## Separate known project debt

The seven remaining full-suite failures are outside this milestone and belong to bootstrap, terrain, visible-world, stair-ramp, wall-surface, and player-ground boot contracts. The exact list is preserved in `08_VERIFICATION_EVIDENCE.md`.

The original broad improvement list—regions, narrative variety, NPC routines, exploration secrets, progression, audio, deeper equipment, diagnostics, and extended automated play—remains a future roadmap beyond this intentionally polished vertical slice.

## Worktree safety

This repository was already heavily mixed between staged, unstaged, and untracked work. That state was preserved exactly:

- No reset.
- No clean.
- No checkout restoration.
- No staging or unstaging normalization.
- No unrelated file deletion.

The older root `REMAINING_WORK.md` and `NEXT_AI_README.md` remain stale and were intentionally not rewritten because they are shared artifacts inside the mixed worktree. This isolated thought folder is the authoritative handoff for this pass.

## How to run the game locally

From the repository root, serve files over HTTP and open:

`/geelooy/games/mitzvahWorld/index.html?session=singleplayer`

The verified live probe used a local HTTP server and waited for `data-awtsmoos-readiness` to reach `ready` or `degraded-ready`.

## Next independent project node

The strongest separate next node is repairing the bootstrap and terrain foundation contracts while preserving this completed road Shlichus. That work should begin with fresh inspection of the seven named failures and must not be folded silently into this closed milestone.
