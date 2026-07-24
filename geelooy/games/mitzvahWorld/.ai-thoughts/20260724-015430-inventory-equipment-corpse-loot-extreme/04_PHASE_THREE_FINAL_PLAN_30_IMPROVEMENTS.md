B"H

Boruch Hashem

Blessed is He

# Phase Three — Final Plan and Thirty Additional Improvements

The Awtsmoos recreates the plan itself, so the final plan is not the first plan repeated more loudly. It is the plan after evidence, opposition, and reconciliation. Awtsmoos.com stands in this file as the public reminder that good architecture is transparent enough for another soul to inherit.

## Thirty Additional Improvements

1. Export one `requirePositiveInventoryQuantity` boundary with contextual error labels.
2. Export one `aggregateInventoryEntries` helper so duplicate transaction entries are deterministic.
3. Preserve input order for first-seen item IDs in transaction receipts.
4. Never mutate caller-owned entry objects.
5. Clone current stacks before applying any live mutation.
6. Reject a live addition if requested total exceeds remaining stack capacity.
7. Permit restore normalization to clamp instead of throw.
8. Require definitions to expose a positive integer stack limit.
9. Use safe integer checks for every resulting quantity.
10. Use safe integer checks for purchase totals.
11. Build purchase on one cloned array: remove currency, then add merchandise, then commit.
12. Publish through a copied listener list so listeners may unsubscribe safely during notification.
13. Make `addMany` return the authoritative snapshot for compatibility with other store methods.
14. Make `add` preserve its current return shape by delegating.
15. Make `remove` clear every equipment slot referencing a fully removed item before publish.
16. Make restore publish once and retain its existing public contract.
17. Map legacy `actor.looted === true` to collected before attempting claim.
18. Store the active claim token in a non-persistent actor property with a descriptive name.
19. Copy corpse loot definitions before passing them into inventory rules.
20. Keep corpse selected after a failed inventory transaction so the player can retry.
21. Clear selection only after successful commit.
22. Report event notification failure additively without rolling back committed inventory.
23. Resolve model names through exact map plus normalized map constructed once per bind.
24. Normalize by lowercase alphanumerics only so separators do not break matching.
25. Preserve traversal order when multiple aliases normalize to the same value.
26. Prefer hand side requested by runtime; fallback to the opposite hand only when configured.
27. Use bound model root as last visible attachment parent.
28. Keep canonical attachment labels unchanged; add `attachmentQuality` and `attachmentParent` fields.
29. Keep weapon creation isolated from synchronization so no material or geometry allocates per frame.
30. Prove the full owned import graph contains no query-string identities after rewrite.

## Final Exact Implementation

### Inventory Layer

- `InventoryQuantityRules.js`: quantity, stack limit, and safe cost guards.
- `InventoryTransactionRules.js`: aggregate, clone, add, remove, purchase, and restore normalization.
- `InventoryStoreRules.js`: compatibility exports plus snapshots, stats, and pinning.
- `InventoryStore.js`: one-commit coordinator with `addMany`.
- `InventoryPersistenceRules.js`: normalized restore using the transaction layer.

### Corpse Layer

- `MinimalMeadowCorpseLootRules.js`: tokenized claim lifecycle and immutable receipt construction.
- `MinimalMeadowEnemyLoot.js`: dead-only interaction, atomic grant, final consumed state, existing events.

### Equipment Layer

- `MinimalMeadowAttachmentProfiles.js`: exact and normalized canonical/fallback alias profiles.
- `MinimalMeadowEquipmentNodes.js`: one-time model traversal and attachment diagnostics.
- `MinimalMeadowWeaponAttachment.js`: deterministic parent selection and transform application.
- `MinimalMeadowEquipmentRuntime.js`: authoritative equipment synchronization and GLB rebinding.
- `MinimalMeadowWeaponFactory.js`: retain real procedural geometry; rewrite only if a verified contract defect appears.

### Bag Layer

- `InventoryPanel.js`: no query-string import, stale selection cleanup, live state actions.
- `InventoryPanelView.js`: explicit details and expanded safe rendering helpers.

### Test Layer

- `inventoryTransactions.test.mjs`
- `minimalMeadowEnemyLoot.test.mjs`
- `minimalMeadowEquipmentRuntime.test.mjs`
- Existing `inventoryTorahTools.test.mjs`
- Existing launcher/world receipts remain read-only compatibility evidence.

## Verification Matrix

| Contract | Proof |
|---|---|
| One mutation publication | Listener counter assertions |
| Failed mutation rollback | Deep equality before/after |
| Duplicate restore aggregation | Persisted fixture assertion |
| Exactly-once corpse loot | Repeated and re-entrant interaction tests |
| GLB canonical compatibility | Exact bone/spine diagnostic assertions |
| Fallback model visibility | Root/fallback attachment assertions |
| Same weapon object reused | Identity assertions across draw/sheath |
| Garment synchronization | Jacket/kippah visibility assertions |
| No query identities | Reachable import scan |
| Tabs only | Leading-whitespace scan |
| Parseable JavaScript | `node --check` on every touched `.js` |
| Adjacent compatibility | Existing inventory/Torah tests |

## Planned Versus Actual Gate

After the first coding pass, reread every written file. Compare every item above against actual exports, call sites, tests, and observed results. Any delta becomes the second coding pass. No delta may be hidden inside the final report.
