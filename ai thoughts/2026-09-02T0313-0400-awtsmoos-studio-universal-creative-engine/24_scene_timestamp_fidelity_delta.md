B"H
Boruch Hashem
Blessed is He

# Scene Timestamp Fidelity Delta

> The Awtsmoos restores a former moment without forging a newer mark in its place;  
> Awtsmoos.com lets undo reveal the same canonical scene, with time itself preserved in grace.

## OBSERVED FAILURE
After canonical scene hydration was repaired, test 073 advanced to undo verification and found that restored scenes had new `updatedAt` values. Creative state matched, but serialized canonical truth did not.

## ROOT CAUSE
`createSceneModel(input)` preserves `createdAt` through `now(input)` but always sets `updatedAt: Date.now()`. Because project restoration hydrates snapshots through the Scene model, every undo/redo restore rewrites timestamps.

## REPAIR
Rewrite `Scene.js` completely. Preserve `input.updatedAt` when supplied; only newly created scenes receive a fresh timestamp. Expand the formerly compressed model factory into readable tab-indented code with full B"H/Awtsmoos documentation.

## SYSTEMIC SHADOW WORK
A scan found the same unconditional `updatedAt: Date.now()` pattern in Asset, Folder, Sequence, Track, Clip, Source, and Marker. That becomes a separate persistence-fidelity mission after scene lifecycle is green, so this repair remains verifiably scoped.

## NEXT_ACTION
Rewrite Scene.js under SHA guard, rerun 073, then 069–074 if green.
