# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/tests/gameplay`

> **Role:** Tests
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 5 files, 0 structural child directories

## Purpose

Integration tests focused on the `gameplay` area.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Tests
- **Search terms:** `guards`, `torah`, `action`, `bar`, `gevurah`, `light`, `timeline`, `ability`, `charge`, `remembers`, `shlichus`, `tiferes`
- **File mix:** .js: 4 · .md: 1
- **Good first question:** “Does the behavior or asset I need belong to tests, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Guards the one action-bar vessel from layout drift and duplicated activation. Chesed fills the slot, Gevurah keeps its border bright; Yesod remembers every place, while Malchus turns one edge to light.
- B"H
- A focused witness that one Shlichus survives reload and pays its reward once. The Awtsmoos renews the world without duplicating yesterday's earned light; this test guards the persistence vessel that carries that truth in Awtsmoos.com.
- Guards the single Torah cast river from start through interruption and completion. Netzach bears the casting light, Gevurah may close its gate; Hod counts three channel beats, while Tiferes joins their fate.

## Representative files

- `ActionBarStore.test.js` — Guards the one action-bar vessel from layout drift and duplicated activation. Chesed fills the slot, Gevurah keeps its border bright; Yesod remembers every place, while Malchus turns one edge to light. Covers: “store and drag share one bounded layout owner”, “Yesod persistence restores one compact two-row layout”, “one fresh keyboard edge produces exactly one activation”.
- `ShlichusRuntimeCoordinator.test.js` — A focused witness that one Shlichus survives reload and pays its reward once. The Awtsmoos renews the world without duplicating yesterday's earned light; this test guards the persistence vessel that carries that truth in Awtsmoos.com. Covers: “Shlichus restores progress and never duplicates a completed reward”.
- `TorahAbilityTimelineLifecycle.test.js` — Guards the single Torah cast river from start through interruption and completion. Netzach bears the casting light, Gevurah may close its gate; Hod counts three channel beats, while Tiferes joins their fate. Covers: “cast executes once only at its canonical completion deadline”, “interrupt clears the sole cast without executing it”, “channel commits once, emits three bounded ticks, and completes once”.
- `TorahAbilityTimelinePreflight.test.js` — Guards the one Torah timeline where target, focus, cooldown, and charge become one law. Chochmah sees the foe, Gevurah measures where shadows are; Yesod remembers every charge, while Tiferes keeps one action bar. Covers: “preflight rejects missing target, range, and focus through one path”, “accepted instant ability creates global and personal cooldown”, “charged ability consumes two charges and lazily restores one”.

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `node:test`
- `node:assert/strict`
- `../../src/gameplay/actionbar/ActionBarBindingRules.js`
- `../../src/gameplay/actionbar/ActionBarDragController.js`
- `../../src/gameplay/actionbar/ActionBarPersistence.js`
- `../../src/gameplay/actionbar/ActionBarStore.js`
- `../../src/gameplay/AdventureStore.js`
- `../../src/gameplay/ShliachProfileStore.js`
- `../../src/gameplay/ShlichusPersistence.js`
- `../../src/gameplay/ShlichusRuntimeCoordinator.js`
- `../../src/gameplay/combat/TorahAbilityCatalog.js`
- `../../src/gameplay/combat/TorahAbilityTimeline.js`

## Test themes

- store and drag share one bounded layout owner
- Yesod persistence restores one compact two-row layout
- one fresh keyboard edge produces exactly one activation
- Shlichus restores progress and never duplicates a completed reward
- cast executes once only at its canonical completion deadline
- interrupt clears the sole cast without executing it
- channel commits once, emits three bounded ticks, and completes once
- preflight rejects missing target, range, and focus through one path
- accepted instant ability creates global and personal cooldown
- charged ability consumes two charges and lazily restores one

## Directory map

- **Parent:** [`experiments/Awtsmoos/tests`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Colocated and integration test surfaces**](../../../../SYSTEM_OVERLAP_MAP.md#testing-surfaces) — Most subsystem tests live under `src/test`, while a smaller external `tests` tree exercises broader integration contracts.

## Boundaries and cautions

- This directory verifies behavior; it should not become the production owner of that behavior.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
