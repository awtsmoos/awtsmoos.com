B"H
Boruch Hashem
Blessed is He

# Canonical Model Time — Tiferes Final Plan

> Tiferes makes one temporal law flow through every project model, from marker spark to sequence sea;  
> Awtsmoos.com keeps persisted time stable while touch still marks the living changes that come to be.

## Exact Write Set
- WHOLE REWRITE `modules/project/ids.js`
- WHOLE REWRITE `Scene.js`, `Asset.js`, `Folder.js`, `Sequence.js`, `Track.js`, `Clip.js`, `Source.js`, `Marker.js`
- NEW `tests/078_model_timestamp_fidelity_smoke.mjs`

## Shared Contract
- `createdTimestamp(input) => input.createdAt ?? Date.now()`
- `updatedTimestamp(input) => input.updatedAt ?? Date.now()`
- `now(input)` delegates to `createdTimestamp` for compatibility.
- `touch(model)` always writes a fresh `Date.now()`.
- Every model factory consumes both helpers rather than inventing its own temporal rule.

## Verification
1. Live SHA guards for all nine existing files + absent 078.
2. Full reread/syntax/tabs/<=120.
3. Run 078, 077, 011, 027, 028, 030, 071, 073, 075.
4. Re-run broad suite after the separate 032 portability repair.

## NEXT_ACTION
Apply the guarded family rewrite with no nested-model semantic expansion, then verify temporal fidelity before considering ProjectNormalization hydration improvements.
