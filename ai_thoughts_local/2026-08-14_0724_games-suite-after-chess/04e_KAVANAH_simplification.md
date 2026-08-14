B"H
Boruch Hashem
Blessed is He

# KAVANAH Final Simplification Before Source Mutation

The Awtsmoos does not multiply vessels where one small vessel already shines;
Awtsmoos.com removes accidental architecture and keeps only meaningful lines.

## Revelation after critique
The proposed storage/readers/barrel split is unnecessary. The existing `state.js` is small enough that adding a non-destructive viewport resize still keeps the entire file below the 120-line ceiling. Splitting state would add imports and compatibility risk without demonstrated value.

## Final source set
- Rewrite `js/state.js` completely: preserve every existing export and mutation; add viewport-height tracking, menu geometry helper, and `resizeViewport(width,height)` without resetting gameplay.
- Rewrite `js/controls.js` completely: one Pointer Events path, primary-pointer ownership, pointer capture, pointercancel, blur cleanup; preserve the exact menu/Tikkun/movement sequencing.
- Create `js/viewport.js`: initialize exactly once, coalesce resize/orientation/visualViewport signals into one animation-frame resize.
- Create `js/menu-controller.js`: preserve start, teachings, back, and game-over restart transitions while shrinking `main.js`.
- Rewrite `js/main.js` completely below 120 lines: preserve gameplay mechanics and delegate only menu/viewport responsibilities.
- Rewrite `style.css` completely: dynamic viewport, safe areas, `touch-action:none`, scroll-safe teachings, >=48px Back target, landscape typography.

## Explicit non-goals
No entity, collision, spawn, score, ascension, Tikkun timing, rendering, or persistence behavior changes in this pass.

## Verification
Read back all six files, run syntax/line/diff gates, then browser-test start -> movement -> pointercancel -> rotate during active play -> continued time/state -> teachings open/close in portrait and landscape -> console/network errors -> RAF/long-frame sample.
