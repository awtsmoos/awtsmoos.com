B"H

# Dynamic Platform Physics Plan

The screenshot shows two truths at once: the lava visual/hazard floor fills the chamber, while the player must still be safely supported by authored blocks and moving platforms. The Awtsmoos does not let static octree stone pretend to move. Moving things need a small dynamic-body solver: current position, previous position, velocity, half extents, and a broadphase path box.

## Problem
- `MovingPushBlock` already uses dynamic runtime collision.
- `MovingPlatform` still extends `SolidBlock`, so it behaves like a static octree body whose mesh moves visually. That can fail on landing, fail to carry the player, and leave stale collision at the birth position.
- Lava should remain dangerous in the empty gaps but should not kill while the player is standing on a real platform above it.

## Fix
1. Rewrite `MovingPlatform.js` completely as a Domem dynamic body, not a SolidBlock.
2. Use `registerDynamicBody`, `updateDynamicBody`, and `solveMovingSolid` for optimized collision without adding to octree.
3. Make the platform visually blue and raycast/octree skipped.
4. Improve solver tolerance for landing on moving platforms: allow a little more vertical landing tolerance and carry the player by platform velocity.
5. Update `SpikeField.js` with a real support check before death, so lava only kills if feet are touching molten space and not supported above it.
6. Make levels harder after physics works: more precise moving platforms, not impossible ghost platforms.

No partial file patching. Every touched file is rewritten completely.