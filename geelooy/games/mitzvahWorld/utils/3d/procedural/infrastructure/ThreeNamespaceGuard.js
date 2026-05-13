
/**
 * B"H
 * @file ThreeNamespaceGuard.js
 * @description
 * Verifies the tiny subset of THREE required by infrastructure builders.
 */

/**
 * B"H
 * Ensures THREE contains enough constructors for road assembly.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @returns {void}
 */
export function assertRoadThree(THREE) {
  const missing = [];

  if (!THREE) missing.push("THREE");
  if (THREE && typeof THREE.Group !== "function") missing.push("THREE.Group");
  if (THREE && typeof THREE.Mesh !== "function") missing.push("THREE.Mesh");
  if (THREE && typeof THREE.BoxGeometry !== "function") missing.push("THREE.BoxGeometry");

  if (missing.length) {
    throw new Error(`RoadAssembler missing required THREE constructors: ${missing.join(", ")}`);
  }
}

/**
 * B"H
 * Ensures THREE contains enough constructors for leaf assembly.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @returns {void}
 */
export function assertLeafThree(THREE) {
  const missing = [];

  if (!THREE) missing.push("THREE");
  if (THREE && typeof THREE.Mesh !== "function") missing.push("THREE.Mesh");
  if (THREE && typeof THREE.Group !== "function") missing.push("THREE.Group");

  if (missing.length) {
    throw new Error(`Leaf builder missing required THREE constructors: ${missing.join(", ")}`);
  }
}
