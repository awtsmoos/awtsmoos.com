B"H

# Level 1 wide moving platform plan

The render error is gone, so the next correction is visual/physics agreement: make `first_moving_lava_lab` actually wide and deep in level data without using transform scale that can reintroduce NaN.

## Exact target

- Level: `levels/ladder/data/ladder-1.json`
- Entity: `nivrayim.MovingPlatform[0]`, name `first_moving_lava_lab`
- Desired dimensions: width 5, height 1, depth 7
- Keep `scale` explicitly `{ x: 1, y: 1, z: 1 }`
- Keep `size` and `dimensions` synchronized with width/height/depth
- Physics remains safe because `MovingPlatform.js` now builds finite `BoxGeometry(width,height,depth)` and dynamic `halfExtents = size / 2` instead of world scale.

## Verification

1. Rewrite the whole JSON file, not a partial patch.
2. Parse JSON with Node.
3. Confirm the platform reports dimensions `{x:5,y:1,z:7}`, unit scale, and finite half extents `{x:2.5,y:0.5,z:3.5}`.
