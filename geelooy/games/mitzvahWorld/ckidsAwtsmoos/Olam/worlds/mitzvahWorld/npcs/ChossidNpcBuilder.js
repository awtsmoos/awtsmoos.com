
/**
 * B"H
 * @file ChossidNpcBuilder.js
 * @description
 * Builds NPCs from only https://models-3122d.web.app/chossid.glb.
 */

import { loadFreshChossidGltf } from "./ChossidNpcLoader.js";
import { cloneChossidNpcScene } from "./ChossidNpcClone.js";
import { applyChossidNpcTransform } from "./ChossidNpcTransform.js";

/**
 * B"H
 * Extracts the scene from a GLTF.
 *
 * @param {any} gltf
 * GLTF.
 *
 * @returns {any}
 * Object3D.
 */
function getGltfScene(gltf) {
  const scene = gltf?.scene || gltf?.scenes?.[0];

  if (!scene) {
    throw new Error("chossid.glb loaded but had no scene");
  }

  return scene;
}

/**
 * B"H
 * Builds one real chossid NPC.
 *
 * @param {any} olam
 * World.
 *
 * @param {Object} def
 * Definition.
 *
 * @returns {Promise<any>}
 * NPC root.
 */
export async function buildChossidNpc(olam, def) {
  const gltf = await loadFreshChossidGltf(olam);
  const npc = cloneChossidNpcScene({ scene: getGltfScene(gltf) });

  return applyChossidNpcTransform(npc, def, olam);
}
