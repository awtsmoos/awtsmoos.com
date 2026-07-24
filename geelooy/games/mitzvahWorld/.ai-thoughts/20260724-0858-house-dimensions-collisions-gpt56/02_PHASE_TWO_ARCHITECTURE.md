# B"H
# Boruch Hashem
# Blessed is He

## Phase two: realistic architecture and file map

1. `MinimalMeadowHouseDimensionPolicy.js` records legacy dimensions, computes expansion, validates ≥40× footprint area, freezes human-scale door dimensions, and derives hall/wing/stair/foundation parameters.
2. `MinimalMeadowHouseProfiles.js` defines two expanded footprints that fit the 220×220 terrain without parent scaling or overlap.
3. `MinimalMeadowHouseFoundation.js` samples the real terrain beneath each footprint and creates a level platform plus perimeter skirt deep enough to hide terrain variance while preserving an accessible threshold elevation.
4. `MinimalMeadowHouseFloorPlan.js` describes central hall, side wings, partition openings, room IDs, and normal-size door specifications from profile parameters.
5. `MinimalMeadowHouseRooms.js` turns the floor plan into visible/collidable wall segments and normal-size door openings.
6. `MinimalMeadowHouseShell.js` builds measured wall lengths, floors, roof, and upper-floor stair opening from expanded dimensions.
7. `MinimalMeadowHouseStairs.js` derives tread count, run, width, landing, and opening from story height and hall dimensions.
8. `MinimalMeadowHouseAssembly.js` uses measured foundation elevation and returns diagnostics proving scale, doors, colliders, and traversal dimensions.
9. Tests verify ≥40× area, unchanged doors, no parent scaling, aligned definitions/colliders, usable stair rise/run/headroom, and non-overlapping footprints within terrain bounds.
