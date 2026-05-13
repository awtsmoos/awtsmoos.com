
/**
 * B"H
 * @file ChossidNpcBuilder.js
 * @description
 * Builds NPCs only from the one chossid.glb model.
 */

import { loadChossidNpcGltf } from "./ChossidNpcLoader.js";
import { cloneChossidNpcScene } from "./ChossidNpcClone.js";
import { applyChossidNpcTransform } from "./ChossidNpcTransform.js";

/**
 * B"H
 * Builds one NPC from chossid.glb.
 *
 * @param {Object} olam
 * World instance.
 *
 * @param {Object} def
 * NPC definition.
 *
 * @returns {Promise<Object>}
 * NPC Object3D.
 */
export async function buildChossidNpc(olam, def) {
  const gltf = await loadChossidNpcGltf(olam);
  const npc = cloneChossidNpcScene(gltf);

  return applyChossidNpcTransform(npc, def);
}
