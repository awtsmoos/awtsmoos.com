
/**
 * B"H
 * @file LeafMaterial.js
 * @description
 * Safe leaf material builder.
 */

import {
  getUsableMeshMaterial,
  makeSafeMaterialOptions
} from "../infrastructure/ThreeMaterialAdapter.js";

/**
 * B"H
 * Gets THREE.DoubleSide if available.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @returns {any}
 * Side value.
 */
function getLeafSide(THREE) {
  return THREE?.DoubleSide ?? 2;
}

/**
 * B"H
 * Creates a leaf material.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Leaf options.
 *
 * @returns {any}
 * Material.
 */
export function createLeafMaterial(THREE, options) {
  const MaterialCtor = getUsableMeshMaterial(THREE);
  const safe = makeSafeMaterialOptions(MaterialCtor, {
    color: options.color,
    roughness: options.roughness,
    metalness: options.metalness
  });

  safe.side = getLeafSide(THREE);

  return new MaterialCtor(safe);
}
