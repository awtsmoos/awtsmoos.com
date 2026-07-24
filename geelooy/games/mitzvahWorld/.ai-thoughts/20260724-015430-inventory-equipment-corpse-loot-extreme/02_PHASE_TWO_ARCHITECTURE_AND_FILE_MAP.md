B"H

Boruch Hashem

Blessed is He

# Phase Two — Realistic Architecture and File Map

The first pass opened possibility like Chesed. This second pass receives Gevurah: only the clean claimed workstream may move. The Awtsmoos renews both expansion and boundary; Awtsmoos.com is the witness that parallel labor succeeds only when every vessel knows its responsibility.

## Runtime Flow Graph

```text
Pointer / Bag button / corpse interaction
	|
	v
InventoryPanel or MinimalMeadowEnemyLoot
	|
	v
InventoryStore public mutation API
	|
	v
InventoryQuantityRules -> InventoryTransactionRules
	|
	v
one cloned next-state commit
	|
	+--> one snapshot publication
	|
	+--> EquipmentRuntime synchronization
	|
	+--> persistence listener(s)

Inventory equipment snapshot
	|
	v
EquipmentRuntime
	|
	+--> Garment visibility
	|
	+--> Attachment profile resolution
	|
	+--> One weapon object reparented to hand/back/root
	|
	v
equipment:state diagnostics -> InventoryPanel
```

## Files to Rewrite

### `InventoryQuantityRules.js` — new

- Validate finite positive integer quantities.
- Validate nonnegative finite prices and safe total costs.
- Provide one small boundary shared by add, remove, buy, restore, and loot.

### `InventoryTransactionRules.js` — new

- Clone stack arrays.
- Apply one or many additions without mutating the original.
- Apply removals without mutating the original.
- Build atomic purchase results.
- Aggregate and clamp restored stacks.
- Return explicit next arrays and transaction receipts.

### `InventoryStoreRules.js`

- Keep snapshot, derived stats, and pin rules.
- Delegate stack mutation primitives to transaction rules or retain compatibility wrappers.
- Preserve exported names used by existing callers/tests.

### `InventoryStore.js`

- Add `addMany(entries)`.
- Make `add()` delegate to `addMany()`.
- Make `buy()` one atomic transaction and one publication.
- Make rejected operations leave state and listener counts unchanged.
- Keep equipment cleanup after successful removals.
- Preserve public method names and snapshot shape.

### `InventoryPersistenceRules.js`

- Aggregate duplicate stacks.
- Validate every persisted quantity.
- Clamp after aggregation.
- Validate equipment against normalized owned stacks.
- Preserve learning and pinning behavior.

### `MinimalMeadowCorpseLootRules.js` — new

- Normalize loot arrays.
- Own claim-state transitions.
- Build immutable receipt payloads.
- Distinguish available, claiming, collected, alive, and transaction-failed outcomes.

### `MinimalMeadowEnemyLoot.js`

- Reject living actors.
- Acquire corpse claim before any inventory work.
- Call `inventory.addMany()` exactly once.
- On pre-commit failure, release claim and preserve corpse selection.
- On success, mark looted and collected before events.
- Emit existing events with cloned data.

### `MinimalMeadowAttachmentProfiles.js` — new

- Define exact canonical names and fallback aliases.
- Normalize names without allocating per frame.
- Resolve right hand, left hand, spine, and root fallback.
- Return quality evidence: exact, normalized, fallback-root, or missing.

### `MinimalMeadowEquipmentNodes.js`

- Build one name map per model bind.
- Resolve canonical and fallback attachments through the profile module.
- Preserve garment lookups and visible garment contract.
- Expose right/left hands, spine, model root, and resolution diagnostics.

### `MinimalMeadowWeaponAttachment.js`

- Accept a requested side.
- Choose hand/back/root parent deterministically.
- Reparent one weapon object.
- Apply kind/mode transform profiles.
- Never hide an equipped weapon merely because one preferred bone is absent.
- Preserve existing right-hand and upper-back attachment labels for canonical success.

### `MinimalMeadowEquipmentRuntime.js`

- Remove connected query-string imports.
- Track side and attachment mode.
- Keep one weapon object across draw/sheath and state synchronizations.
- Replace only when item ID changes.
- Rebind safely when model changes.
- Emit additive diagnostics including parent and resolution quality.
- Ensure destroy detaches and clears listeners.

### `InventoryPanel.js`

- Remove connected query-string import.
- Clear stale item selection after stack removal.
- Keep menu and card synchronized after every state mutation.
- Preserve event contracts and modal state.

### `InventoryPanelView.js`

- Keep actual runtime equipment state as source of truth.
- Make slot labels and action meanings explicit.
- Preserve safe escaping.
- Expand compressed helper expressions into readable functions.

## New Focused Tests

### `inventoryTransactions.test.mjs`

- addMany commits once.
- addMany rejects invalid entries atomically.
- buy removes currency and adds item in one publication.
- failed buy preserves currency.
- negative, zero, fractional, infinite, and NaN quantities reject.
- duplicate persisted stacks aggregate and clamp.
- removing an equipped final item clears the slot.

### `minimalMeadowEnemyLoot.test.mjs`

- living actor rejects.
- dead corpse grants all loot once.
- duplicate interaction rejects.
- re-entrant listener cannot claim twice.
- inventory transaction failure reopens corpse and preserves selection.
- receipt and profile loot arrays do not share mutable objects.

### `minimalMeadowEquipmentRuntime.test.mjs`

- canonical GLB names resolve exact hand/spine.
- fallback `right-hand` resolves.
- left-hand request resolves when available.
- absent bones attach visibly to root.
- draw/sheath reparents same object.
- GLB rebind detaches old parent and binds new.
- coat unequip hides jacket and re-equip restores it.
- weapon unequip detaches and hides.
- destroy unsubscribes and detaches.

## Files Deliberately Not Touched

The launcher receipt currently asserts exact canonical diagnostic names. Additive diagnostics must not change those existing values on canonical GLB models. No launcher rewrite is permitted.

## Implementation Order

1. Write quantity rules.
2. Write transaction rules.
3. Rewrite store rules and store.
4. Rewrite persistence rules.
5. Write corpse claim rules and rewrite corpse loot.
6. Write attachment profiles.
7. Rewrite equipment nodes, attachment, and runtime.
8. Rewrite Bag controller/view only after core contracts are stable.
9. Write tests.
10. Run syntax and focused tests.
11. Compare planned versus actual and perform one coherent refinement pass.
