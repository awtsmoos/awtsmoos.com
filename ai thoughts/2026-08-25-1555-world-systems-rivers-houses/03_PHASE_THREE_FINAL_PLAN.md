B"H

# Phase Three — Final Pre-Code World Systems Plan

The Awtsmoos renews every contour without becoming contour and every current without becoming current. Awtsmoos.com should reveal environmental law first, then let renderers and games clothe that law in many forms.

## Thirty final refinements

1. Stable IDs derive from semantic owner + sample index.
2. Canonical sample counts remain independent from renderer LOD.
3. Authored river centerlines bypass procedural meandering cleanly.
4. Generated paths use dedicated random namespaces.
5. Cosmetic quality never enters spatial randomness.
6. Existing river morphology namespaces remain authoritative.
7. Frames recover from zero-length path segments without NaN.
8. Numeric inputs are finite-normalized.
9. Degenerate required spatial data fails explicitly.
10. Active-channel widths receive positive floors.
11. Riparian width never lies inside active channel width.
12. Floodplain width never lies inside riparian width.
13. Left/right banks share one explicit lateral-frame convention.
14. Flow/morphology arrays resample by normalized progress.
15. Reach realism remains optional and additive.
16. Influence queries classify channel/riparian/floodplain/outside.
17. Village exclusions are adapters, not canonical river representation.
18. Crossing tie-breaking is stable.
19. Ford scoring rejects dangerous depth/speed/cascade.
20. Bridge scoring prefers stable banks and straighter reaches.
21. Water basins use a separate spatial contract from river channels.
22. Basin shorelines have deterministic irregularity under their own namespace.
23. Basin queries distinguish water/shore/wetland/outside.
24. Existing river runtime keeps its exact seed identity.
25. Ecosystem river integration is opt-in through `riverReach`.
26. Existing ecosystems without `riverReach` keep their legacy branch.
27. Flat building roofs remain the compatibility default.
28. Gable/hip/shed roofs are structural manual solids, not decorative labels.
29. Large shell responsibility is split into wall/floor/roof modules.
30. Tests come only after the implementation pass and are followed by full readback/delta review.

## Actual implementation file set

New ecosystem modules:
- `RiverReachPath.js`
- `RiverReachFrames.js`
- `RiverReachPlan.js`
- `RiverWorldInfluence.js`
- `RiverCrossingPlanner.js`
- `RiverHabitatAdapter.js`
- `EcosystemRiverContext.js`
- `WaterBasinPresets.js`
- `WaterBasinPlan.js`
- `WaterBasinInfluence.js`

New Nature modules:
- `WaterNatureRequest.js`
- `WaterNatureOperations.js`

New architecture modules:
- `BuildingExteriorWalls.js`
- `BuildingFloorPanels.js`
- `BuildingRoofSolids.js`
- `BuildingRoofPlan.js`

Whole-file rewrites after full reads:
- `src/core/ecosystem/EcosystemPlanner.js`
- `src/core/ecosystem/index.js`
- `src/core/natureApi/WaterNatureApi.js`
- `src/core/natureApi/NatureApiBase.js`
- `src/core/domem/architecture/BuildingShell.js`
- `src/core/domem/architecture/BuildingPlan.js`
- `src/core/domem/architecture/index.js`
- `src/index.js`

## Test universe after implementation

- deterministic river paths and basins;
- finite path frames and bank coordinates;
- seed isolation from quality controls;
- river influence region classification;
- crossing stability;
- ecosystem habitat enrichment and legacy branch compatibility;
- legacy river runtime seed/context compatibility;
- basin Nature API access;
- legacy flat building output;
- gable/hip/shed manual roof solidity/finite geometry;
- public root imports;
- syntax and package regression checks.

## Follow-on world work after this proof

Terrain drainage/watersheds, river carving intent, road/bridge adapters, richer windows/openings, building flood/site assessment, riparian rock fields, tree/vegetation ecological response, material blending, village integration, and explicit MitzvahWorld adapter adoption.
