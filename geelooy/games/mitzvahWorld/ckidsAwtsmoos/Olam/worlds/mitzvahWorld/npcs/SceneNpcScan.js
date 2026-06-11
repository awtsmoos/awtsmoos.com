
/**
 * B"H
 * @file SceneNpcScan.js
 * @description
 * Counts only actual NPCs created by this system.
 */

/**
 * B"H
 * Checks whether object is one of our spawned NPC roots.
 *
 * @param {any} object
 * Object3D.
 *
 * @returns {boolean}
 * True when object is a spawned NPC root.
 */
export function isSpawnedNpcRoot(object) {
  const name = String(object?.name || "");
  return Boolean(
    object?.userData?.mitzvahWorldNpcRoot === true ||
    object?.userData?.isNpc === true ||
    object?.userData?.awtsmoosVillageGuide === true ||
    object?.nivraAwtsmoos?.type === "interactiveNpc" ||
    name.startsWith("npc_")
  );
}

/**
 * B"H
 * Counts spawned NPC roots.
 *
 * @param {any} scene
 * Scene.
 *
 * @returns {number}
 * Count.
 */
export function countSpawnedNpcRoots(scene) {
  let count = 0;

  if (!scene || typeof scene.traverse !== "function") return 0;

  scene.traverse(child => {
    if (isSpawnedNpcRoot(child)) count++;
  });

  return count;
}
