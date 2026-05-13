
/**
 * B"H
 * @file ChossidNpcClone.js
 * @description
 * Clones the loaded chossid.glb scene for NPC use.
 */

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

  const clone = source.clone(true);

  clone.traverse(child => {
    if (!child?.isMesh) return;

    if (child.material && typeof child.material.clone === "function") {
      child.material = child.material.clone();
    }

    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.isNpcPart = true;
  });

  return clone;
}
