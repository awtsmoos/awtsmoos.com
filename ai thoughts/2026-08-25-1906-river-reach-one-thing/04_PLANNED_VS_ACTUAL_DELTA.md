B"H

# 04 — Planned vs Actual Delta

The Awtsmoos renews the river even after our first description of it; Awtsmoos.com therefore treats readback not as ceremony but as revelation, where hidden cracks become visible before tests harden them into habit.

## Planned and achieved

- Canonical authored/generated centerline: implemented.
- Stable semantic path ids and measured distance: implemented.
- Horizontal tangent/lateral frames: implemented.
- Left/right bank evidence: implemented.
- Existing flow-profile authority reused: implemented.
- Existing morphology authority reused: implemented.
- Optional RiverReachRealismAuthority reused: implemented.
- Legacy `water.river()` seed/result contract preserved: implemented.
- Additive `water.reach()` result: implemented.
- Expert ecosystem exports: implemented.
- No unrelated Nature/root/world files touched: preserved.
- All new/rewritten source files are below the 120-line ceiling.

## Delta discovered by full readback

### D1 — Caller habitat array remained externally mutable

`RiverReachSample` froze the sample object but directly retained `options.habitat` when no reach authority matched. A caller could mutate that array after plan creation and thereby mutate supposedly immutable reach evidence.

Resolution: full rewrite `RiverReachSample.js` so final habitat is always cloned and frozen after optional reach-realism sampling.

### D2 — Leading duplicate centerline points could receive an arbitrary +X frame

The first-pass frame recovery reused the previous valid tangent. That is stable in the middle of a path, but at the beginning there is no previous real tangent, so a duplicated first point inherited the synthetic +X fallback even when the river later travels another direction.

Resolution: full rewrite `RiverReachFrames.js` so tangent resolution searches forward/backward for the nearest horizontally distinct witness before using the prior fallback.

## Non-deltas intentionally left unchanged

- The plan does not expose raw normalized flow arrays as a top-level property because all canonical flow evidence required by this unit is carried by spatial samples. Adding another public field is unnecessary for the requested feature.
- `NatureApiBase`, `NatureApi`, and package root remain untouched because `nature.water` is already public through the existing Nature barrel.
- Crossings, floodplain queries, basins, terrain, roads, roofs, ecology adapters, villages, rocks, and MitzvahWorld remain outside this unit.

## Next action

Rewrite the two affected new modules completely, reread them, then begin focused tests. No other production code changes are authorized unless tests reveal a defect in this same river-reach unit.
