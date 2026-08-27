// B"H
/**
 * @file decor.js
 * @description
 * Chapter 13: The Awtsmoos separates beauty from collision.
 * These helpers mark visual meshes as harmless decoration so later cinematic
 * systems can add richness without poisoning the octree or mobile raycasts.
 */

/**
 * Mark a root object and all children as visual-only village decoration.
 * @template T
 * @param {T & { traverse?: Function, userData?: Object }} root
 * @returns {T} Same root for chaining.
 */
export function markDecorative(root) {
  root?.traverse?.(child => Object.assign(child.userData ||= {}, {
    skipOctree: true,
    noOctree: true,
    skipRaycast: true,
    villageDecor: true,
    useAuthoredY: true
  }));
  return root;
}

/**
 * Finish instanced meshes after matrix/color writes.
 * @param {Array} meshes Instanced meshes.
 * @returns {void}
 */
export function finishInstanced(meshes) {
  for (const mesh of meshes) {
    if (!mesh) continue;
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingBox?.();
    mesh.computeBoundingSphere?.();
    mesh.frustumCulled = true;
  }
}
