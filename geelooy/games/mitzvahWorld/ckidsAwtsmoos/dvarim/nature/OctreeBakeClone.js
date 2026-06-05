// B"H
/**
 * @file OctreeBakeClone.js
 * @description
 * Chapter 150: The hidden wall leaves its skipped parent behind.
 *
 * The Awtsmoos reveals a narrow law: visual groups may be forbidden from the
 * octree, while their children are pure collision. Three.js still remembers the
 * parent chain, so the octree guard sees `skipOctree` above the child and says
 * no. This helper bakes each child into a temporary world-space clone with no
 * parent, so only the honest collision body is judged.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const ACTIVE_FLAGS = Object.freeze({
  isSolid: true,
  explicitCollision: true,
  collisionBody: true,
  addToOctree: true,
  skipOctree: false,
  noOctree: false,
  finalOctreeOnly: true
});

/**
 * Bakes a mesh into the world octree as a detached world-space clone.
 *
 * @param {THREE.Mesh} mesh The authored collision mesh inside a skipped group.
 * @param {object} olam The world vessel containing `worldOctree`.
 * @param {Array<THREE.Mesh>} added The registry of baked clones to remove later.
 * @returns {boolean} True when the octree accepted the clone.
 */
export function bakeDetachedCollider(mesh, olam, added) {
  if (!mesh?.isMesh || !mesh.geometry || !olam?.worldOctree) return false;
  mesh.updateMatrixWorld(true);
  const clone = new THREE.Mesh(mesh.geometry.clone(), mesh.material?.clone?.() || mesh.material);
  clone.name = `${mesh.name}_detached_octree_body`;
  clone.matrixAutoUpdate = false;
  clone.matrix.copy(mesh.matrixWorld);
  clone.matrixWorld.copy(mesh.matrixWorld);
  clone.userData = { ...(mesh.userData || {}), ...ACTIVE_FLAGS, visualReference: mesh };
  clone.nivraAwtsmoos = mesh.nivraAwtsmoos;
  delete clone.userData.skipRaycast;
  const accepted = Boolean(olam.worldOctree.addObject(clone));
  if (accepted) added.push(clone);
  else clone.geometry?.dispose?.();
  return accepted;
}

/**
 * Removes previously baked detached collision clones.
 *
 * @param {object} olam The world vessel containing `worldOctree`.
 * @param {Array<THREE.Mesh>} meshes Detached meshes returned by baking.
 * @returns {void}
 */
export function removeDetachedColliders(olam, meshes = []) {
  if (!olam?.worldOctree) return;
  for (const mesh of meshes) {
    olam.worldOctree.removeMesh?.(mesh);
    mesh.geometry?.dispose?.();
  }
}
