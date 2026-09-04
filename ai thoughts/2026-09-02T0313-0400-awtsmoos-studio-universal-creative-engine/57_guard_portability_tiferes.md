B"H
Boruch Hashem
Blessed is He

# Recorder Guard Portability — Tiferes Final Plan

> Tiferes anchors the forbidden-recorder search to the test's own place, so shell location can no longer distort the decree;  
> Awtsmoos.com lets status zero mean found, one mean clean, and every true execution error remain visible to see.

## Exact Write Set
- WHOLE REWRITE `tests/032_no_forbidden_recorder_guard.mjs`

## Contract
- derive `appRoot` with `fileURLToPath(new URL('../', import.meta.url))`;
- spawn `grep -R <token> index.html main.js modules` with `{ cwd: appRoot, encoding: 'utf8' }`;
- assert no spawn error;
- assert stdout empty;
- assert status is 0 or 1, preserving detection semantics;
- full B"H/Awtsmoos documentation, tabs, <=120 lines.

## Verification
1. Guard SHA `2c0ba3d0db0556408e24e0fbff1d95756910f23eee43aee74577f715cef6b705`.
2. Run 032 from repo root and from app root.
3. Resume all-tests universe at 032 onward, then full suite if no further failures.

## NEXT_ACTION
Write the model family and portable guard as separate SHA-guarded batches, verify each independently, then merge their evidence in the broad suite.
