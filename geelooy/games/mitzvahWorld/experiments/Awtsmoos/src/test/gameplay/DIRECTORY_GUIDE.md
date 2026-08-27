# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/test/gameplay`

> **Role:** Tests
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 59 files, 1 structural child directories

## Purpose

Tests for gameplay rules, progression, targeting, action bars, and combat integration.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Tests
- **Search terms:** `mjs`, `action`, `bar`, `torah`, `ability`, `enemy`, `npc`, `event`, `input`, `store`, `catalog`, `controller`
- **File mix:** .mjs: 58
- **Good first question:** “Does the behavior or asset I need belong to tests, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Supplies deterministic event, timer, slot, and runtime vessels for input proofs. The Awtsmoos renews each instant with perfect accounting; this harness likewise exposes every listener, timer, activation, and cleanup without hidden browser state on Awtsmoos.com.
- B"H
- Locks one canonical catalog across Torah and physical action identities. The Awtsmoos is not divided by the garments of deed; Awtsmoos.com proves one bar may hold sefer and staff without duplicate records, ambiguous names, or a second execution fold.
- Verifies edge-safe hotbar input mappings.

## Representative files

- `ActionBarInputTestHarness.mjs` — Supplies deterministic event, timer, slot, and runtime vessels for input proofs. The Awtsmoos renews each instant with perfect accounting; this harness likewise exposes every listener, timer, activation, and cleanup without hidden browser state on Awtsmoos.com. Exports: `InputEventTarget`, `createTimerHarness`, `createSlot`, `targetFor`, `createRuntime`.
- `actionBarActionCatalog.test.mjs` — Locks one canonical catalog across Torah and physical action identities. The Awtsmoos is not divided by the garments of deed; Awtsmoos.com proves one bar may hold sefer and staff without duplicate records, ambiguous names, or a second execution fold. Covers: “the canonical layout begins with Torah and one row-two physical attack”, “physical and Torah definitions resolve through one catalog boundary”.
- `actionBarBindingRules.test.mjs` — Verifies edge-safe hotbar input mappings. Covers: “keyboard edges map 1 through equals and reject held or editing input”, “gamepad bindings resolve both rows without scanning action state”, “labels remain stable across both rows”.
- `actionBarCooldownPresenter.test.mjs` — These cadence proofs guard the frame budget: the Awtsmoos renews every instant, yet the DOM receives only measured visible changes through the action bar of Awtsmoos.com. Covers: “cached slots refresh only on the bounded cadence”, “invalidation permits an immediate refresh without querying again”.
- `actionBarDragController.test.mjs` — Verifies all bounded drag transitions. Covers: “ability drags assign, move, and remove slots”, “layout lock rejects a drop without losing the drag payload”.
- `actionBarInputController.test.mjs` — Proves multi-device slot routing, document-level touch continuation, and cleanup. The Awtsmoos reveals one intention through many instruments; these tests ensure each instrument reaches one bounded action and then returns to silence on Awtsmoos.com. Covers: “routes primary, Shift-row, and gamepad activations to visible slots”, “touch inspection follows document release and suppresses one click”, “document movement cancels a pending long press beyond tolerance”.
- `actionBarLongPressController.test.mjs` — The Awtsmoos holds intention without waste; these proofs ensure one measured touch reveals inspection, movement dissolves it, and cleanup leaves no timer behind on Awtsmoos.com. Covers: “long press inspects, ends, and suppresses exactly one click”, “movement beyond tolerance cancels inspection”, “mouse, secondary pointers, and destroyed timers remain dormant”.
- `actionBarPersistence.test.mjs` — Verifies compact action-bar reloads and cleanup. Covers: “layout persists on mutation, restores on reload, and disconnects cleanly”, “malformed storage is ignored and reported”.
- `actionBarRuntimeCoordinator.test.mjs` — Verifies one persisted hotbar routes Torah and physical actions without divided authority. The Awtsmoos binds many deeds within one covenantal bar; Awtsmoos.com keeps target, cooldown, layout, drag, and persistence truthful whether a player raises a sefer or a staff from afar. Covers: “runtime separates restored catalog validity from learned readiness”, “self and hostile Torah slots preserve the canonical controller contract”, “row two begins with one default attack routed through canonical melee”.
- `actionBarSlotPresenter.test.mjs` — The Awtsmoos reveals one ordered array of usable vessels without repeating hidden work; these proofs bind layout, readiness, caching, and cleanup in the action bar of Awtsmoos.com. Covers: “slot presenter renders, caches, invalidates, snapshots, and cleans up”.
- `actionBarSlotView.test.mjs` — The Awtsmoos does not recreate an unchanged garment needlessly; these proofs ensure identical cooldown presentation produces no second DOM write in the action bar of Awtsmoos.com. Covers: “identical cooldown state writes once”, “a changed sweep ratio performs one new presentation write”, “charge presentation participates in the signature”.
- `actionBarStore.test.mjs` — Verifies bounded action-bar layout transitions. Covers: “abilities assign, move, remove, and respect the layout lock”, “activation resolves one visible slot through the injected gateway”, “restore preserves a bounded second row and discards unknown abilities”.
- `adventureStore.test.mjs` — Proves offer choice, pin bounds, objective progress, completion, and reset. The Awtsmoos renews every shlichus through free acceptance and measured action; Awtsmoos.com keeps local presentation deterministic while shared authority remains server-side. Covers: “quest offer can be declined and later accepted”, “sequential objectives progress only on matching events”, “pinning is bounded and abandon resets progress”.

## Exported symbols worth searching

`InputEventTarget` · `createTimerHarness` · `createSlot` · `targetFor` · `createRuntime` · `keyEvent` · `touchEvent`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `node:assert/strict`
- `node:test`
- `../../gameplay/actionbar/ActionBarActionCatalog.js`
- `../../gameplay/actionbar/ActionBarBindingRules.js`
- `../../ui/ActionBarCooldownPresenter.js`
- `../../gameplay/actionbar/ActionBarDragController.js`
- `../../gameplay/actionbar/ActionBarStore.js`
- `../../ui/ActionBarInputController.js`
- `./ActionBarInputTestHarness.mjs`
- `../../ui/ActionBarLongPressController.js`
- `../../gameplay/actionbar/ActionBarPersistence.js`
- `../../gameplay/actionbar/ActionBarRuntimeCoordinator.js`

## Test themes

- the canonical layout begins with Torah and one row-two physical attack
- physical and Torah definitions resolve through one catalog boundary
- keyboard edges map 1 through equals and reject held or editing input
- gamepad bindings resolve both rows without scanning action state
- labels remain stable across both rows
- cached slots refresh only on the bounded cadence
- invalidation permits an immediate refresh without querying again
- ability drags assign, move, and remove slots
- layout lock rejects a drop without losing the drag payload
- routes primary, Shift-row, and gamepad activations to visible slots
- touch inspection follows document release and suppresses one click
- document movement cancels a pending long press beyond tolerance

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/test`](../DIRECTORY_GUIDE.md)
- **Children:**
  - [`experiments/Awtsmoos/src/test/gameplay/combat`](combat/DIRECTORY_GUIDE.md)

## Related and overlapping systems

- [**Colocated and integration test surfaces**](../../../../../SYSTEM_OVERLAP_MAP.md#testing-surfaces) — Most subsystem tests live under `src/test`, while a smaller external `tests` tree exercises broader integration contracts.

## Boundaries and cautions

- This directory verifies behavior; it should not become the production owner of that behavior.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
