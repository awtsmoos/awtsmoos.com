B"H

# Final Implementation Plan

## New source modules

### Regions and safety

- `src/app/MinimalMeadowRegionCatalog.js`
- `src/app/MinimalMeadowRegionRuntime.js`
- `src/ui/MinimalMeadowRegionBannerStyles.js`
- `src/ui/MinimalMeadowRegionBanner.js`

### Performance

- `src/app/MinimalMeadowAdaptiveQuality.js`
- `src/app/MinimalMeadowEnemyUpdateBudget.js`

### Combat presentation

- `src/ui/MinimalMeadowThreatIndicatorStyles.js`
- `src/ui/MinimalMeadowThreatIndicator.js`

### Diagnostics

- `src/ui/MinimalMeadowRuntimeDiagnosticsStyles.js`
- `src/ui/MinimalMeadowRuntimeDiagnosticsPanel.js`

### Quest and inventory support

- `src/app/MinimalMeadowQuestOptionalObjectives.js`
- `src/gameplay/InventoryRarity.js`

## Existing files to rewrite

- `src/app/MinimalMeadowWorldSystems.js`
  - Install region and adaptive-quality runtimes before combat systems.

- `src/app/MinimalMeadowWorldSystemLifecycle.js`
  - Update and destroy the new coordinating systems.

- `src/app/MinimalMeadowEnemyCombat.js`
  - Disengage immediately inside safe regions.
  - Keep existing attack-slot and telegraph logic unchanged outside safety.

- `src/app/MinimalMeadowEnemyPopulation.js`
  - Apply accumulated-delta update budgeting to distant idle actors.

- `src/app/MinimalMeadowUi.js`
  - Mount region banner, threat indicator, and toggleable diagnostics panel.

- `src/app/MinimalMeadowQuestDefinition.js`
  - Add optional no-defeat, teaching, and deliberate-loot objectives.

- `src/app/MinimalMeadowQuestState.js`
  - Track optional outcomes and store them in the completion receipt.

- `src/gameplay/InventoryItemDefinition.js`
  - Add immutable rarity.

- `src/ui/MinimalMeadowCorpseLootPresentation.js`
  - Display canonical rarity and value.

## Test modules

- `src/test/app/minimalMeadowRegionRuntime.test.mjs`
- `src/test/app/minimalMeadowAdaptiveQuality.test.mjs`
- `src/test/app/minimalMeadowEnemyUpdateBudget.test.mjs`
- `src/test/app/minimalMeadowQuestOptionalObjectives.test.mjs`
- `src/test/ui/minimalMeadowThreatIndicator.test.mjs`
- `src/test/ui/minimalMeadowRuntimeDiagnostics.test.mjs`
- `src/test/ui/minimalMeadowLootRarity.test.mjs`

## Acceptance gates

- All new focused tests green.
- Existing combat-balance, quest, loot, targeting, mobile UI, and runtime tests remain green.
- Every touched source/test module at or below 120 lines.
- Syntax and Git diff checks clean.
- No commit or push.
