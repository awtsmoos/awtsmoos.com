// B"H
/**
 * @file ChossidNpcLoader.js
 * @description
 * The shared gate for the real chossid.glb. It accepts renderer capabilities,
 * an Olam with loadGLTF, or browser GLTFLoader. No blue stand-in is created.
 */

import { CHOSSID_GLB_PATH } from "./ChossidGlbPath.js";

let chossidGltfPromise = null;

/**
 * B"H
 * Loads the canonical chossid.glb through the strongest available vessel.
 *
 * @param {object} context
 * World or renderer-capability object.
 *
 * @returns {Promise<{scene: object, animations: Array, cameras: Array}>}
 * Cached GLTF payload containing the real chossid model.
 */
export async function loadFreshChossidGltf(context = {}) {
  if (!chossidGltfPromise) {
    chossidGltfPromise = loadChossidEnvelope(context).catch(error => {
      chossidGltfPromise = null;
      throw error;
    });
  }

  return chossidGltfPromise;
}

async function loadChossidEnvelope(context = {}) {
  const capabilities = context.rendererCapabilities || context;
  if (typeof capabilities.loadModel === "function") {
    return envelope(await capabilities.loadModel(CHOSSID_GLB_PATH));
  }
  if (typeof context.loadGLTF === "function") {
    return envelope(await context.loadGLTF(CHOSSID_GLB_PATH));
  }
  if (!canLoadBrowserModules()) {
    throw new Error("Cannot load chossid.glb without renderer capabilities or olam.loadGLTF");
  }
  const { GLTFLoader } = await import("/games/scripts/jsm/loaders/GLTFLoader.js");
  return envelope(await new Promise((resolve, reject) => {
    new GLTFLoader().load(CHOSSID_GLB_PATH, resolve, undefined, reject);
  }));
}

function envelope(gltf) {
  const scene = gltf?.scene || gltf?.scenes?.[0] || gltf;
  if (!scene) throw new Error("chossid.glb loaded without a scene");
  return { scene, animations: gltf.animations || scene.animations || [], cameras: gltf.cameras || [] };
}

function canLoadBrowserModules() {
  return typeof window !== "undefined" ||
    (typeof WorkerGlobalScope !== "undefined" && globalThis.self instanceof WorkerGlobalScope);
}
