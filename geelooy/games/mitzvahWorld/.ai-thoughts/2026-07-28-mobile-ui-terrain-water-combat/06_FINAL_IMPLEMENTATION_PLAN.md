B"H

# Final Implementation Plan

## UI files

- Rewrite `MobileHudCompositionPortraitTopStyles.js` so player and target cards are independently clamped to the portrait viewport.
- Rewrite `MobileHudCompositionPortraitBottomStyles.js` so combat host and cast meter share one safe horizontal rectangle and never inherit transforms from older CSS.
- Rewrite `MinimalMeadowUiRepairStyles.js` as the final authoritative override without contradicting portrait modules.
- Rewrite `InventoryModalStyles.js` so the shell is fixed, the panel owns the viewport, the body scrolls with touch momentum, and controls remain tappable.
- Rewrite `InventoryModalInteractionGuard.js` only if needed to preserve pan-y movement inside the panel.

## Quest files

- Rewrite `MinimalMeadowQuestState.js` with an exact-once completion receipt and explicit reward fields.
- Add a bounded quest completion presentation helper.
- Rewrite `MinimalMeadowQuestParchment.js` so successful turn-in renders the completion chapter before closing.
- Rewrite `MinimalMeadowQuestPresentation.js` and `MinimalMeadowMenuShlichus.js` so ready/completed state stays truthful and the next action is visible.

## World files

- Rewrite `MinimalMeadowRoadGeometry.js` with a small visual-only surface lift.
- Rewrite road evidence to report the lift and visible layer roles.
- Rewrite `MinimalMeadowWaterSources.js` to use the uploaded water and stone filenames through the existing catalog.
- Add a water-material hydration helper and rewrite `MinimalMeadowWaterSystem.js` so loaded images reach mounted materials and flow offsets animate.
- Rewrite tree leaf preparation into alpha-aware logic and keep legacy chroma-key only for opaque legacy sources.

## Combat and selection files

- Add `MinimalMeadowDamageFeedback.js` and a small style module.
- Rewrite `MinimalMeadowUi.js` to mount and destroy damage feedback.
- Rewrite `MinimalMeadowCombatWorldEffects.js` to emit a complete impact receipt and scale impact intensity by damage.
- Add a corpse pointer policy helper and rewrite `MinimalMeadowEnemyLifecycle.js` to use a larger dead-body screen-space radius.

## Constraints

- Whole-file rewrites only.
- Tabs for indentation.
- Every new or touched source module at or below 120 lines.
- Preserve one remote base URL source.
- Run tests only after all production files are complete.
