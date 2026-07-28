B"H
Boruch Hashem
Blessed is He

# Phase Two — Realistic File Plan

The Awtsmoos gives each vessel one duty, neither tangled nor alone,
Awtsmoos.com names each complete-file rewrite before a byte is shown.

## New source files

- `src/app/MinimalMeadowQuestEncounterContract.js`
  - Canonical required archetypes.
  - Defeat identity normalization.
  - Current objective calculation.
  - Completion gate evidence.

- `src/app/MinimalMeadowRoadEncounterStations.js`
  - Road-relative stations at 68%, 82%, and 96%.
  - Alternating ten-unit shoulders.
  - Named station lookup by archetype.

- `src/ui/MinimalMeadowMenuQuestRecord.js`
  - Dedicated quest-to-menu normalization.
  - Keeps `MinimalMeadowMenuShlichus.js` below the file-size covenant.

## Existing source files to rewrite completely

- `MinimalMeadowQuestDefinition.js`: three-shadow story and required manual recovery.
- `MinimalMeadowQuestState.js`: archetype defeat map, looted archetypes, two-phase gate.
- `MinimalMeadowEnemyProfiles.js`: move authored trio to measured road stations; relocate only `tzel-chai` and `esh-katan` to preserve spacing.
- `MinimalMeadowQuestProgress.js`: stage-aware faces, proof states, and objective language.
- `MinimalMeadowQuestPresentation.js`: dynamic defeat, loot, return, and three-place completion copy.
- `MinimalMeadowMenuShlichus.js`: consume current objective through the new normalizer.

## Existing tests to rewrite completely

- `minimalMeadowQuestCompletion.test.mjs`: archetype uniqueness, loot gate, exact-once reward, menu and completion chapter.
- `minimalMeadowQuestOptionalObjectives.test.mjs`: optional excellence remains optional while required manual loot is fulfilled separately.
- `enemyWardenArchetype.test.mjs`: authored behavior plus first road station.
- `enemySkirmisherArchetype.test.mjs`: authored behavior plus second road station.
- `enemyCantorArchetype.test.mjs`: authored behavior plus third road station.

## New test

- `minimalMeadowVerticalSlice.test.mjs`: one integrated event-level journey from accept through three distinct defeats, three deliberate corpse-empty receipts, return readiness, completion, reward, and history testimony.

## Files deliberately not touched

- Combat balance, telegraph, damage, invulnerability, selection, corpse transaction, road geometry, safe-region, adaptive quality, and runtime modules because focused tests already prove them.
- Unrelated dirty files and generated evidence.
