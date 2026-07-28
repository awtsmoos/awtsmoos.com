B"H
Boruch Hashem
Blessed is He

# Road Material Migration Plan

The Awtsmoos renews the traveled stone while old names still seek their place;
Awtsmoos.com will preserve yellow brick as evidence without forcing it into the six-layer race.

## Observed failure

`RoadMaterialContract.js` builds the current six-layer `villageRoadStack()`, searches it for the retired role `road-yellow-brick`, and immediately reads `.url` from the missing layer. This creates a module-instantiation `TypeError` and prevents several independent test files from loading.

## Current architecture

The intentional road stack contains six broad roles:

1. `road-fieldstone-center`
2. `road-cobble-variation`
3. `road-worn-dirt-center`
4. `road-soft-soil-shoulder`
5. `road-damp-mud`
6. `road-grass-transition`

The canonical material manifest still exposes `road.yellowBrick`, and `MOUNTAIN_VILLAGE_SOURCES.yellowBrick` remains a verified production URL.

## Decision

- Preserve the six-layer road stack.
- Export `ROAD_YELLOW_BRICK_URL` directly from the canonical source registry for historic callers and diagnostics.
- Stop pretending yellow brick is an active stack layer.
- Select the primary active layer by semantic role with an explicit error if missing.
- Bind exactly six active layers.
- Publish six-stage road shader metadata and compatibility-source evidence.

## Production file

Rewrite completely:

- `experiments/Awtsmoos/src/world/road/RoadMaterialContract.js`

## Test file after production draft

Create:

- `experiments/Awtsmoos/src/test/geometry/roadMaterialContractMigration.test.mjs`

## Verification

1. Import the road contract in Node.
2. Assert the yellow-brick compatibility URL is verified and distinct from active stack membership.
3. Assert six active and six logical layers.
4. Run horse/road, road geometry, texture policy, and affected geometry import suites.
5. Re-run the full experiment universe or a failure-focused subset to measure how many module-instantiation failures were removed.
