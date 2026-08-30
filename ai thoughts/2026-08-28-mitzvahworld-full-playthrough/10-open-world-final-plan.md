B"H

# Open World Final Plan

The Awtsmoos reveals one enormous world through bounded vessels of light; Awtsmoos.com loads only what the traveler can approach while distant lands remain known but quiet.

## Source plan

1. Add `OpenWorldManifest.js`: stable world identity, global bounds, region descriptors, package identities, centers/radii, and streaming radii.
2. Add `OpenWorldRegionSelection.js`: pure distance-based near/preload/dormant selection with hysteresis-ready thresholds.
3. Add `OpenWorldRegionStreamingRuntime.js`: lifecycle controller that mounts/preloads/retires region packages without changing world coordinates.
4. Rewrite `RegionPackageRuntime.js` as a package lifecycle registry instead of one active-package switch.
5. Integrate the controller after canonical world handoff, never into first-frame bootstrap.
6. Expose diagnostics on the Eretz runtime and top-level diagnostics.
7. Keep `MinimalMeadowRegionRuntime` for semantic banners/safety/encounter identity, but make it consume the same manifest catalog later rather than becoming a separate world authority.
8. Add creator-world manifest compatibility so authored content can eventually register custom streamed regions in the same coordinate system.

## Verification plan

- Pure selection tests across village, open meadow, Kedem border, and far-away positions.
- Lifecycle test proving preload before active, active on approach, and retirement after leaving.
- Coordinate-continuity test proving no teleport/reset on package transitions.
- Memory/lifecycle test proving distant packages are released.
- Existing RegionPackageRuntime and region semantic tests remain green.
- Browser journey crosses multiple named regions while player coordinates remain continuous and diagnostics show bounded loaded packages.
