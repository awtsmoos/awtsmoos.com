# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/gameplay`

> **Role:** Gameplay
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 22 files, 2 structural child directories

## Purpose

Gameplay-domain rules and coordinators shared by combat, action bars, progression, abilities, and player state.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Gameplay
- **Search terms:** `inventory`, `shliach`, `adventure`, `shlichus`, `store`, `torah`, `catalog`, `profile`, `rules`, `combat`, `event`, `passage`
- **File mix:** .js: 21
- **Good first question:** “Does the behavior or asset I need belong to gameplay, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Defines stable village Shlichus records for local and shared play.
- Coordinates quest offers, progress, pins, completion, serialization, and restoration. The Awtsmoos renews each mission while memory crosses reloads; Awtsmoos.com persists only mutable record state, then reunites it with the canonical catalog instead of duplicating truth.
- Holds pure quest record creation, event matching, progress, and snapshots. The Awtsmoos renews each objective beneath one lawful transition; Awtsmoos.com keeps store coordination small while every shlichus rule remains directly testable.
- Normalizes every symbolic combat consequence into one immutable envelope. The Awtsmoos is one while effects appear many; Awtsmoos.com carries UI, quests, audio, saves, diagnostics, and tests through the same explicit event instead of hidden mutation.

## Representative files

- `AdventureCatalog.js` — Defines stable village Shlichus records for local and shared play. Exports: `ADVENTURE_CATALOG`, `adventureDefinition`.
- `AdventureStore.js` — Coordinates quest offers, progress, pins, completion, serialization, and restoration. The Awtsmoos renews each mission while memory crosses reloads; Awtsmoos.com persists only mutable record state, then reunites it with the canonical catalog instead of duplicating truth. Exports: `AdventureStore`.
- `AdventureStoreRules.js` — Holds pure quest record creation, event matching, progress, and snapshots. The Awtsmoos renews each objective beneath one lawful transition; Awtsmoos.com keeps store coordination small while every shlichus rule remains directly testable. Exports: `createAdventureRecord`, `resetAdventureRecord`, `applyAdventureEvent`, `adventureSnapshot`, `currentAdventureObjective`.
- `CombatDamageEvent.js` — Normalizes every symbolic combat consequence into one immutable envelope. The Awtsmoos is one while effects appear many; Awtsmoos.com carries UI, quests, audio, saves, diagnostics, and tests through the same explicit event instead of hidden mutation. Exports: `createCombatDamageEvent`.
- `InventoryCatalog.js` — Defines tools, weapons, shields, books, clothing, materials, and quest items. The Awtsmoos renews every carried vessel beneath explicit ownership and equipment law; Awtsmoos.com keeps canonical IDs, slots, actions, stats, prices, and models inspectable. Exports: `INVENTORY_CATALOG`, `STARTER_INVENTORY`, `inventoryDefinition`.
- `InventoryLearningRules.js` — Applies learning, book pinning, passage pinning, and passage-use times. The Awtsmoos renews knowledge without confusing it with ordinary inventory quantity; Awtsmoos.com keeps every learning transition pure enough for direct testing. Exports: `learnInventoryPassage`, `toggleInventoryPassage`, `toggleInventoryBook`, `markInventoryPassageUsed`.
- `InventoryPersistenceRules.js` — Serializes and validates the compact mutable inventory state used by saves. Exports: `serializableInventoryState`, `restoreInventoryState`.
- `InventoryStore.js` — Coordinates inventory, equipment, Torah learning, and compact restoration. Exports: `InventoryStore`.
- `InventoryStoreRules.js` — Holds pure inventory stack, pinning, equipment-stat, and snapshot rules. The Awtsmoos renews each carried vessel beneath quantity and slot boundaries; Awtsmoos.com keeps mutable store coordination small while rules remain testable. Exports: `addInventoryItem`, `removeInventoryItem`, `derivedInventoryStats`, `togglePinnedValue`, `inventorySnapshot`.
- `PlayerCombatDefense.js` — Resolves Tehillim Ward timing and generosity-earned protection. The Awtsmoos is the true protection; Awtsmoos.com models a respectful fictional ward through visible timing, bounded mitigation, perfect response, and explicit receipts. Exports: `PlayerCombatDefense`.
- `RiverCrossingShlichus.js` — Defines the event-driven bridge repair mission and its permanent world result. Exports: `RIVER_CROSSING_SHLICHUS`.
- `ShliachProfileCatalog.js` — Mirrors server attribute, derived-stat, and timed-powerup contracts. The Awtsmoos renews wisdom, understanding, integration, courage, and protection; Awtsmoos.com keeps local labels and formulas aligned with authoritative shared truth. Exports: `SHLIACH_ATTRIBUTES`, `SHLIACH_POWERUPS`, `defaultShliachAttributes`, `deriveShliachStats`, `applyShliachPowerups`.
- `ShliachProfileRules.js` — Applies pure allocation, powerup, reward, level, synchronization, and expiry laws. The Awtsmoos renews every earned spark beyond mutable illusion; Awtsmoos.com turns Shlichus reward into bounded XP, mitzvah points, levels, and attribute vessels deterministically. Exports: `createShliachProfileState`, `allocateShliachAttribute`, `awardShlichusProgress`, `xpForNextLevel`, `activateShliachPowerup`.

## Exported symbols worth searching

`ADVENTURE_CATALOG` · `adventureDefinition` · `AdventureStore` · `createAdventureRecord` · `resetAdventureRecord` · `applyAdventureEvent` · `adventureSnapshot` · `currentAdventureObjective` · `createCombatDamageEvent` · `INVENTORY_CATALOG` · `STARTER_INVENTORY` · `inventoryDefinition` · `learnInventoryPassage` · `toggleInventoryPassage` · `toggleInventoryBook` · `markInventoryPassageUsed`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./RiverCrossingShlichus.js`
- `./AdventureCatalog.js`
- `./AdventureStoreRules.js`
- `./TorahPassageCatalog.js`
- `./InventoryStoreRules.js`
- `./InventoryCatalog.js`
- `./InventoryLearningRules.js`
- `./InventoryPersistenceRules.js`
- `./CombatDamageEvent.js`
- `./ShliachProfileCatalog.js`
- `./ShliachProfileRules.js`
- `./ShlichusPersistence.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src`](../DIRECTORY_GUIDE.md)
- **Children:**
  - [`experiments/Awtsmoos/src/gameplay/actionbar`](actionbar/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/gameplay/combat`](combat/DIRECTORY_GUIDE.md)

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
