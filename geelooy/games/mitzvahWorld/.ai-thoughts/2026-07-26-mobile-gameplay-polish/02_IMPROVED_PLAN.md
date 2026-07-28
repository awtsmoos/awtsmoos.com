B"H
Boruch Hashem
Blessed is He

# Phase Two — Improved Architecture Plan

The first brainstorm correctly found seven visible failures, but the repair must avoid another monolith. The Awtsmoos reveals that every feature needs a small authority module, a rendering vessel, and a direct regression.

## Improvements over the first pass

1. Do not scatter equipment slot strings; create one canonical `InventoryEquipmentSlots.js` record with IDs, labels, and order.
2. Do not infer facing in UI code; create a pure `retainedTravelFacing()` helper and test zero-input release directly.
3. Do not merely increase demon RGB; publish a readability policy with minimum luminance and matching diagnostics.
4. Do not enlarge the 118-line parchment; split presentation markup and CSS into separate modules.
5. Do not mutate immutable profile loot; create actor-owned remaining-loot state with pure normalization and take operations.
6. Do not let the UI reach into inventory internals; expose actor methods for preview, take-one, and take-all.
7. Do not hide a corpse until remaining loot is empty.
8. Do not auto-loot on second click; emit `enemy:loot-open` and keep selection.
9. Mount one loot panel alongside the enemy population, not one panel per corpse.
10. Keep Take and Loot All transactions atomic through the existing InventoryStore.
11. Preserve the existing `enemy:looted` event only when all loot has been taken.
12. Emit `enemy:loot-updated` after each individual take.
13. Add item definitions/icons to the loot presentation from the canonical inventory catalog.
14. Keep every button at least 44px for mobile.
15. Ensure the loot panel is a real modal that blocks world input while open.
16. Equip tefillin by default because the starter inventory already owns it.
17. Render every authoritative equipment slot, including shirt, pants, eyes, kippah, and both tefillin.
18. Make the equipped weapon drawn by default and provide a visible model-root fallback transform.
19. Keep keyboard and camera facing laws unchanged; only retain the last nonzero travel yaw.
20. Make house surfaces double-sided at the material contract rather than duplicating geometry.
21. Change the Shlichus target from three to five distinct demons while retaining uniqueness law.
22. Present five face pips with defeated/remaining states and a numeric percentage.
23. Add a richer narrative with setting, danger, purpose, and promised reward.
24. Use dedicated quest CSS rather than appending more rules to the existing 463-line global stylesheet.
25. Add a teaching preference authority with `side` and `book-only` modes.
26. Persist teaching preference in localStorage where available.
27. Expose a compact tracker button to move teaching into the book.
28. Keep book content available regardless of side-panel preference.
29. Verify all new modules under 120 lines.
30. Re-run Node, focused tests, mobile viewport browser, and WebGL after all changes.

## Dependency graph

`InventoryEquipmentSlots` → Bag view and slot tests

`TravelFacingPolicy` → movement controller and movement tests

`DemonReadabilityPolicy` → demon material and readability tests

`QuestPresentation` + `QuestParchmentStyles` → parchment/tracker

`CorpseLootState` → enemy actor → enemy lifecycle → loot panel

`TeachingPlacementPreference` → learning side panel / book behavior
