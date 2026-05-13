/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE LOADER OF VESSELS — GlbLoader.js
 *   ────────────────────────────────────────
 *   "And He brought him outside..." (Bereishis 15:5).
 *   The loader brings the data from the outside world into the 
 *   inner sanctuary of the scene. It is the channel through which
 *   the binary light of the GLB is translated into the physical
 *   language of the GPU.
 *
 *   This is the pure function of fetching and parsing, a vessel 
 *   of the Divine Will that ensures nothing is lost in the descent.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module GlbLoader
 */

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** @constant {GLTFLoader} _LOADER - Shared loader instance */
const _LOADER = new GLTFLoader();

/**
 * @function loadGlb
 * @description
 *   Wraps GLTFLoader.load() in a Promise.
 *   Returns the gltf.scene with animations grafted onto it.
 *
 *   "Open for me an opening like the eye of a needle, and I will 
 *   open for you an opening like the hall of the Temple."
 *   The loader opens the needle-eye for the great data to enter.
 *
 * @param   {string} path - URL path to the GLB file
 * @returns {Promise<import('three').Group>}
 */
export function loadGlb(path) {
  return new Promise((resolve, reject) => {
    _LOADER.load(
      path,
      (gltf) => {
        const root = gltf.scene;
        root.animations = gltf.animations || [];
        resolve(root);
      },
      (xhr) => {
        // B"H: Progress is silent, but the work continues.
      },
      (err) => reject(err),
    );
  });
}

export default loadGlb;
