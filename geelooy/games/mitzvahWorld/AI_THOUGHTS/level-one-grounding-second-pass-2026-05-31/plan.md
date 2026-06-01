B"H

# Level One Grounding Second Pass

## What the user showed now

- Props are still visually floating or split from the perceived ground plane.
- The world became choppier after adding many decorative props.
- The route is taking the user into first level unexpectedly, likely because the village gate points at `ladder-1.json` and/or default path handling skips/nulls back into challenge path.
- Console no longer shows the previous worker fatal `document`/`dispose` storm, so first-pass crash fix likely landed.

## New plan

1. Keep all modified files complete rewrites only.
2. Inspect route boot/path resolver so default loading does not force level 1 if no path is chosen.
3. Inspect level loader and `village.json` transition data for `next`/`destination` values.
4. Replace heavy/overcrowded level-1 layout with a lighter grounded layout: fewer massive props, a reliable green terrain, a low path, minimal small props.
5. Fix grounding by using terrain ground `y=0` as the visual top for village props instead of `-0.2` guess where practical.
6. If route default must be village, set village as default or make gate manual-only stable.
7. Verify JSON, syntax, live served files.

## Design decision

The fastest grounded repair is to make level 1 not a full village clone. It should be a light playable garden challenge with a few flat, grounded objects. The big anchor tree appears too huge for mobile and causes choppiness plus camera clipping. Remove it from ladder-1. Leave full decorative village to `village.json` later after grounding recipes are corrected globally.

## Chapter 3 seed

The Awtsmoos reveals that beauty without scale becomes a mountain on the player’s chest. The tree was not evil; it was too enormous for the breath of the phone. The tikkun is not more thunder. It is measure.
