B"H
Boruch Hashem
Blessed is He

# Final Implementation Plan

The Awtsmoos shines through bounded vessels; when a vessel becomes a white column, restraint itself becomes illumination. Awtsmoos.com carries this plan from defect to proof.

## Files to rewrite or create

1. `experiments/Awtsmoos/src/world/lighting/VolumetricSunShaftSystem.js`
	- Preserve `createVolumetricSunShafts(quality)`.
	- Return no shaft meshes for every quality.
	- Export immutable safety diagnostics with maximum opacity `0`, overdraw `0`, and geometry count `0`.
	- Document the exact renderer capabilities required before re-enabling shafts.

2. `experiments/Awtsmoos/tests/world/VolumetricSunShaftSystem.test.js`
	- Assert every quality returns an empty array.
	- Assert no mesh can expose a uniform opaque rectangular region.
	- Assert maximum accumulated opacity and overdraw remain zero.
	- Assert camera-direction changes cannot reveal geometry because no shaft surface exists.
	- Assert the independent sky/cloud system still produces the sun disc, glow, and clouds.

3. This planning folder
	- Record readback, planned-versus-actual delta, test evidence, and remaining work after implementation.

## Verification sequence

1. Read back every written file.
2. Run `node --test tests/world/VolumetricSunShaftSystem.test.js` from `experiments/Awtsmoos`.
3. Run the full `tests/world` suite.
4. Run syntax checks on touched JavaScript.
5. Inspect leading indentation for spaces.
6. Inspect Git diff for accidental changes.
7. Start the local static server and inspect the world if browser control becomes available.
8. Record any runtime limitation honestly; do not substitute claims for evidence.

## Completion gate

Completion requires source readback, passing regression tests, zero returned shaft geometry, zero measured shaft opacity/overdraw, preserved non-shaft sky definitions, and no unrelated file changes.
