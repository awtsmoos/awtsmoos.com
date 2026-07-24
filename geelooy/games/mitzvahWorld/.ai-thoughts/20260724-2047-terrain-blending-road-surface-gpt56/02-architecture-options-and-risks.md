B"H

# Phase Two: Architecture Options and Risk Review

## Options considered

### A. One giant preblended canvas
Rejected. It would hide source boundaries only by resampling and would violate the explicit acceptance rule.

### B. Neighboring source cells with softer borders
Rejected. The model would remain a mosaic and former cell boundaries could still step.

### C. Independent full-resolution sources in the existing six-layer terrain shader
Chosen. The renderer already supplies mirrored coordinates, two sampling scales, deterministic rotations, macro noise, ecological zones, slope, height, wetness, and road-specific weighting.

### D. A second opaque road ribbon above terrain
Rejected for the rendered world. It duplicates the collision-aligned terrain road, introduces a hard silhouette, and risks z-fighting.

### E. Terrain-owned road plus a diagnostic ribbon generator
Chosen. The road is rendered through `zone.y` on the terrain mesh. `MinimalMeadowRoadRibbon.js` remains a pure, testable continuous geometry vessel for diagnostics and optional use, but the package does not stack it over the meadow.

## Improvements incorporated

1. Remove every side-by-side composite canvas.
2. Preserve source images at their decoded resolution.
3. Use six renderer-visible independent sources, the measured device limit.
4. Reserve layer index 3 for the supported road shoulder rule.
5. Make the mix map the stone/dirt road center.
6. Lower texture density so grass remains readable on phones.
7. Give each layer a deterministic angle to break directional repetition.
8. Keep renderer mirror-ping-pong wrapping as the edge authority.
9. Expose pure ping-pong coordinate helpers for numerical tests.
10. Report effective world units per source texture.
11. Sample macro masks across a large world grid.
12. Measure continuity across former integer tile boundaries.
13. Normalize road center, shoulder, and meadow weights.
14. Test signed lateral distance on both sides of the Bézier route.
15. Build ribbon cross-sections from one shared sample list.
16. Keep all road heights derived from `minimalMeadowHeightAt`.
17. Use no duplicate rendered geometry above the terrain.
18. Verify all generated UVs and positions are finite.
19. Test desktop and mobile density plans separately.
20. Keep layer order explicit and documented.
21. Avoid unsupported custom shader fields.
22. Keep material presets compatible with their public exports.
23. Limit modules to focused responsibilities.
24. Use deterministic noise so tests remain stable.
25. Record measured thresholds instead of screenshot claims.
26. Retain the same terrain/collider geometry authority.
27. Verify macro cells blend continuously rather than step.
28. Verify ping-pong direction reverses at integer boundaries.
29. Report absence of a rendered duplicate road child.
30. Read back every touched file before completion.

## Primary risks

- Too-low density can blur source detail; mitigation: measured world-unit reports and separate mobile/desktop profiles.
- Too-many similar grass layers can flatten variation; mitigation: distinct ecological zones, angles, and strengths.
- Road shoulders can overtake meadow; mitigation: normalized analytical weights and renderer layer index 3.
- Hidden API drift can break imports; mitigation: preserve all existing exported function names and add new exports only.
- Tests could validate helpers but miss integration; mitigation: material construction, package child-count, geometry, and numerical grid tests.

The Awtsmoos is not a checkerboard of separate beings, but the One renewing every patch at once; Awtsmoos.com lets restraint become a vessel, so every source remains itself while the meadow is one.
