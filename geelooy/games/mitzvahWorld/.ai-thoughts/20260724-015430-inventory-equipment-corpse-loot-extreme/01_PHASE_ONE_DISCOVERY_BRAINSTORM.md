B"H

Boruch Hashem

Blessed is He

# Phase One — Discovery Brainstorm

The Awtsmoos is the source of every possible architecture and every bounded choice. In this first Chesed pass, possibilities are opened widely; Awtsmoos.com is named as the reminder that even a game inventory is a renewed relation among state, intention, visible form, and measured consequence.

## Complete Possibility Field

1. Replace ad hoc item mutation with immutable transaction plans.
2. Validate every quantity at the boundary: finite, integer, positive, and bounded.
3. Make single-item add delegate to multi-item add.
4. Make purchase one atomic remove-plus-add commit.
5. Publish exactly once per accepted mutation.
6. Publish zero times for rejected mutations.
7. Aggregate duplicate saved stacks before applying stack limits.
8. Remove equipment whose backing item vanished.
9. Preserve existing snapshot shape and listeners.
10. Give corpse loot a claim state: available, claiming, collected.
11. Mark claiming before inventory mutation to block re-entrancy.
12. Use one atomic `addMany` call for all corpse rewards.
13. Release a claim only if the inventory transaction never commits.
14. Mark a corpse collected before downstream notifications.
15. Clone receipts so profile arrays cannot be mutated by consumers.
16. Keep the corpse selected until explicit successful interaction, then clear target.
17. Add additive diagnostics for claim state and attachment choice.
18. Build an attachment profile catalog for canonical GLB and fallback models.
19. Resolve exact names first and normalized aliases second.
20. Support right hand, left hand, spine, model-root, and derived fallback anchors.
21. Never create a per-frame attachment node.
22. Keep one weapon object and reparent it.
23. Rebind after GLB hydration without losing equip state.
24. Support right-hand and left/offhand requests through a stable attachment side.
25. Default hand weapons to right hand and holster to spine.
26. Fall back to model root only as a visible last resort, never silent invisibility.
27. Preserve transforms per weapon kind and attachment mode.
28. Expose actual parent name and fallback quality in diagnostics.
29. Remove query strings from connected owned imports.
30. Keep procedural geometry creation bounded to equipment replacement, not synchronization frames.
31. Keep garment visibility driven solely by equipment state.
32. Keep coat and kippah meshes reversible across repeated equip/unequip.
33. Keep top-hat fallback behavior legible when kippah is absent.
34. Make Bag actions operate on live store state, not stale selected objects.
35. Clear a selected item if its stack disappears.
36. Explain equip, unequip, draw, sheath, use/open, pin, and drop in the detail surface.
37. Keep empty slots understandable and focusable behavior deliberate.
38. Add keyboard activation parity where browser buttons already provide it.
39. Add unit tests for invalid quantities, overflow, duplicate restore, atomic buy, and listener counts.
40. Add corpse tests for dead-only, exactly-once, re-entrancy, transaction failure, receipt cloning, and events.
41. Add equipment tests for canonical bones, fallback hands, root fallback, rebind, draw/sheath, garment visibility, and destroy.
42. Run existing inventory/Torah tests to protect adjacent contracts.
43. Run `node --check` on every touched JavaScript file.
44. Parse every new test through Node.
45. Trace all imports and prove no owned connected import uses `?v=`.
46. Verify leading indentation contains tabs, not spaces.
47. Read and hash every touched file after writing.
48. Inspect Git diff only for owned files and planning artifacts.
49. Keep external browser/test artifacts under `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld`.
50. Produce a worker handoff with root causes, contracts, tests, hashes, and exclusions.

## Failure Constellation

- A negative quantity can turn removal into addition.
- A fractional purchase can create inconsistent price and stack behavior.
- A purchase can charge coins and then fail to add the item.
- Two listener publications can trigger duplicate saves or renders.
- Duplicate saved stacks can lose quantity because the later stack overwrites the former.
- A corpse event listener can re-enter before `looted` becomes true.
- A later loot stack can throw after earlier stacks already committed.
- A canonical GLB naming variation can make the weapon disappear.
- A fallback model can expose `right-hand` but not `mixamorig:RightHand`.
- A missing spine can hide sheathed equipment.
- GLB replacement can leave the old parent holding stale children.
- A selected Bag item can disappear after drop while menus remain stale.
- Query-string imports can instantiate duplicate connected modules.
- A test can pass the happy path while listener counts, rollback, and re-entry remain broken.

## Five Competing Architectures

### A — Minimal Guards

Add quantity checks and more bone aliases in existing functions. Lowest diff, but atomicity and re-entry remain weak.

### B — Clone-and-Commit Pure Rules

Use pure rules to build a complete next inventory state, then commit once in `InventoryStore`. Strong testability and compatibility.

### C — Command Bus Transactions

Represent every mutation as a command and reducer. Powerful, but too invasive for a parallel worker boundary.

### D — Event-Sourced Inventory

Persist an append-only item/equipment event ledger. Excellent auditability, excessive scope and persistence migration risk.

### E — Stateful Domain Aggregate

Move all rules into a large aggregate class. Centralizes invariants but risks a monolith and makes focused rule tests harder.

## Chosen Direction

Architecture B wins. It reveals Chesed as proposed additions, Gevurah as validation and capacity, Tiferes as one coherent next state, Yesod as one listener publication, and Malchus as the visible Bag, garment, weapon, and loot result.
