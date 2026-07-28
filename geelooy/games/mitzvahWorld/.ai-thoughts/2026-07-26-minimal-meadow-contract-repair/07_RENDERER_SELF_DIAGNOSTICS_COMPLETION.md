B"H
Boruch Hashem
Blessed is He

# Renderer Self-Diagnostics Completion

The Awtsmoos renews every frame and every finite sign;
Awtsmoos.com now tells which vessel rendered, which stage arose, and why fallback crossed the line.

## Continuation mission

After the terrain import and material-role repair made Mitzvah World playable, the automated browser still reported `fallback-2d`. The continuation mission was to make that state self-explanatory in code, preserve the working fallback, and prove both fallback and accelerated rendering through the actual route.

## Production code completed

### Structured renderer errors

`RendererFallbackEvidence.js` now distinguishes:

- `webgl-unavailable`
- `renderer-construction-failed`

A missing WebGL context throws a coded `RendererContextError` carrying normalized attempted context names. Canvas fallback stores a frozen browser-safe receipt containing code, message, error name, attempted contexts, and recoverability.

### Canonical runtime evidence

`RendererRuntimeEvidence.js` publishes and clears:

- `awtsmoosRenderer`
- `awtsmoosRendererContextAttempts`
- `awtsmoosRendererFallback`
- `awtsmoosRendererFallbackMessage`
- `awtsmoosRendererFallbackRecoverable`
- `awtsmoosRendererStage`

A new boot clears stale evidence before the next runtime begins.

### Distinct renderer dimensions

The launcher now keeps three concepts separate:

1. Backend identity: `webgl` or `canvas-2d-fallback`.
2. Readiness stage: `hydrating`, `rich-ready`, `fallback-ready`, or `bootstrap-degraded`.
3. Hydration state: `loading`, `ready`, `fallback-2d`, or `degraded`.

No later readiness transition overwrites backend identity with the former ambiguous value `bootstrap`.

### Modular renderer state

Viewport, environment, and interactor mutations were moved into `ProgressiveWebGLState.js`. The final progressive renderer has 119 logical lines and remains focused on WebGL orchestration and hydration.

## New regression coverage

Added focused coverage for:

- coded WebGL-unavailable errors
- generic renderer-construction failures
- frozen Canvas2D fallback receipts
- runtime-start evidence clearing
- fallback dataset publication
- rich-renderer fallback-field clearing
- fallback readiness identity
- rich hydration convergence
- degraded hydration convergence

The final renderer/readiness verification passed:

- Tests: 12
- Passed: 12
- Failed: 0
- `git diff --check`: clean

Earlier combined terrain, mobile, renderer, and readiness gates also passed, culminating in 26 focused regressions with zero failures before the final structural-only rewrite.

## Live fallback browser proof

The GPU-disabled automation Chrome loaded:

`http://localhost:8080/games/mitzvahWorld/`

Observed state:

- Backend: `canvas-2d-fallback`
- Stage: `fallback-ready`
- Hydration: `fallback-2d`
- Attempted contexts: `webgl`
- Fallback code: `webgl-unavailable`
- Fallback message: `WebGL is not available.`
- Recoverable: `true`
- Gameplay: `true`
- Runtime: `playable`
- Readiness: `core-playable`
- Features: `combat-ready`
- UI: `ready`
- Mobile integration: `ready`
- Console errors: 0
- Uncaught exceptions: 0
- Failed requests: 0
- HTTP errors: 0

## Live accelerated browser proof

An isolated normal Chrome instance used the Mac display and GPU path.

Observed capability:

- WebGL 1 available
- WebGL 2 available
- Vertex shaders compiled
- Fragment shaders compiled
- Programs linked
- Renderer: ANGLE on Intel HD Graphics 6000

Observed runtime:

- Backend: `webgl`
- Stage: `rich-ready`
- Hydration: `ready`
- Fallback fields: empty
- Gameplay: `true`
- Runtime: `playable`
- Readiness: `core-playable`
- Features: `combat-ready`
- UI: `ready`
- Mobile integration: `ready`
- Console errors: 0
- Uncaught exceptions: 0
- Failed requests: 0
- HTTP errors: 0

Both live probes exited with code 0. Their JSON receipts and screenshots remain in this evidence folder.

## Complete experiment test universe

Every discovered `src/test/**/*.test.mjs` file was also executed:

- Test files discovered: 387
- Tests: 927
- Passed: 874
- Failed: 52
- Skipped: 1

The renderer and readiness tests passed inside that same process. The 52 broader failures are separately recorded because they belong to stale or unrelated contracts, including:

- legacy sixteen-layer terrain expectations
- missing historic texture-streaming and texture-repeat exports
- old road-material layer aliases
- multiplayer launcher attachment
- flat-world bootstrap assumptions
- botanical and village asset policies
- unrelated facade, CSS, inventory, market, and geometry contracts

The exact full transcript is `all-experiment-tests.tap`. The compact failure ledger is `all-experiment-tests-summary.json`. These failures were not silently attributed to this renderer repair and were not broadly patched into unrelated systems.

## Final structural and Git evidence

Verified on:

- Branch: `main`
- HEAD: `1d3d5eb56811`

All nineteen touched source and test files remain at or below 120 lines. The final scoped `git diff --check` is clean. Changes remain uncommitted and unpushed.

## Cleanup

The isolated diagnostic Chrome process was terminated by its unique profile path. Its private profile directory was deleted. The user's normal Chrome was never targeted.

## Planned versus actual delta

- Planned: expose the exact fallback cause. Completed.
- Planned: distinguish context absence from renderer construction failure. Completed.
- Planned: preserve playable Canvas2D fallback. Completed.
- Planned: separate backend, stage, and hydration fields. Completed.
- Planned: clear stale lifecycle evidence. Completed.
- Planned: prove fallback mode live. Completed.
- Planned: prove accelerated WebGL mode live. Completed.
- Planned: add regression coverage. Completed.
- Planned: keep every touched file within the modular ceiling. Completed.
- Discovered broader repository failures: recorded separately without unsafe scope expansion.
- Remaining work for the requested terrain-load and renderer-diagnostics cycle: empty.
