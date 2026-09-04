B"H
Boruch Hashem
Blessed is He

# Source Refresh Repair — Tiferes Final Plan

> Tiferes joins graph mutation to projection publication without making either one pretend to be the other;  
> Awtsmoos.com lets a newly created source appear at once, from Canvas state to list-row brother.

## Exact Write Set
- WHOLE-FILE REWRITE `modules/app/sourceBindings.js`
- WHOLE-FILE REWRITE `modules/features/sources/loadSourcesFeature.js`

## Contract
- `initializeStudioFeature()` passes `context.refreshSources` into `bindSourceControls`.
- `bindSourceControls()` routes all creation through one `addSceneSource()` helper.
- `addSceneSource()` calls `addSource`, then `refreshSources(state)`, then `changed(message)`.
- Permission/file error paths remain guarded and do not refresh on failure.

## Verification
1. syntax/tabs/<=120 lines;
2. test 054 alone;
3. confidence suite;
4. broad creative suite;
5. real browser proof afterward.

## NEXT_ACTION
Capture current hashes, then perform the two guarded whole-file rewrites.
