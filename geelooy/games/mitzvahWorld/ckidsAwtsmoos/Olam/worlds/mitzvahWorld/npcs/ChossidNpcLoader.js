
/**
 * B"H
 * @file ChossidNpcLoader.js
 * @description
 * Loads NPCs only from the one chossid.glb URL.
 */

import { CHOSSID_GLB_PATH } from "./ChossidGlbPath.js";

/**
 * B"H
 * Gets a GLTFLoader.
 *
 * @param {any} olam
 * World.
 *
 * @returns {any}
 * Loader.
 */
function getLoader(olam) {
  const loader = olam?.loader;

  if (!loader || typeof loader.loadAsync !== "function") {
    throw new Error("Missing olam.loader.loadAsync for chossid NPC loading");
  }

  return loader;
}

/**
 * B"H
 * Loads a fresh chossid.glb instance.
 *
 * This intentionally uses the one exact URL every time.
 *
 * @param {any} olam
 * World.
 *
 * @returns {Promise<any>}
 * Loaded GLTF.
 */
export async function loadFreshChossidGltf(olam) {
  return await getLoader(olam).loadAsync(CHOSSID_GLB_PATH);
}
