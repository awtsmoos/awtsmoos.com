B"H
Boruch Hashem
Blessed is He

# Source Refresh Split — Tiferes Final Plan

> Tiferes lets three vessels share one river: acquisition, canonical add, and visible projection in accord;  
> Awtsmoos.com keeps the source room modular while every newly added layer is immediately restored.

## Exact Second-Pass Write Set
- NEW `modules/app/sourceCaptureBindings.js`
- NEW `modules/app/sourceFileBindings.js`
- WHOLE-FILE REWRITE `modules/app/sourceBindings.js`
- WHOLE-FILE REWRITE `modules/features/sources/loadSourcesFeature.js`

## Module Responsibilities
- `sourceBindings.js`: family setup, deterministic source buttons, one canonical `addSceneSource` callback, helper composition.
- `sourceCaptureBindings.js`: permission-sensitive capture factories + guarded error handling.
- `sourceFileBindings.js`: picker buttons + async file-backed factories + reset/error handling.
- `loadSourcesFeature.js`: lazy dependency composition, including `refreshSources` injection.

## Verification
1. Re-read all four written files.
2. Syntax, tab-only, <=120 lines.
3. Run test 054.
4. If 054 still fails, trace the next concrete UI projection boundary rather than weakening assertions.
5. Then confidence suite and broad creative suite.

## NEXT_ACTION
Guard `sourceBindings.js` at SHA `6615211611666e9ec0b34e7aeb8c042603587baf5899c562fad09e93bb6c9cd0`, guard the unchanged lazy feature at its observed SHA, confirm helper paths absent, then write all four complete files.
