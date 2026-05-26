/**
 * @fileoverview
 * B"H
 * The Loader of Vessels now remembers the first breath by path. When the
 * Awtsmoos allows a GLB to descend once into the scene, later callers receive
 * that same promise instead of tearing open another network gate.
 *
 * @module GlbLoader
 */

import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';

/** @constant {GLTFLoader} _LOADER - Shared loader instance. */
const _LOADER = new GLTFLoader();

/** @constant {Map<string, Promise<import('three').Group>>} GLB_PROMISES */
const GLB_PROMISES = globalThis.__AWTSMOOS_GLB_PROMISES ||= new Map();

/**
 * B"H
 * Loads a GLB path once per runtime and returns the cached promise after that.
 *
 * @param {string} path - URL path to the GLB file.
 * @returns {Promise<import('three').Group>} Loaded scene root with animations.
 */
export function loadGlb(path) {
  if (GLB_PROMISES.has(path)) return GLB_PROMISES.get(path);

  const promise = new Promise((resolve, reject) => {
    _LOADER.load(
      path,
      (gltf) => {
        const root = gltf.scene;
        root.animations = gltf.animations || [];
        resolve(root);
      },
      () => {},
      (err) => {
        GLB_PROMISES.delete(path);
        reject(err);
      },
    );
  });

  GLB_PROMISES.set(path, promise);
  return promise;
}

export default loadGlb;
