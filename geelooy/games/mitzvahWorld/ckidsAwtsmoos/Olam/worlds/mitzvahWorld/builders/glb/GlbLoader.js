// B"H
/**
 * @file GlbLoader.js
 * @description Shared GLB promise cache without logical assignment; one vessel, many callers.
 */
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const LOADER = new GLTFLoader();
function cache() { if (typeof globalThis === "undefined") return new Map(); if (!globalThis.__AWTSMOOS_GLB_PROMISES) globalThis.__AWTSMOOS_GLB_PROMISES = new Map(); return globalThis.__AWTSMOOS_GLB_PROMISES; }
function sceneFrom(gltf) { const root = gltf && gltf.scene ? gltf.scene : gltf && gltf.scenes && gltf.scenes[0] ? gltf.scenes[0] : null; if (!root) throw new Error("GLB loaded without scene root"); root.animations = gltf.animations || []; return root; }
export function loadGlb(path) {
  const promises = cache(); if (promises.has(path)) return promises.get(path);
  const promise = new Promise((resolve, reject) => { LOADER.load(path, gltf => resolve(sceneFrom(gltf)), () => {}, error => { promises.delete(path); reject(error); }); });
  promises.set(path, promise); return promise;
}
export default loadGlb;
