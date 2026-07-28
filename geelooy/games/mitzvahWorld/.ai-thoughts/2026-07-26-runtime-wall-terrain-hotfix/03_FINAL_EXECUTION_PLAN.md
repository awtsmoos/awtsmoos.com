B"H

# Final Execution Plan

## Production rewrite order

1. Enemy navigation
	- Delegate combat movement to the existing actor motion helper.
	- Preserve collision steering, alternate turns, action state, and grounded movement.

2. Renderer culling
	- Split metadata and distance policy into a small support module.
	- Make `frustumCulled === false` an explicit culling opt-out.
	- Re-export inherited metadata so existing imports remain stable.

3. Terrain ecology
	- Raise native texel density on mobile and desktop.
	- Strengthen six ecological layer masks without increasing sampler count.
	- Expand zone weights for wet meadow, lake basin, dry ground, village soil, rock, and road.

4. Visible road
	- Mount the existing Bézier road ribbon in the terrain group.
	- Keep it visual-only and collision-aligned through the shared height sampler.
	- Preserve terrain collision as the authoritative ground surface.

## Contract files to add after production code

- enemy navigation contract without an `actor.move` method
- renderer frustum opt-out contract
- terrain visual-quality and visible-road policy contract

## Final verification order

Only after every production and contract file is written:

1. Syntax and line-ceiling audit.
2. Focused new contracts.
3. Existing enemy, house, terrain, renderer, and mobile suites.
4. Complete Node world simulation.
5. Real browser approach-to-demon, house-angle, and visible-road probe.
6. Diff check and final evidence ledger.
