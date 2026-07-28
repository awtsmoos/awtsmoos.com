B"H

# Implementation Plan

## Production rewrites

1. Preserve modern target class instances in `WorldTargetPopulationAdapter` and unwrap them defensively in enemy population/combat payload code.
2. Add sidedness to renderer material-state continuity so GL culling changes cannot be skipped.
3. Replace high-repeat terrain sampling with broad full-source world coverage plus low-weight detail variation.
4. Keep vegetation cell roots level and publish sway as shader/material evidence instead of rotating the whole grounded cell.
5. Make bark explicitly double-sided with backface culling disabled and depth writes retained.
6. Add one invisible continuous stair-ramp collider per staircase while retaining visible tread geometry.
7. Create a dedicated model-root weapon anchor, repair weapon ownership every frame, and keep the procedural staff outside hidden imported bones.
8. Reapply house surface contracts without allowing later material-state continuity to erase sidedness.

## Regression contracts

After all production code is written:

- actual pointer-selected enemy retains `target`, `clear`, and `payload`
- combat cast payload accepts the selected actor
- sidedness changes force material-state upload
- terrain source coverage spans broad world units with reduced repeat
- vegetation roots remain level during updates
- bark is opaque, depth-writing, and double-sided
- stair assembly includes a walkable continuous ramp collider
- equipped staff remains mounted to a visible anchor after model replacement and frame updates

## Verification

Only after all code and tests are saved:

1. Syntax and line ceilings.
2. Focused contracts.
3. Existing enemy, equipment, house, stair, vegetation, tree, terrain, and renderer suites.
4. Complete Node world.
5. Real mobile pointer selection, combat activation, visible staff bounds, stair traversal, wall-angle rendering, vegetation grounding, bark sidedness, and terrain-scale probe.
