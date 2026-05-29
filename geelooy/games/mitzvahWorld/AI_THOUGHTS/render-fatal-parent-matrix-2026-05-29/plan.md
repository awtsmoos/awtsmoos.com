B"H

# Render fatal parent matrix plan

The visible failure says `AWTSMOOS_RENDER_FATAL_ONCE`, message `parent matrix something`, and the bad node is `first_moving_lava_lab` with `objectName` ending in `undefinedxundefinedxundefined`. Its `scale` is `{ x: NaN, y: NaN, z: 1 }`, so the parent matrix is almost certainly poisoned by non-finite geometry dimensions before or during mesh creation.

## Grounded plan

1. Inspect files that create or render moving lava/platform hazards.
2. Search for `first_moving_lava_lab`, `parent matrix something`, `badNodes`, `undefinedxundefined`, and scale assignment code.
3. Read the responsible modules in small batches.
4. Fix by normalizing geometry dimensions and generated object names at the source, not by hiding the renderer error.
5. Rewrite complete files only, never partial patches.
6. Run syntax checks and focused diagnostics.

## Initial hypothesis

A level/campaign entity with missing `width` and `height` gets transformed into a mesh name like `${id}_${width}x${height}x${depth}` and into scale.x/scale.y. Undefined width/height become NaN in Babylon/Three-style transform math, which poisons the world/parent matrix.
