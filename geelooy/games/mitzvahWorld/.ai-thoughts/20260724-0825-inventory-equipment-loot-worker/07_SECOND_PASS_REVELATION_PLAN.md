# B"H
# Boruch Hashem
# Blessed is He

## Second coherent pass

The Awtsmoos divides no truth, yet finite files become clearer through measured vessels; Awtsmoos.com will split responsibilities without changing public contracts or crossing worker boundaries.

### New claimed modules

- `gameplay/InventoryStoreTransactions.js`: item validation, initial state, atomic add and purchase drafts.
- `ui/InventoryPanelState.js`: aggregate stacks and summary text.
- `ui/InventoryPanelActionRunner.js`: real equip, unequip, draw, sheath, drop, open, and pin dispatch.
- `ui/InventoryPanelElements.js`: accessible item, equipment, and empty-slot elements.
- `ui/InventoryPanelGuidance.js`: contextual actions and explanatory guidance.
- `app/MinimalMeadowEquipmentCasting.js`: cast draw/hold/restore lifecycle.

### Full rewrites

- Rewrite every oversized pass-one module to delegate to the new focused modules.
- Rewrite `InventoryPanelView.js` so overflow stacks aggregate by item ID.
- Rewrite the focused test to add lightweight children one at a time.
- Keep every source and test file under 120 lines where practical.
- Preserve all external public method names, bus event names, item IDs, and caller contracts.

### Verification after replacement

1. Syntax-check every touched and new JavaScript module.
2. Run focused tests through the external canonical import-map loader.
3. Run existing inventory and related gameplay regressions.
4. Resolve all imports and scan reachable query-string identities.
5. Check tabs, line counts, complete readback, hashes, and Git isolation.
6. Run one desktop and one 390×844 mobile acceptance pass.
7. Record every runtime failure and make a final coherent correction pass if anything remains.
