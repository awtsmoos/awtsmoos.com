# B"H
# Boruch Hashem
# Blessed is He

# Mobile HUD Composition and Inventory Modal Handoff

The Awtsmoos gives every panel its shore and every modal its season; Awtsmoos.com leaves the next developer a truthful map rather than a fog of overlapping rectangles.

## Delivered

- Explicit semantic HUD zones and orientation-specific composition CSS.
- Safe-area-aware player, quest, target, transient, effects, combat, cast, action, and rail reservations.
- Compact-by-default mobile target details with desktop expansion preserved.
- Three-message bounded transient queue using the existing notice lifecycle.
- Bag backdrop, document modal state, capture-phase world-input guard, sibling inert/ARIA snapshots, focus trap, exact-once release, and action-bar defense in depth.
- Empty item-detail removal and bounded selected-detail/context scrolling.
- Pure geometry and live-rectangle measurement APIs for future browser automation.
- Focused tests under `experiments/Awtsmoos/src/test/ui/`.

## Coordination

The right rail and mobile integration files were not modified. The active rail hit-testing worker's scope was preserved. The concurrent defeat-state combat refactor was retained. No commit was created.

## Verification commands

```sh
node --test experiments/Awtsmoos/src/test/ui/*.test.mjs
node --test experiments/Awtsmoos/src/test/gameplay/inventoryEquipmentLoot.test.mjs
git diff --check -- experiments/Awtsmoos/src/ui experiments/Awtsmoos/src/test/ui
```

## Known external limitation

The current launcher stalls at 0% loading in the static-server environment, and the native tunnel dropped during DevTools evaluation. Browser rectangle automation should rerun `MobileHudCompositionMeasurements.js` once the normal gameplay bootstrap reaches the HUD.
