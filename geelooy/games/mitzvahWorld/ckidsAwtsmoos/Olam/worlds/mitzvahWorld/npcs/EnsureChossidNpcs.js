
/**
 * B"H
 * @file EnsureChossidNpcs.js
 * @description
 * Ensures visible NPCs exist. No fake meshes. Only chossid.glb.
 */

import { CHOSSID_NPC_DEFS } from "./ChossidNpcDefs.js";
import { buildChossidNpc } from "./ChossidNpcBuilder.js";
import { countSpawnedNpcRoots } from "./SceneNpcScan.js";
import { getVisibleNpcPositions } from "./HouseNpcPositions.js";

/**
 * B"H
 * Builds final defs with positions near actual houses if possible.
 *
 * @param {any} scene
 * Scene.
 *
 * @returns {Object[]}
 * Definitions.
 */
function makeVisibleDefs(scene) {
  const positions = getVisibleNpcPositions(scene);

  return CHOSSID_NPC_DEFS.map((def, index) => ({
    ...def,
    position: positions[index % positions.length] || def.position
  }));
}

/**
 * B"H
 * Ensures real chossid NPCs are visible.
 *
 * @param {Object} context
 * Context.
 *
 * @returns {Promise<any[]>}
 * Added NPCs.
 */
export async function ensureChossidNpcs(context) {
  const olam = context?.olam;
  const scene = context?.scene || olam?.scene;

  if (!olam || !scene) {
    throw new Error("Cannot spawn chossid NPCs without olam and scene");
  }

  if (countSpawnedNpcRoots(scene) > 0) {
    return [];
  }

  const added = [];
  const settings = scene.userData?.mitzvahWorldSettings || {};
  const limit = Number.isFinite(settings.npcLimit) ? settings.npcLimit : 4;
  const defs = makeVisibleDefs(scene).slice(0, limit);

  for (const def of defs) {
    const npc = await buildChossidNpc(olam, def);
    scene.add(npc);
    added.push(npc);
  }

  return added;
}
