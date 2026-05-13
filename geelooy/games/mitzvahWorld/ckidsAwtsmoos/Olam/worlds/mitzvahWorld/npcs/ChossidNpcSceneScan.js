
/**
 * B"H
 * @file ChossidNpcSceneScan.js
 * @description
 * Detects whether chossid.glb NPCs already exist in the scene.
 */

/**
 * B"H
 * Counts NPC roots in a scene.
 *
 * @param {Object} scene
 * THREE.Scene.
 *
 * @returns {number}
 * NPC count.
 */
export function countChossidNpcs(scene) {
  let count = 0;

  if (!scene || typeof scene.traverse !== "function") {
    return 0;
  }

  scene.traverse(child => {
    if (child?.userData?.isNpc === true) {
      count++;
    }
  });

  return count;
}
