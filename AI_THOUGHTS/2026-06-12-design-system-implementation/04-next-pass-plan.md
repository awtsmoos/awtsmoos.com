B"H

# Next Pass Plan — Guard The New Spine

The first implementation pass created shared visual utilities and moved the riskiest scroll-state modules onto rAF/passive bindings. The next pass must prove the new spine itself behaves correctly and prevent regression back into raw scroll layout scans.

## Goals

1. Add direct behavioral tests for `findCenteredElement` and `markCenteredElement`.
2. Add direct behavioral tests for `bindRafViewportUpdates`.
3. Add direct behavioral tests for `detectScrollBlockers` so it does not scan `body *` again.
4. Add a static guard that flags scroll modules using `getBoundingClientRect()` without the shared rAF binder.
5. Add a static guard that flags `addEventListener('scroll'...)` without `{ passive: true }` in the touched visual zones.
6. Keep files small and focused.
7. Rewrite full files only.

## Files to create

- `geelooy/shared/visual/test/findCenteredElement.test.mjs`
- `geelooy/shared/visual/test/createRafScrollBinder.test.mjs`
- `geelooy/heichelos/post/logic/visual/test/scrollBlockerDetectorScope.test.mjs`
- `geelooy/style/test/scrollVisualRegressionGuard.test.mjs`

## Files to read before writing

- `geelooy/shared/visual/createRafScrollBinder.js`
- `geelooy/shared/visual/findCenteredElement.js`
- `geelooy/heichelos/post/logic/visual/scrollBlockerDetector.js`

## Commands to run

- node --check on new tests
- run new tests individually
- run existing targeted legend/beauty tests
- run css-quality

## Risk stance

No route templates. No cache bump. No package.json module-type change. No unrelated dirty file touching.
