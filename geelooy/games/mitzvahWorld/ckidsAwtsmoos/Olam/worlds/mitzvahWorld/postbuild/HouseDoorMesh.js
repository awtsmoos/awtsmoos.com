
/**
 * B"H
 * @file HouseDoorMesh.js
 * @description
 * Door mesh builder for houses missing doors.
 */

import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

/**
 * B"H
 * Creates material.
 *
 * @param {number} color
 * Color.
 *
 * @returns {any}
 * Material.
 */
function makeDoorMaterial(color) {
  const Ctor = THREE.MeshLambertMaterial || THREE.MeshBasicMaterial;
  return new Ctor({ color });
}

/**
 * B"H
 * Creates a visible door mesh.
 *
 * @param {Object} options
 * Options.
 *
 * @returns {any}
 * Door mesh.
 */
export function createHouseDoorMesh(options = {}) {
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(
      options.width || 1.1,
      options.height || 1.9,
      options.depth || 0.12
    ),
    makeDoorMaterial(options.color || 0x5a2e12)
  );

  door.name = options.name || "working-house-door";
  door.position.set(
    options.x || 0,
    options.y ?? ((options.height || 1.9) / 2),
    options.z || -1.01
  );
  Object.assign(door.userData ||= {}, {
    isDoor: true,
    isSolid: options.solid !== false,
    explicitCollision: options.solid !== false,
    interactiveDoorFallback: true,
    isOpen: false,
    passableDoor: false,
    colliderSize: [options.width || 1.1, options.height || 1.9, options.depth || 0.12]
  });

  return door;
}
