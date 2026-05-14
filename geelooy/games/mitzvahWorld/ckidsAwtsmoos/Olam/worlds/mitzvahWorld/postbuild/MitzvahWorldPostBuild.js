
/**
 * B"H
 * @file MitzvahWorldPostBuild.js
 * @description
 * Final Mitzvah World pass.
 *
 * NPCs:
 * only https://models-3122d.web.app/chossid.glb
 *
 * Doors:
 * real visible meshes added to scene.
 */

import { ensureChossidNpcs } from "../npcs/EnsureChossidNpcs.js";
import { ensureHouseDoors } from "../doors/EnsureHouseDoors.js";

/**
 * B"H
 * Runs final repairs.
 *
 * @param {Object} context
 * Context.
 *
 * @returns {Promise<void>}
 */
export async function runMitzvahWorldPostBuild(context) {
  try {
    await ensureHouseDoors(context);
  } catch (error) {
    console.error(`B"H | HOUSE_DOORS_FAILED | message=${error?.message || String(error)}`);
  }

  try {
    await ensureChossidNpcs(context);
  } catch (error) {
    console.error(`B"H | CHOSSID_NPCS_FAILED | message=${error?.message || String(error)}`);
  }
}
