
/**
 * B"H
 * @file ThreeNamespaceGuard.js
 * @description
 * THREE namespace guards.
 */

import { resolveThreeNamespace } from "./ThreeNamespaceResolver.js";

/**
 * B"H
 * Gets a valid THREE namespace for roads.
 *
 * @param {any} input
 * Possible THREE namespace.
 *
 * @returns {any}
 * Valid THREE namespace.
 */
export function getRoadThree(input) {
  const THREE = resolveThreeNamespace(input);
  const missing = [];

  if (!THREE) missing.push("THREE");
  if (THREE && typeof THREE.Group !== "function") missing.push("THREE.Group");
  if (THREE && typeof THREE.Mesh !== "function") missing.push("THREE.Mesh");
  if (THREE && typeof THREE.BoxGeometry !== "function") missing.push("THREE.BoxGeometry");

  if (missing.length) {
    throw new Error(`RoadAssembler missing required THREE constructors: ${missing.join(", ")}`);
  }

  return THREE;
}

/**
 * B"H
 * Gets a valid THREE namespace for leaves.
 *
 * @param {any} input
 * Possible THREE namespace.
 *
 * @returns {any}
 * Valid THREE namespace.
 */
export function getLeafThree(input) {
  const THREE = resolveThreeNamespace(input);
  const missing = [];

  if (!THREE) missing.push("THREE");
  if (THREE && typeof THREE.Group !== "function") missing.push("THREE.Group");
  if (THREE && typeof THREE.Mesh !== "function") missing.push("THREE.Mesh");

  if (missing.length) {
    throw new Error(`Leaf builder missing required THREE constructors: ${missing.join(", ")}`);
  }

  return THREE;
}

/**
 * B"H
 * Backwards compatibility.
 *
 * @param {any} input
 * Possible THREE namespace.
 *
 * @returns {void}
 */
export function assertRoadThree(input) {
  getRoadThree(input);
}

/**
 * B"H
 * Backwards compatibility.
 *
 * @param {any} input
 * Possible THREE namespace.
 *
 * @returns {void}
 */
export function assertLeafThree(input) {
  getLeafThree(input);
}
