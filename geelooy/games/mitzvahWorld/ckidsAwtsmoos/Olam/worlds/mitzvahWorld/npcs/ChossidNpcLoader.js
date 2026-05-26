/**
 * B"H
 * @file ChossidNpcLoader.js
 * @description
 * Loads NPCs from the one Chossid GLB path through the renderer capability
 * membrane first. Three's GLTFLoader remains only as a lazy adapter fallback,
 * so future custom WebGL can replace model realization without changing the
 * Chossid NPC gameplay builder.
 */

import { CHOSSID_GLB_PATH } from "./ChossidGlbPath.js";

let directLoader = null;
let chossidGltfPromise = null;

/**
 * B"H
 * Gets a custom olam loader when the world provides one.
 *
 * @param {any} olam World.
 * @returns {any|null} Loader.
 */
function getOlamLoader(olam) {
  const loader = olam?.loader;
  return loader && typeof loader.loadAsync === "function" ? loader : null;
}

/**
 * B"H
 * Gets the renderer capability model loader when available.
 *
 * @param {any} olam World.
 * @returns {Function|null} loadModel function.
 */
function getCapabilityModelLoader(olam) {
  const loadModel = olam?.rendererCapabilities?.loadModel;
  return typeof loadModel === "function" ? loadModel : null;
}

async function getDirectThreeLoader() {
  if (directLoader) return directLoader;
  const mod = await import("/games/scripts/jsm/loaders/GLTFLoader.js");
  directLoader = new mod.GLTFLoader();
  return directLoader;
}

function asGltfEnvelope(model) {
  if (model?.scene || model?.scenes) return model;
  return { scene: model };
}

/**
 * B"H
 * Loads one fresh chossid.glb instance.
 *
 * @param {any} olam World.
 * @returns {Promise<any>} Loaded GLTF-like envelope.
 */
export async function loadFreshChossidGltf(olam) {
  if (chossidGltfPromise) return chossidGltfPromise;

  chossidGltfPromise = loadChossidGltfOnce(olam);
  return chossidGltfPromise;
}

async function loadChossidGltfOnce(olam) {
  const capabilityLoadModel = getCapabilityModelLoader(olam);
  if (capabilityLoadModel) {
    return asGltfEnvelope(await capabilityLoadModel(CHOSSID_GLB_PATH));
  }

  const olamLoader = getOlamLoader(olam);
  if (olamLoader) {
    return olamLoader.loadAsync(CHOSSID_GLB_PATH);
  }

  const loader = await getDirectThreeLoader();
  return loader.loadAsync(CHOSSID_GLB_PATH);
}
