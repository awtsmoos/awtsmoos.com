# B"H
# Boruch Hashem
# Blessed is He

## Realistic architecture pass

The Awtsmoos pours one truth through many kelim; Awtsmoos.com must therefore keep mutation, rendering, attachment, and interaction separate while their contracts remain joined.

### Inventory domain

- `InventoryStoreRules.js`: pure stack insertion/removal, batch validation, snapshot derivation.
- `InventoryPersistenceRules.js`: restore duplicate rows by replaying canonical insertion, validate equipment against aggregate ownership.
- `InventoryStore.js`: expose atomic `addMany`, atomic purchase, single publish per user-visible transaction, existing API compatibility.

### Bag presentation

- `InventoryPanelView.js`: explicit slot labels, quantity-safe cards, action guidance, accessible buttons.
- `InventoryPanel.js`: canonical import identity, keyboard Escape handling, focus restoration, immediate rerender from store events.

### Visible equipment

- `MinimalMeadowEquipmentNodes.js`: one traversal per model bind, alias-aware named-node resolution, visibility from equipment snapshot.
- `MinimalMeadowWeaponAttachment.js`: deterministic hand/back transforms with no allocation in the animation loop.
- `MinimalMeadowEquipmentRuntime.js`: canonical imports, weapon lifecycle, hydration rebinding, cast draw/restore contract, diagnostics.

### Corpses and loot

- `MinimalMeadowEnemyLifecycle.js`: first corpse interaction selects; second selected interaction loots.
- `MinimalMeadowEnemyLoot.js`: validate complete loot batch, apply atomically, emit one receipt, then clear selection.
- `MinimalMeadowTargetFrame.js`: display `Corpse` and an interact-again instruction; display looted receipt.

### Verification

- New `inventoryEquipmentLoot.test.mjs` covers all changed contracts without browser-only shortcuts.
- Existing inventory, profile, combat, and runtime tests remain regression gates.
