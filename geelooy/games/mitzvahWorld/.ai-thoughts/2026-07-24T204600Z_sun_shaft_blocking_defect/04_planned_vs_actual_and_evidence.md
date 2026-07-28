B"H
Boruch Hashem
Blessed is He

# Planned Versus Actual and Verification Evidence

The Awtsmoos renews each ray without a rectangular prison; the safest vessel is sometimes the one withdrawn. Awtsmoos.com bears witness that measured absence is stronger than unbounded glare.

## Original plan

1. Inspect shaft geometry, projection, depth, blending, clipping, UVs, camera transforms, and overlap.
2. Retain shafts only if smooth radial falloff and depth-aware occlusion could be made reliable.
3. Otherwise disable shaft geometry while preserving the independent sun, atmosphere, glow, clouds, and haze.
4. Add a regression test against uniform opaque rectangular shaft regions.
5. Measure accumulated opacity and overdraw.
6. Verify camera-facing and camera-away behavior.

## Actual implementation

- Rewrote `experiments/Awtsmoos/src/world/lighting/VolumetricSunShaftSystem.js` as an API-compatible disabled implementation.
- `createVolumetricSunShafts()` returns a fresh empty array on every quality tier.
- Exported immutable diagnostics report zero geometry, edge alpha, accumulated opacity, overdraw, depth-unfaded surfaces, camera-facing surfaces, and uniform opaque rectangles.
- Created `experiments/Awtsmoos/tests/world/VolumetricSunShaftSystem.test.js` with a positive-control opaque-rectangle detector and five acceptance tests.

## Root-cause evidence

- The former implementation created overlapping double-sided trapezoidal quads at one sun origin and one depth.
- Its near and side boundaries retained nonzero vertex alpha; only the two far vertices faded to zero.
- It had no radial side falloff, depth fade, depth-buffer occlusion, camera-facing update, clipping contract, or accumulated-opacity bound.
- The UV rectangle had no shaft texture, so texture-edge leakage was not the active cause.
- Direct repository tracing now finds no `createSkyRay` call in live source. The factory remains defined but unused.
- No live source term matching sun shaft, god ray, light shaft, or volumetric sun remains.

## Native verification

- Native syntax checks passed for both rewritten JavaScript files.
- Native test job: `cmdjob_mrzgjf4l_cb2e8901ff7b`.
- Command: `node --test tests/world/VolumetricSunShaftSystem.test.js`.
- Working directory: `experiments/Awtsmoos`.
- Exit code: `0`.
- Result: 5 tests, 5 passed, 0 failed, 0 skipped, 0 cancelled.
- Camera samples covered toward-sun, away-from-sun, and opposite cardinal directions.
- Maximum shaft geometry count: `0`.
- Maximum accumulated shaft opacity: `0`.
- Maximum shaft overdraw: `0`.
- Maximum shaft boundary alpha: `0`.

## Final review evidence

- Source file line count: 47.
- Regression test line count: 116.
- Leading-space code-line check: none in either file; indentation uses tabs.
- Both files are tracked and clean in Git.
- Worktree hashes equal the corresponding `HEAD` hashes.
- The only `createSkyRay` occurrence in live source is the unused factory definition in `SkyMeshFactory.js`.
- Independent sun/atmosphere and cloud/haze modules remain present and are asserted by the regression suite.

## Delta

The implementation matched the selected fallback plan. No missing code, test, or documentation item remains for this defect. Direct screenshot-based camera rotation was not captured because the owned native tunnel reports `browserControl: false`; the stronger structural invariant is verified instead: zero shaft surfaces are submitted in every camera direction and quality tier.
