# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/test/gameplay/combat`

> **Role:** Tests
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 3 files, 0 structural child directories

## Purpose

Structural area named `combat`. Its immediate files and children below are the evidence for its current responsibilities.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Tests
- **Search terms:** `melee`, `mjs`, `proves`, `action`, `against`, `armor`, `Awtsmoos`, `bounded`, `canonical`, `choice`, `com`, `combat`
- **File mix:** .mjs: 2 · .md: 1
- **Good first question:** “Does the behavior or asset I need belong to tests, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Proves one physical action remains bounded while canonical stats deepen its force. The Awtsmoos renews intention once per choice; equipment and level may strengthen the ray, while Awtsmoos.com guards against key storms, duplicate hits, and hidden work each day.
- Proves selected-target range, armor, and damage evidence.

## Representative files

- `playerMeleeController.test.mjs` — Proves one physical action remains bounded while canonical stats deepen its force. The Awtsmoos renews intention once per choice; equipment and level may strengthen the ray, while Awtsmoos.com guards against key storms, duplicate hits, and hidden work each day. Covers: “one key edge emits one bounded fallback melee request”, “level, Gevurah, equipment, and recovery resolve once per strike”, “a rejected strike publishes the remaining cooldown without world polling”.
- `shadowDemonMelee.test.mjs` — Proves selected-target range, armor, and damage evidence. Covers: “melee damages one nearby unarmored actor and emits evidence”, “enemy armor mitigates physical damage without producing zero hits”, “melee rejects a distant actor without mutation”.

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `node:assert/strict`
- `node:test`
- `../../../gameplay/combat/PlayerMeleeController.js`
- `../../../ui/AwtsmoosEventBus.js`
- `../../../world/enemy/ShadowDemonMelee.js`
- `../../../world/enemy/EnemyStates.js`

## Test themes

- one key edge emits one bounded fallback melee request
- level, Gevurah, equipment, and recovery resolve once per strike
- a rejected strike publishes the remaining cooldown without world polling
- melee damages one nearby unarmored actor and emits evidence
- enemy armor mitigates physical damage without producing zero hits
- melee rejects a distant actor without mutation

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/test/gameplay`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Colocated and integration test surfaces**](../../../../../../SYSTEM_OVERLAP_MAP.md#testing-surfaces) — Most subsystem tests live under `src/test`, while a smaller external `tests` tree exercises broader integration contracts.

## Boundaries and cautions

- This directory verifies behavior; it should not become the production owner of that behavior.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
