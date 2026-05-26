/**
 * B"H
 * @file ChossidNpcLoader.js
 * @description
 * Loads every NPC from the shared mitzvahWorld GLB cache. The first caller
 * opens the gate; every later caller receives the same promise, then clones
 * the scene. Thus two NPCs, the player, and future tests do not stampede the
 * network for the same chossid.glb vessel.
 */

import { CHOSSID_GLB_PATH } from "./ChossidGlbPath.js";
import { loadGlb } from "../builders/glb/GlbLoader.js";

let chossidGltfPromise = null;

/**
 * B"H
 * Wraps a loaded Object3D in the GLTF-like envelope expected downstream.
 *
 * @param {any} model - Loaded scene root or GLTF-like object.
 * @returns {{scene:any}|any} GLTF-like envelope.
 */
function asGltfEnvelope(model) {
  if (model?.scene || model?.scenes) return model;
  return { scene: model };
}

/**
 * B"H
 * Loads the shared chossid.glb source once per runtime.
 *
 * @returns {Promise<any>} Loaded GLTF-like envelope.
 */
export async function loadFreshChossidGltf() {
  if (!chossidGltfPromise) {
    chossidGltfPromise = loadGlb(CHOSSID_GLB_PATH).then(asGltfEnvelope);
  }

  return chossidGltfPromise;
}
