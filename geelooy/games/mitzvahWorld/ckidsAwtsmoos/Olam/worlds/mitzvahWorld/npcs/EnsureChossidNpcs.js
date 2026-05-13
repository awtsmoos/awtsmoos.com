
/**
 * B"H
 * @file EnsureChossidNpcs.js
 * @description
 * Ensures visible NPCs exist. Every NPC uses the one chossid.glb.
 */

import { CHOSSID_NPC_DEFS } from "./ChossidNpcDefs.js";
import { buildChossidNpc } from "./ChossidNpcBuilder.js";
import { countChossidNpcs } from "./ChossidNpcSceneScan.js";

/**
 * B"H
 * Ensures default chossid.glb NPCs are added to the scene.
 *
 * @param {Object} context
 * Context.
 *
 * @param {Object} context.olam
 * World.
 *
 * @param {Object} context.scene
 * Scene.
 *
 * @returns {Promise<Object[]>}
 * NPCs added.
 */
export async function ensureChossidNpcs(context) {
  const olam = context?.olam;
  const scene = context?.scene || olam?.scene;

  if (!olam || !scene) {
    throw new Error("Cannot ensure chossid NPCs without olam and scene");
  }

  if (countChossidNpcs(scene) > 0) {
    return [];
  }

  const added = [];

  for (const def of CHOSSID_NPC_DEFS) {
    const npc = await buildChossidNpc(olam, def);
    scene.add(npc);
    added.push(npc);
  }

  return added;
}
