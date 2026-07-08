
/**
 * B"H
 * @file DoorMeshFactory.js
 * @description
 * Creates real visible house door meshes.
 */

import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Creates material.
 *
 * @returns {any}
 * Material.
 */
function createDoorMaterial() {
  const Ctor = THREE.MeshLambertMaterial || THREE.MeshBasicMaterial;
  return new Ctor({ color: 0x4a1f0b });
}

/**
 * B"H
 * Creates door mesh.
 *
 * @param {Object} options
 * Options.
 *
 * @returns {any}
 * Door mesh.
 */
export function createDoorMesh(options = {}) {
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(options.width || 1.25, options.height || 2.05, options.depth || 0.16),
    createDoorMaterial()
  );

  door.name = options.name || "mitzvah-world-real-door";
  door.userData.isDoor = true;
  door.userData.interactable = true;

  return door;
}
