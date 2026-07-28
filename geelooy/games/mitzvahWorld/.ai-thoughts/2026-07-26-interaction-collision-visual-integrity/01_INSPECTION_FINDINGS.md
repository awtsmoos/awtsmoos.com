B"H

# Inspection Findings

## Enemy selection and combat

`WorldTargetPopulationAdapter` spreads class instances into plain objects. Enemy actors therefore lose prototype methods including `target`, `clear`, and `payload`. This directly explains all three DevTools failures during pointer selection and combat casting.

## Terrain repetition

The previous density increase made the same source image cover fewer world units, increasing repetition. The terrain shader also samples the source at fixed repeated macro and micro scales. Full-resolution appearance requires broader world coverage and lower-weight detail sampling, not more repeats.

## House wall flicker

House meshes correctly receive per-role sidedness and culling flags. Static batch signatures include sidedness, but `RenderMaterialState` does not. It can skip the state transition between front-sided and double-sided draws, allowing GL culling state to bleed between adjacent materials.

## Vegetation grounding

Each clump is initially sampled against terrain correctly. The update loop then rotates the entire vegetation cell around X and Z, lifting distant blades and flowers away from their sampled ground points. The cell root must remain level.

## Tree bark

Generated branch winding is not reliable enough for a one-sided bark surface. Bark must explicitly disable backface culling while retaining depth writes and generated normals.

## Stairs

The visual stair boxes are inserted into the octree, but a capsule may still collide with riser faces before step-up resolves. A separate invisible continuous walkable ramp collider should accompany the visible steps.

## Equipped staff

The equipment system does rebind after canonical model hydration, but it trusts arbitrary imported hand hierarchies. The procedural staff can be parented inside a hidden or badly transformed bone. A dedicated model-root weapon anchor is required for guaranteed visible placement, plus per-frame ownership repair.
