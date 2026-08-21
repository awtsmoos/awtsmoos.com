B"H
Boruch Hashem
Blessed is He

# Domem Architecture API

The Awtsmoos is beyond every wall, room, measurement, and material, while continuously renewing the world in which each architectural relation appears. Awtsmoos.com is remembered here because reusable architecture is strongest when many visible buildings remain expressions of one clear underlying covenant.

## PURPOSE

This directory is the canonical renderer-neutral building-planning layer of `awtsmoos-procedural-core`.

Use it for terrain-aware houses, shops, barns, schools, shuls, halls, and settlement buildings before any renderer or game installs meshes and colliders.

## CANONICAL ENTRY POINTS

| Need | API | File |
| --- | --- | --- |
| Complete building plan | `new BuildingAuthority().create(...)` | `BuildingAuthority.js` |
| Functional complete plan | `createBuildingPlan(...)` | `BuildingPlan.js` |
| Normalize dimensions | `createBuildingProfile(...)` | `BuildingProfile.js` |
| Interior dimensions | `createBuildingLayout(...)` | `BuildingLayout.js` |
| Room/door topology | `createBuildingFloorPlan(...)` | `BuildingFloorPlan.js` |
| Terrain survey | `surveyBuildingGround(...)` | `BuildingGroundSurvey.js` |
| Raised foundation | `createBuildingFoundation(...)` | `BuildingFoundation.js` |
| Terrain-fitted entry | `createBuildingEntrySupport(...)` | `BuildingEntrySupport.js` |
| Exterior shell | `createBuildingShell(...)` | `BuildingShell.js` |
| Interior partitions | `createBuildingRooms(...)` | `BuildingRooms.js` |
| Story floor support | `createBuildingFloorSupport(...)` | `BuildingFloorSupport.js` |
| Interior stairs | `createBuildingStairs(...)` | `BuildingStairs.js` |
| Stair support evidence | `createBuildingStairSupport(...)` | `BuildingStairSupport.js` |

For argument and result shapes, read [`API_REFERENCE.md`](./API_REFERENCE.md).

## OWNS

- normalized building envelope and human-scale doorway policy;
- local/world coordinate conversion;
- room bays, hall partitions, and semantic door records;
- rotated-footprint terrain survey;
- raised foundations and terrain-fitted exterior steps;
- renderer-neutral floors, walls, roofs, room partitions, and stairs;
- entry/floor/stair height support evidence;
- immutable architecture diagnostics.

## DOES NOT OWN

- renderer scene objects;
- Three.js or the tiny WebGL runtime;
- texture URLs or game material catalogs;
- octree insertion/removal;
- dynamic door hinges or animation;
- mezuzahs, quests, narrative state, NPC population, or save data;
- terrain generation itself.

Those concerns belong to adapters or consuming worlds.

## DEPENDENCY DIRECTION

`BuildingAuthority`
→ `BuildingPlan`
→ focused profile / terrain / shell / room / stair planners
→ neutral primitive records.

This directory must never import from `geelooy/games/mitzvahWorld` or a renderer package.

## EXTENSION RULES

1. Put new policy in a focused module rather than expanding `BuildingAuthority`.
2. Keep output renderer-neutral and data-first.
3. Inject world dependencies such as terrain samplers.
4. Preserve semantic ids and `userData.role` when downstream systems use them.
5. Add a public symbol to `index.js` only when it is reusable and stable.
6. Update this README capability map and `API_REFERENCE.md`.

## MIGRATION NOTES

This API is extracted from Mitzvah World's `MinimalMeadowHouse*` planning system. Reusable geometry, terrain fit, room, stair, and support algorithms belong here. Mitzvah World should retain scene installation, octree integration, dynamic doors, mezuzahs, game materials, quests, and population policy.

Compatibility migration is still active. Do not infer that every old `MinimalMeadowHouse*` file is already a delegate until the migration ledger records it.

## AI DISCOVERY KEYWORDS

`house`, `building`, `architecture`, `floor plan`, `rooms`, `foundation`, `terrain fit`, `stairs`, `door`, `shell`, `roof`, `height support`, `procedural building`, `settlement`.

## NEXT FILES TO READ

- `BuildingAuthority.js` — high-level entry point.
- `BuildingPlan.js` — orchestration.
- `BuildingProfile.js` + `BuildingLayout.js` — dimensions and circulation.
- `BuildingFoundation.js` + `BuildingGroundSurvey.js` — terrain fit.
- `BuildingRooms.js` + `BuildingRoomWalls.js` — room topology.
- `BuildingStairs.js` + `BuildingStairSupport.js` — circulation/support.
- `API_REFERENCE.md` — examples and result schema.
