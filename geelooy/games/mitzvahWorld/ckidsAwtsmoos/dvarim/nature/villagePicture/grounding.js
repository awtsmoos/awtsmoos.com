// B"H
/**
 * @file grounding.js
 * @description
 * Chapter 103: every decorative village vessel bows to the earth. The Awtsmoos
 * measures its bounding box after creation and lowers or raises it so the bottom
 * kisses the village ground instead of floating like an unfinished thought.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const DEFAULT_GROUND_Y = -0.2;

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/**
 * Snaps a root object to a ground plane using its visual bounding box.
 *
 * @param {THREE.Object3D} root
 * Object to ground.
 *
 * @param {object} options
 * Grounding options.
 *
 * @returns {void}
 */
export function groundPictureProp(root, options = {}) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (!Number.isFinite(box.min.y)) return;
  const groundY = finite(options.groundY, DEFAULT_GROUND_Y);
  const lift = finite(options.groundLift, 0);
  root.position.y += groundY + lift - box.min.y;
  root.updateMatrixWorld(true);
}
