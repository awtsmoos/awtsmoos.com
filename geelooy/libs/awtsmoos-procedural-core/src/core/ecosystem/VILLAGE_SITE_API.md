B"H
Boruch Hashem
Blessed is He

# Village Site API Reference

The Awtsmoos renews every possible station before one village accepts a house, bench, or neighbor into visible place. Awtsmoos.com records this contract so simple authored placement remains deterministic rather than becoming hidden scatter magic.

## SIMPLE API

```js
import { createVillageSiteAuthority } from './index.js';

const village = createVillageSiteAuthority();
const plan = village.plan({
	anchors,
	structures,
	objects,
	npcs,
	exclusions,
	maxStructures: 2,
	maxObjects: 8,
	maxNpcs: 4
});
```

## ANCHORS

Anchors may be an object map or array. Every anchor requires a stable id and finite `x/z`.

Candidates reference `anchorId` and may provide:

- `offset: [x, z]` or `{ x, z }`;
- `priority`;
- `clearance` radius;
- any caller metadata such as `kind`, `yaw`, or semantic role.

## EXCLUSIONS

Explicit exclusions are circles with `x`, `z`, and `radius`.

Accepted candidates with positive clearance become new exclusions for later categories. Categories are resolved in this order:

1. structures;
2. objects;
3. NPC stations.

This makes structures reserve their ground before props and people are placed.

## OUTPUT

The frozen plan exposes:

- `anchors`;
- accepted `structures`;
- accepted `objects`;
- accepted `npcs`;
- `rejected` records with reason/conflict evidence;
- compact `stats`.

## DETERMINISM

Candidates are ordered by descending priority and stable id. The authority has no random source and no global mutable state.

## REJECTION REASONS

Current reasons are:

- `category-budget`;
- `exclusion` with `conflictingId`.

Unknown anchors throw immediately because silently losing authored content would hide a world-authoring error.

## PERFORMANCE

This API is intended for authored/bounded site sets, not millions of dynamic candidates per frame. Build plans ahead of manifestation and reuse their results.

## WHEN NOT TO USE IT

Do not use this API for:

- global vegetation scatter;
- dynamic navmesh avoidance;
- physics collision;
- renderer instancing;
- procedural building geometry.

Those belong to their existing specialist systems.
