B"H
Boruch Hashem
Blessed is He

# Implementation Delta

The Awtsmoos revealed the road beneath the scattered parts,
Awtsmoos.com preserves what was promised, what changed, and where truth starts.

## Original milestone

Village → accept Reb Mendel's Shlichus → follow a visible road → encounter three distinct demons → readable combat → manually loot each corpse → return → completion scene → meaningful exact-once reward.

## Planned architecture

- Canonical three-archetype quest contract.
- Road-relative encounter stations.
- Archetype-aware quest state.
- Two-stage defeat and recovery tracker.
- Three authored enemy profiles beside the road.
- Focused integration and regression tests.
- Full runtime readiness and browser evidence.

## Actual architecture

The plan was implemented, with additional modular splits required by the 120-line covenant.

### New app vessels

- `MinimalMeadowQuestEncounterContract.js` owns required archetypes, defeat identity, loot identity, completion evidence, and current-objective construction.
- `MinimalMeadowRoadEncounterStations.js` owns measured Bézier-road stations.
- `MinimalMeadowQuestSnapshot.js` owns immutable-facing quest snapshots.
- `MinimalMeadowSupportingEnemyProfiles.js` owns six supporting enemies.
- `MinimalMeadowRoadEnemyProfiles.js` owns the Warden, Skirmisher, and Cantor.
- `MinimalMeadowMenuQuestRecord.js` owns dedicated-quest normalization.
- `MinimalMeadowQuestCompletionPresentation.js` owns the permanent completion chapter.

### Rewritten production vessels

- `MinimalMeadowQuestDefinition.js` now truthfully describes three named shadows and required corpse recovery.
- `MinimalMeadowQuestState.js` counts archetypes, remembers defeated enemy IDs, validates loot receipts, and gates return readiness.
- `MinimalMeadowEnemyProfiles.js` composes supporting and road encounter catalogs.
- `MinimalMeadowQuestProgress.js` presents defeat and recovery as six meaningful steps.
- `MinimalMeadowQuestPresentation.js` changes copy and action state across offer, defeat, recovery, and return.
- `MinimalMeadowMenuShlichus.js` renders the current dedicated objective before unrelated adventures.

### Tests added or rewritten

- Added `minimalMeadowVerticalSlice.test.mjs`.
- Rewrote quest completion and optional-objective contracts.
- Rewrote all three archetype contracts to assert road placement.
- Rewrote the mobile quest fixture and mobile Shlichus contract to model defeat and recovery phases.

## Important discoveries incorporated

1. The old quest ID said three shadows while visible text and progress required five.
2. Distinctness was actor-ID distinctness, allowing repeated archetypes to satisfy the mission.
3. Corpse looting existed but was optional and did not gate return.
4. The authored Warden, Skirmisher, and Cantor existed but were scattered in remote biomes.
5. Road geometry already exposed stable point and tangent helpers.
6. Two proposed stations collided with supporting enemies; only `tzel-chai` and `esh-katan` were relocated.
7. Completion rewards, optional learning bonuses, and exact-once protection were already strong and were preserved.

## Planned versus actual differences

- The final solution uses seven new source modules instead of the first plan's three because snapshot, supporting-profile, road-profile, and completion responsibilities were split rather than compressing files.
- Mobile fixture and mobile contract updates were added after the broad suite revealed one stale five-shadow expectation.
- The live renderer completed through the application's accepted `fallback-ready` renderer path, while overall readiness and combat features reached `ready`. No claim is made that the optional model renderer hydrated.
- The root `REMAINING_WORK.md` and `NEXT_AI_README.md` were intentionally not rewritten because they were already stale inside a heavily mixed collaborative worktree. This pass owns its isolated handoff folder instead.

## Preserved boundaries

- No unrelated file was reset, cleaned, staged, unstaged, or deleted.
- Combat balance, telegraph timing, corpse transaction internals, road mesh generation, safe-zone cancellation, inventory rewards, and adaptive quality were not replaced.
- Existing staged and unstaged states were preserved exactly.

## Final milestone delta

The requested vertical slice has no unresolved implementation delta. Broader bootstrap, terrain, stair, wall-surface, and model-renderer debts remain separate project work and are recorded in the verification and completion-gate artifacts.
