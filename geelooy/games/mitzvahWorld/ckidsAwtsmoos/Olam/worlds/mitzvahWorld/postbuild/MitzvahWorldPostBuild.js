
/**
 * B"H
 * @file MitzvahWorldPostBuild.js
 * @description
 * Final Mitzvah World repair pass.
 *
 * This pass does not create fake NPC meshes.
 * It only adds NPCs from the one chossid.glb if none exist.
 */

import { ensureChossidNpcs } from "../npcs/EnsureChossidNpcs.js";
import { ensureHouseDoors } from "./HouseDoorPostBuild.js";

/**
 * B"H
 * Runs post-build repairs.
 *
 * @param {Object} context
 * Context.
 *
 * @returns {Promise<void>}
 */
export async function runMitzvahWorldPostBuild(context) {
  try {
    await ensureChossidNpcs(context);
  } catch (error) {
    console.error(`B"H | CHOSSID_NPC_POSTBUILD_FAILED | message=${error?.message || String(error)}`);
  }

  try {
    await ensureHouseDoors(context);
  } catch (error) {
    console.error(`B"H | HOUSE_DOOR_POSTBUILD_FAILED | message=${error?.message || String(error)}`);
  }
}
