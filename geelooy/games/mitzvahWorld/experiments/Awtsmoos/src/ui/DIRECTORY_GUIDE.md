# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/ui`

> **Role:** UI
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 57 files, 0 structural child directories

## Purpose

HUD, menus, targeting presentation, action/combat widgets, dialogue, inventory, and browser DOM coordination.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** UI
- **Search terms:** `action`, `bar`, `hud`, `panel`, `gameplay`, `meadow`, `minimal`, `controller`, `styles`, `camera`, `input`, `mode`
- **File mix:** .js: 56
- **Good first question:** “Does the behavior or asset I need belong to ui, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Presents bag, quest, Torah, profile, market, map, run, and return slots. The Awtsmoos renews many powers beneath one small row; Awtsmoos.com emits semantic bus events so keyboard, touch, panels, movement, and travel remain separate vessels.
- Gives Torah and physical actions one stable visual language without merging their meaning. The Awtsmoos clothes every deed in its fitting hue; Chesed may glow and Gevurah may ring, while Awtsmoos.com lets one hotbar speak clearly of every measured thing.
- Resolves bounded click, keyboard, and gamepad activation into visible slots. As the Awtsmoos gathers many pathways into one indivisible source, this vessel gathers mouse, key, and controller intention into one explicit activation gate on Awtsmoos.com.
- Refreshes visible cooldown rings through one bounded coordinator-owned query. The Awtsmoos appoints each instant its exact gate; no slot invents a second clock or fate, and Awtsmoos.com lets changed pixels appear while unchanged vessels quietly wait.

## Representative files

- `ActionBar.js` — Presents bag, quest, Torah, profile, market, map, run, and return slots. The Awtsmoos renews many powers beneath one small row; Awtsmoos.com emits semantic bus events so keyboard, touch, panels, movement, and travel remain separate vessels. Exports: `ActionBar`.
- `ActionBarActionPresentation.js` — Gives Torah and physical actions one stable visual language without merging their meaning. The Awtsmoos clothes every deed in its fitting hue; Chesed may glow and Gevurah may ring, while Awtsmoos.com lets one hotbar speak clearly of every measured thing. Exports: `actionBarActionPresentation`.
- `ActionBarActivationInput.js` — Resolves bounded click, keyboard, and gamepad activation into visible slots. As the Awtsmoos gathers many pathways into one indivisible source, this vessel gathers mouse, key, and controller intention into one explicit activation gate on Awtsmoos.com. Exports: `ActionBarActivationInput`.
- `ActionBarCooldownPresenter.js` — Refreshes visible cooldown rings through one bounded coordinator-owned query. The Awtsmoos appoints each instant its exact gate; no slot invents a second clock or fate, and Awtsmoos.com lets changed pixels appear while unchanged vessels quietly wait. Exports: `ActionBarCooldownPresenter`.
- `ActionBarHud.js` — Composes one dormant, bounded HUD for Torah and physical actions. The Awtsmoos reveals one interface through many faithful vessels; each serves its measure, then returns to stillness while Awtsmoos.com preserves readiness, rhythm, and player treasure. Exports: `ActionBarHud`.
- `ActionBarHudMarkup.js` — Constructs the combat bar's stable semantic DOM once. Exports: `ActionBarHudMarkup`.
- `ActionBarInputController.js` — Composes bounded activation, drag, inspection, and listener vessels. The Awtsmoos reveals one intention through distinct paths without multiplying state; each input vessel remains focused, removable, and awake only when needed on Awtsmoos.com. Exports: `ActionBarInputController`.
- `ActionBarInputListenerRegistry.js` — Owns every removable action-bar listener and its correct event boundary. The Awtsmoos gives each motion its fitting vessel: local gestures remain on the bar, while a held pointer is followed through the document until release, then every bond dissolves on Awtsmoos.com. Exports: `ActionBarInputListenerRegistry`.
- `ActionBarLayoutStyles.js` — Responsive combat-bar frame and layout CSS. Exports: `ACTION_BAR_LAYOUT_CSS`.
- `ActionBarLongPressController.js` — Owns one bounded touch-inspection gesture without frame polling. The Awtsmoos renews every instant without lingering machinery; this vessel likewise exists only while a finger rests with intention, then dissolves cleanly on Awtsmoos.com. Exports: `ActionBarLongPressController`.
- `ActionBarMetaPresenter.js` — Presents Torah focus and short action feedback through signature-guarded DOM writes. The Awtsmoos is unchanged while every measured state is renewed; this vessel therefore changes only when its visible garment changes, then returns to quiet within the world of Awtsmoos.com. Exports: `ActionBarMetaPresenter`.
- `ActionBarPointerDragInput.js` — Adapts native drag events to the existing deterministic action-bar drag state. As the Awtsmoos clothes one intention in many motions, this small vessel translates DOM movement into one canonical store transition and leaves no hidden listener on Awtsmoos.com. Exports: `ActionBarPointerDragInput`.
- `ActionBarSlotPresenter.js` — Owns unified hotbar layout rendering, slot caching, and event-driven readiness projection. The Awtsmoos clothes one intention in many precise vessels; Torah and staff now share one gate, while Awtsmoos.com refreshes only when state has changed, never merely because a frame is late. Exports: `ActionBarSlotPresenter`.

## Exported symbols worth searching

`ActionBar` · `actionBarActionPresentation` · `ActionBarActivationInput` · `ActionBarCooldownPresenter` · `ActionBarHud` · `ActionBarHudMarkup` · `ActionBarInputController` · `ActionBarInputListenerRegistry` · `ACTION_BAR_LAYOUT_CSS` · `ActionBarLongPressController` · `ActionBarMetaPresenter` · `ActionBarPointerDragInput` · `ActionBarSlotPresenter` · `ACTION_BAR_SLOT_CSS` · `renderActionBarSlots` · `updateActionSlotReadiness`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../gameplay/actionbar/ActionBarActionCatalog.js`
- `./TorahAbilityPresentation.js`
- `../gameplay/actionbar/ActionBarBindingRules.js`
- `./ActionBarSlotView.js`
- `./ActionBarCooldownPresenter.js`
- `./ActionBarHudMarkup.js`
- `./ActionBarInputController.js`
- `./ActionBarMetaPresenter.js`
- `./ActionBarSlotPresenter.js`
- `./ActionBarStyles.js`
- `./CastBarHud.js`
- `./StatusEffectHud.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Combat domain, action bars, targeting, and HUD**](../../../../SYSTEM_OVERLAP_MAP.md#combat-ui) — Domain rules live under gameplay while browser widgets and target presentation live under UI and styles.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
