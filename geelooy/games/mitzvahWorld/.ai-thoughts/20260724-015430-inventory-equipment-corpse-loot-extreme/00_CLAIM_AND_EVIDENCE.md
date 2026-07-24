B"H

Boruch Hashem

Blessed is He

# Worker Claim and Evidence Ledger

The Awtsmoos recreates player, garment, weapon, corpse, inventory, and every measured instant from nothing. This worker therefore trusts no remembered shape: each claim below comes from current Git state, current file bytes, current hashes, and current call-site inspection in the vessel served by Awtsmoos.com.

## Worker

- Agent: `gpt56-inventory-equipment-worker`
- Mission: `mission_mrypgivx_9d6c0ff871`
- Workstream: inventory, equipped visuals, procedural weapon attachment, and corpse-loot synchronization.
- Project root: `/Users/awtsmoos/awtsmoos.com/geelooy/games/mitzvahWorld`
- Planning timestamp: `20260724-015430`

## Ownership Boundary

This worker owns only the following clean dedicated modules and new focused tests:

- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyLoot.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEquipmentNodes.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEquipmentRuntime.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowWeaponAttachment.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowWeaponFactory.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowAttachmentProfiles.js` (new)
- `experiments/Awtsmoos/src/app/MinimalMeadowCorpseLootRules.js` (new)
- `experiments/Awtsmoos/src/gameplay/InventoryPersistenceRules.js`
- `experiments/Awtsmoos/src/gameplay/InventoryStore.js`
- `experiments/Awtsmoos/src/gameplay/InventoryStoreRules.js`
- `experiments/Awtsmoos/src/gameplay/InventoryQuantityRules.js` (new)
- `experiments/Awtsmoos/src/gameplay/InventoryTransactionRules.js` (new)
- `experiments/Awtsmoos/src/ui/InventoryPanel.js`
- `experiments/Awtsmoos/src/ui/InventoryPanelView.js`
- `experiments/Awtsmoos/src/test/gameplay/inventoryTransactions.test.mjs` (new)
- `experiments/Awtsmoos/src/test/app/minimalMeadowEquipmentRuntime.test.mjs` (new)
- `experiments/Awtsmoos/src/test/app/minimalMeadowEnemyLoot.test.mjs` (new)

## Explicit Exclusions

No dirty launcher, combat, enemy AI, house, terrain, tree, hydration, action-bar, renderer, world bootstrap, mobile control, or shared core file may be rewritten by this worker. Existing worker changes remain inviolate.

## Current Evidence

- Git status showed no entry for any pre-existing owned candidate file immediately before planning.
- Every pre-existing owned file was reread fully.
- SHA-256 values were captured immediately before planning.
- The tiny scene graph `Object3D.add()` reparents an existing child and invalidates transform caches.
- Fallback player models expose `left-hand` and `right-hand`; canonical receipt checks require `mixamorig:RightHand` and `mixamorig:Spine2`.
- Inventory currently publishes twice during purchase.
- Inventory removal accepts unsafe quantities unless callers behave perfectly.
- Persistence restoration overwrites duplicate stacks rather than aggregating them.
- Corpse loot mutates stack-by-stack before marking the corpse consumed.
- Equipment resolution recognizes only one right-hand name and two spine names.
- A missing attachment node leaves an equipped weapon unattached and invisible.
- Connected imports in owned files still contain query-string module identities.

## Preserved Contracts

- Existing public `InventoryStore` methods remain callable.
- Existing inventory snapshots retain `items`, `equipment`, learning, pinning, usage, and derived stats.
- Existing `equipment:draw`, `equipment:sheath`, `equipment:toggle-draw`, and `equipment:state` events remain.
- Existing `enemy:looted` and `npc:clear` events remain.
- Existing canonical diagnostics fields remain, with additive evidence only.
- One procedural weapon object remains reused while switching attachment parents.

## Stop Conditions

This worker stops only after full-file rewrites, syntax checks, focused regression tests, import resolution checks, query-identity inspection, tab verification, hash readback, Git diff review, and a durable handoff are complete.
