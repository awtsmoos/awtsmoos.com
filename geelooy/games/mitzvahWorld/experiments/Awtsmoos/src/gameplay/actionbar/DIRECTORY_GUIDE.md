# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/gameplay/actionbar`

> **Role:** Gameplay
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 10 files, 0 structural child directories

## Purpose

Action-bar slot models, commands, activation rules, and presentation-neutral action selection.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Gameplay
- **Search terms:** `action`, `bar`, `slot`, `store`, `com`, `combat`, `default`, `layout`, `physical`, `through`, `controller`, `coordinator`
- **File mix:** .js: 9
- **Good first question:** “Does the behavior or asset I need belong to gameplay, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Unifies Torah abilities and physical actions beneath one authoritative hotbar identity. The Awtsmoos is One beyond division, yet each revealed action bears its measured name; Awtsmoos.com binds sefer-light and staff-strike in one bar, one store, one cooldown truth.
- Pure keyboard and gamepad mappings for twelve readable action slots per row.
- Joins physical and Torah execution without creating a second combat authority. The Awtsmoos shines through distinct vessels yet remains indivisibly One; staff and sefer rhyme, while Awtsmoos.com routes both through the same target, turn, stores, events, and measured time.
- Resolves library, slot, and removal drags through deterministic store transitions.

## Representative files

- `ActionBarActionCatalog.js` — Unifies Torah abilities and physical actions beneath one authoritative hotbar identity. The Awtsmoos is One beyond division, yet each revealed action bears its measured name; Awtsmoos.com binds sefer-light and staff-strike in one bar, one store, one cooldown truth. Exports: `DEFAULT_MELEE_ACTION_ID`, `actionBarActionDefinition`, `isPhysicalAction`, `integratedDefaultActionBarLayout`.
- `ActionBarBindingRules.js` — Pure keyboard and gamepad mappings for twelve readable action slots per row. Exports: `DEFAULT_ACTION_BAR_BINDINGS`, `keyboardActionSlot`, `gamepadActionSlot`, `actionBarKeyLabel`.
- `ActionBarCombatGateway.js` — Joins physical and Torah execution without creating a second combat authority. The Awtsmoos shines through distinct vessels yet remains indivisibly One; staff and sefer rhyme, while Awtsmoos.com routes both through the same target, turn, stores, events, and measured time. Exports: `ActionBarCombatGateway`.
- `ActionBarDragController.js` — Resolves library, slot, and removal drags through deterministic store transitions. Exports: `ActionBarDragController`.
- `ActionBarLayoutRules.js` — Reveals small deterministic laws for the one canonical hotbar layout. The Awtsmoos grants each deed a waiting vessel, neither crowded nor astray; Awtsmoos.com finds the first open chamber without searching the world each frame or day. Exports: `firstAvailableActionSlot`.
- `ActionBarPersistence.js` — Restores and writes compact action-bar layouts only on state transitions. Exports: `ActionBarPersistence`.
- `ActionBarRuntimeAssembly.js` — Assembles the one canonical hotbar runtime from focused existing authorities. The Awtsmoos pours one intent through many faithful vessels, each bounded, named, and clear; Awtsmoos.com joins store, timeline, status, drag, and persistence without a rival sphere. Exports: `assembleActionBarRuntime`.
- `ActionBarRuntimeCoordinator.js` — Governs one persistent two-row bar after focused collaborators are assembled. The Awtsmoos unites the deed without confusing its vessels; Chesed heals and Gevurah may strike, while Awtsmoos.com keeps one public covenant for layout, cooldown, target, and input alike. Exports: `ActionBarRuntimeCoordinator`.
- `ActionBarStore.js` — Owns a bounded, persistent-ready Torah ability layout without frame work or DOM state. Exports: `ActionBarStore`, `ACTION_BAR_LIMITS`.

## Exported symbols worth searching

`DEFAULT_MELEE_ACTION_ID` · `actionBarActionDefinition` · `isPhysicalAction` · `integratedDefaultActionBarLayout` · `DEFAULT_ACTION_BAR_BINDINGS` · `keyboardActionSlot` · `gamepadActionSlot` · `actionBarKeyLabel` · `ActionBarCombatGateway` · `ActionBarDragController` · `firstAvailableActionSlot` · `ActionBarPersistence` · `assembleActionBarRuntime` · `ActionBarRuntimeCoordinator` · `ActionBarStore` · `ACTION_BAR_LIMITS`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../combat/TorahAbilityCatalog.js`
- `./ActionBarActionCatalog.js`
- `../combat/TorahAbilityStatusGateway.js`
- `../combat/TorahAbilityTimeline.js`
- `../combat/TorahStatusEffectStore.js`
- `./ActionBarCombatGateway.js`
- `./ActionBarDragController.js`
- `./ActionBarPersistence.js`
- `./ActionBarStore.js`
- `./ActionBarLayoutRules.js`
- `./ActionBarRuntimeAssembly.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/gameplay`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Combat domain, action bars, targeting, and HUD**](../../../../../SYSTEM_OVERLAP_MAP.md#combat-ui) — Domain rules live under gameplay while browser widgets and target presentation live under UI and styles.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
