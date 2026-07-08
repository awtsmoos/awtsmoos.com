// B"H
/**
 * Public entrypoint for the first-generation MMO starter-zone contract.
 *
 * The implementation lives in smaller data-first modules under `startingZone/`.
 * This file remains as the stable import path for audits, postbuild hooks, and
 * any compact/deferred browser imports that already know this module name.
 */
export { STARTER_ACTION_BAR } from "./startingZone/StarterActionBarData.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export { STARTER_ENEMY_ARCHETYPES } from "./startingZone/StarterEnemyArchetypes.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export { STARTER_SUBZONES, STARTER_WORLD_REQUIREMENTS } from "./startingZone/StarterSubzoneData.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export { createStartingZoneMmoRuntime, runStartingZoneMmoContract } from "./startingZone/StartingZoneRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

import { STARTER_ACTION_BAR } from "./startingZone/StarterActionBarData.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { STARTER_ENEMY_ARCHETYPES } from "./startingZone/StarterEnemyArchetypes.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { STARTER_SUBZONES, STARTER_WORLD_REQUIREMENTS } from "./startingZone/StarterSubzoneData.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createStartingZoneMmoRuntime, runStartingZoneMmoContract } from "./startingZone/StartingZoneRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default {
  STARTER_ACTION_BAR,
  STARTER_ENEMY_ARCHETYPES,
  STARTER_SUBZONES,
  STARTER_WORLD_REQUIREMENTS,
  createStartingZoneMmoRuntime,
  runStartingZoneMmoContract
};
