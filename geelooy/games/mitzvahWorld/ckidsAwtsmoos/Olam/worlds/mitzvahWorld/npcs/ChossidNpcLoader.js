
/**
 * B"H
 * @file ChossidNpcLoader.js
 * @description
 * Loads the one and only chossid.glb used by every NPC.
 */

import { CHOSSID_GLB_PATH } from "./ChossidGlbPath.js";

let cachedGltfPromise = null;

/**
 * B"H
 * Gets the GLTFLoader from the world.
 *
 * @param {Object} olam
 * World instance.
 *
 * @returns {Object}
 * GLTFLoader-like object.
 */
function getLoader(olam) {
  const loader = olam?.loader;

  if (!loader || typeof loader.loadAsync !== "function") {
    throw new Error("NPC chossid.glb cannot load because olam.loader.loadAsync is missing");
  }

  return loader;
}

/**
 * B"H
 * Loads the one chossid.glb file.
 *
 * @param {Object} olam
 * World instance.
 *
 * @returns {Promise<Object>}
 * Loaded GLTF.
 */
export function loadChossidNpcGltf(olam) {
  if (!cachedGltfPromise) {
    cachedGltfPromise = getLoader(olam).loadAsync(CHOSSID_GLB_PATH);
  }

  return cachedGltfPromise;
}
