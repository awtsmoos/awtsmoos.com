// B"H
/**
 * Public entrypoint for the first-generation MMO starter-zone contract.
 *
 * The implementation lives in smaller data-first modules under `startingZone/`.
 * This file remains as the stable import path for audits, postbuild hooks, and
 * any compact/deferred browser imports that already know this module name.
 */
export { STARTER_ACTION_BAR } from "./startingZone/StarterActionBarData.js";
export { STARTER_ENEMY_ARCHETYPES } from "./startingZone/StarterEnemyArchetypes.js";
export { STARTER_SUBZONES, STARTER_WORLD_REQUIREMENTS } from "./startingZone/StarterSubzoneData.js";
export { createStartingZoneMmoRuntime, runStartingZoneMmoContract } from "./startingZone/StartingZoneRuntime.js";

import { STARTER_ACTION_BAR } from "./startingZone/StarterActionBarData.js";
import { STARTER_ENEMY_ARCHETYPES } from "./startingZone/StarterEnemyArchetypes.js";
import { STARTER_SUBZONES, STARTER_WORLD_REQUIREMENTS } from "./startingZone/StarterSubzoneData.js";
import { createStartingZoneMmoRuntime, runStartingZoneMmoContract } from "./startingZone/StartingZoneRuntime.js";

export default {
  STARTER_ACTION_BAR,
  STARTER_ENEMY_ARCHETYPES,
  STARTER_SUBZONES,
  STARTER_WORLD_REQUIREMENTS,
  createStartingZoneMmoRuntime,
  runStartingZoneMmoContract
};
