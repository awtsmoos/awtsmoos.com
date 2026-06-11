
/**
 * B"H
 * @file ChossidNpcClone.js
 * @description
 * Clones the loaded chossid.glb scene for NPC use.
 */
import * as SkeletonUtils from '/games/scripts/jsm/utils/SkeletonUtils.js';
import { sanitizeLivingModelTree } from "./LivingModelSanitizer.js";

/**
 * B"H
 * Clones a loaded chossid GLTF scene.
 *
 * @param {Object} gltf
 * Loaded GLTF.
 *
 * @returns {Object}
 * Cloned Object3D.
 */
export function cloneChossidNpcScene(gltf) {
  const source = gltf?.scene || gltf?.scenes?.[0];

  if (!source || typeof source.clone !== "function") {
    throw new Error("Loaded chossid.glb does not contain a cloneable scene");
  }

  const clone = SkeletonUtils.clone(source);

  if (!clone.userData) clone.userData = {};
  clone.userData.isLiving = true;
  clone.userData.isNpc = true;
  clone.userData.skipOctree = true;
  clone.userData.noOctree = true;

  sanitizeLivingModelTree(clone, { isNpc: true });

  clone.traverse(child => {
    if (!child.userData) child.userData = {};
    child.userData.isLiving = true;
    child.userData.isNpc = true;
    child.userData.skipOctree = true;
    child.userData.noOctree = true;

    if (!child?.isMesh && !child?.isSkinnedMesh) return;

    child.castShadow = false;
    child.receiveShadow = true;
    child.userData.isNpcPart = true;
  });

  return clone;
}
