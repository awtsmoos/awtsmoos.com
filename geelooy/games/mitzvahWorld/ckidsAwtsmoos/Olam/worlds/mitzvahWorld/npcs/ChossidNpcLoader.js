/**
 * B"H
 * @file ChossidNpcLoader.js
 * @description
 * Loads NPCs from the one Chossid GLB path., with a direct GLTFLoader
 * fallback so the village is never left empty just because the
 * olam context does not expose a custom loader.
 */

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CHOSSID_GLB_PATH } from "./ChossidGlbPath.js";

const directLoader = new GLTFLoader();

/**
 * B"H
 * Gets a custom olam loader when the world provides one.
 *
 * @param {any} olam
 * World.
 *
 * @returns {any|null}
 * Loader.
 */
function getOlamLoader(olam) {
  const loader = olam?.loader;

  if (loader && typeof loader.loadAsync === "function") {
    return loader;
  }

  return null;
}

/**
 * B"H
 * Loads one fresh chossid.glb instance.
 *
 * @param {any} olam
 * World.
 *
 * @returns {Promise<any>}
 * Loaded GLTF.
 */
export async function loadFreshChossidGltf(olam) {
  const olamLoader = getOlamLoader(olam);

  if (olamLoader) {
    return olamLoader.loadAsync(CHOSSID_GLB_PATH);
  }

  return directLoader.loadAsync(CHOSSID_GLB_PATH);
}
