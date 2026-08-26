B"H

# Phase Three — Final River Reach Plan

The Awtsmoos renews source and sea, yet this mission closes one measured reach alone; Awtsmoos.com lets a narrow implementation become a durable channel for wider worlds without swallowing their role.

## Exact source plan

### New
- `src/core/ecosystem/RiverReachPath.js` — authored/generated centerline, stable ids, measured distance.
- `src/core/ecosystem/RiverReachFrames.js` — stable tangent/lateral frames and bank offset helper.
- `src/core/ecosystem/RiverReachSample.js` — resampling and immutable reach-sample construction.
- `src/core/ecosystem/RiverReachPlan.js` — thin coordinator joining path, flow, morphology, optional realism, summary.
- `src/core/natureApi/WaterNatureRequest.js` — request normalization/shared physical overrides so the facade stays small.

### Full-file rewrites after full reads
- `src/core/natureApi/WaterNatureApi.js` — preserve `river()`, add `reach()`.
- `src/core/ecosystem/index.js` — additive expert exports.

### Deliberately untouched
- `src/index.js`
- `NatureApiBase.js`
- `NatureApi.js`
- ecosystem world planner
- all other world systems.

## Verification after code

1. Same reach seed/options => deep-equal canonical plan.
2. Quality changes do not alter path/plan shape.
3. Authored centerline coordinates survive normalization.
4. Duplicate neighboring points do not produce non-finite frames.
5. Left/right banks remain symmetric around center width.
6. Authored flow arrays are resampled into reach evidence.
7. Optional reach realism changes only matching samples.
8. `water.river()` remains callable and retains `river-runtime` result kind.
9. `water.reach()` is public through existing Nature exports.
10. Expert ecosystem barrel exposes reach planners.
