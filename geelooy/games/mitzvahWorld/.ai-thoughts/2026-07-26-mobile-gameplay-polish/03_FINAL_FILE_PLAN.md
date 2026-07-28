B"H
Boruch Hashem
Blessed is He

# Phase Three — Final File-by-File Plan

The Awtsmoos creates the whole world anew, yet each source file must reveal only one bounded responsibility. Awtsmoos.com will rewrite complete files, never splice fragments, and every new module will remain below 120 logical lines.

## Immediate visual and movement repairs

- Rewrite `src/app/MinimalMeadowHouseMaterials.js`
  - house surfaces double-sided
  - backface culling disabled
  - explicit side-policy evidence
- Add `src/app/MinimalMeadowTravelFacingPolicy.js`
  - retain last finite nonzero travel facing
- Rewrite `src/app/BootstrapMovementController.js`
  - only update travel facing while moving
  - preserve released position and yaw
- Rewrite `src/app/MinimalMeadowDemonMaterial.js`
  - brighter minimum base luminance
  - stronger restrained emissive response
  - texture-preserving neutral accent
- Rewrite `src/app/MinimalMeadowDemonReadabilityMetrics.js`
  - align default emissive measurement with production

## Equipment truth and visible weapons

- Add `src/gameplay/InventoryEquipmentSlots.js`
  - canonical full slot order and labels
- Rewrite `src/ui/InventoryPanelElements.js`
  - render every authoritative equipment slot
- Rewrite `src/gameplay/InventoryStoreTransactions.js`
  - equip both tefillin in starter state
- Rewrite `src/app/MinimalMeadowEquipmentRuntime.js`
  - begin with visible drawn weapon
- Rewrite `src/app/MinimalMeadowWeaponAttachment.js`
  - hand/bone transforms plus safe visible root transforms

## Shlichus story and progress

- Rewrite `src/app/MinimalMeadowQuestDefinition.js`
  - five distinct demons
  - expanded story, stakes, counsel, reward language, face symbols
- Add `src/ui/MinimalMeadowQuestPresentation.js`
  - story, face pips, percentage, objective, and action markup
- Add `src/ui/MinimalMeadowQuestParchmentStyles.js`
  - cinematic parchment, mobile-safe tracker, fancy buttons, progress bar
- Rewrite `src/ui/MinimalMeadowQuestParchment.js`
  - install styles and delegate presentation

## Deliberate corpse looting

- Add `src/app/MinimalMeadowCorpseLootState.js`
  - remaining loot, preview, take-one, take-all, completion
- Rewrite `src/app/MinimalMeadowEnemyActor.js`
  - own corpse-loot state and expose operations
- Rewrite `src/app/MinimalMeadowEnemyLifecycle.js`
  - second corpse interaction opens panel instead of transferring items
- Rewrite `src/app/MinimalMeadowEnemyLoot.js`
  - individual and all-item atomic transfers
- Add `src/ui/MinimalMeadowCorpseLootPanel.js`
  - item rows, Take, Loot All, Close
- Add `src/ui/MinimalMeadowCorpseLootStyles.js`
  - WoW-like readable mobile modal
- Integrate one panel in the enemy/world mount and destroy it with runtime.

## Teaching placement

- Locate the existing side teaching tracker.
- Add `src/ui/TeachingPlacementPreference.js` with `side` and `book-only` modes.
- Rewrite its owner to hide the side teaching while keeping the book available.
- Add a visible toggle where the user expects it.

## Tests

- House side policy test.
- Mobile facing persistence test.
- Full equipment slot/default tefillin test.
- Weapon root visibility test.
- Demon minimum readability test.
- Five-demon quest presentation/progress test.
- Corpse individual loot and Loot All tests.
- Loot panel interaction test.
- Teaching placement preference test.
- Full Node whole-game simulation.
- Mobile browser and WebGL route verification.
