// B"H
/**
 * @file grounding.js
 * @description
 * Chapter 4: The Awtsmoos writes gravity into every village vessel. A prop may
 * arrive with confused origins, nested meshes, rotations, or scaled limbs, but
 * this file measures its whole visible body and lowers it until the lowest atom
 * kisses the named earth. Nothing floats unless the JSON explicitly asks it to.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const DEFAULT_GROUND_Y = 0;
const DEFAULT_LIFT = 0;

/** @param {*} value Candidate number. @param {number} fallback Safe fallback. @returns {number} */
function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/** @param {*} root Possible THREE root. @returns {THREE.Box3|null} */
function measuredBox(root) {
  if (!root?.updateMatrixWorld) return null;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  return Number.isFinite(box.min.y) && Number.isFinite(box.max.y) ? box : null;
}

/**
 * Resolves the exact ground plane for flat authored village routes.
 *
 * @param {object} options Grounding options from JSON/runtime.
 * @returns {number} Ground Y plane.
 */
export function resolveGroundY(options = {}) {
  if (options.skipAutoGround) return null;
  return finite(options.groundY ?? options.worldGroundY, DEFAULT_GROUND_Y);
}

/**
 * Snaps a root object to the configured ground plane by its visual bounds.
 *
 * @param {THREE.Object3D} root Object to ground.
 * @param {object} options JSON/runtime grounding options.
 * @returns {{grounded:boolean, groundY:number|null, lift:number, deltaY:number}}
 */
export function groundPictureProp(root, options = {}) {
  const groundY = resolveGroundY(options);
  if (groundY === null) return { grounded: false, groundY, lift: 0, deltaY: 0 };
  const box = measuredBox(root);
  if (!box) return { grounded: false, groundY, lift: 0, deltaY: 0 };
  const lift = finite(options.groundLift, DEFAULT_LIFT);
  const deltaY = groundY + lift - box.min.y;
  root.position.y += deltaY;
  root.userData ||= {};
  root.userData.awtsmoosGrounding = { groundY, lift, deltaY, minYBefore: box.min.y };
  root.updateMatrixWorld(true);
  return { grounded: true, groundY, lift, deltaY };
}
