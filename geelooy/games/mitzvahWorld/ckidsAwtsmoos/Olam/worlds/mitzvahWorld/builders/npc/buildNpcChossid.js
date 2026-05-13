
/**
 * B"H
 * @file buildNpcChossid.js
 * @description
 * NivrahFactory builder for NPCs.
 *
 * Every NPC uses exactly:
 * https://models-3122d.web.app/chossid.glb
 */

import { buildChossidNpc } from "../../npcs/ChossidNpcBuilder.js";

/**
 * B"H
 * Builds one NPC.
 *
 * @param {Object} scene
 * Scene.
 *
 * @param {Object} physics
 * Physics.
 *
 * @param {Object} def
 * Definition.
 *
 * @param {Object} olam
 * World.
 *
 * @returns {Promise<Object[]>}
 * Built NPCs.
 */
export async function buildNpcChossid(scene, physics, def, olam) {
  const npc = await buildChossidNpc(olam, {
    id: def.id,
    displayName: def.props?.displayName || def.id,
    position: def.position || def.props?.position || [0, 0, 0],
    rotation: def.rotation || def.props?.rotation || [0, 0, 0],
    scale: def.scale || def.props?.scale || 1
  });

  return [npc];
}

export default buildNpcChossid;
