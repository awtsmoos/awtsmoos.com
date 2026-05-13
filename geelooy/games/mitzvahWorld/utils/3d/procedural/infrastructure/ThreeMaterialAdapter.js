
/**
 * B"H
 * @file ThreeMaterialAdapter.js
 * @description
 * Safe material constructor resolver.
 *
 * Fixes:
 * THREE.MeshStandardMaterial is not a constructor
 *
 * Some procedural builders receive a narrowed THREE-like object, or a worker-safe
 * adapter, where MeshStandardMaterial is absent. Roads do not need to crash
 * because of that. They can fall back to Lambert or Basic materials.
 */

/**
 * B"H
 * Gets a usable material constructor from the provided THREE namespace.
 *
 * @param {any} THREE
 * THREE namespace or compatible object.
 *
 * @returns {Function}
 * Usable material constructor.
 */
export function getUsableMeshMaterial(THREE) {
  if (THREE && typeof THREE.MeshStandardMaterial === "function") {
    return THREE.MeshStandardMaterial;
  }

  if (THREE && typeof THREE.MeshLambertMaterial === "function") {
    return THREE.MeshLambertMaterial;
  }

  if (THREE && typeof THREE.MeshPhongMaterial === "function") {
    return THREE.MeshPhongMaterial;
  }

  if (THREE && typeof THREE.MeshBasicMaterial === "function") {
    return THREE.MeshBasicMaterial;
  }

  throw new Error("No usable THREE mesh material constructor found");
}

/**
 * B"H
 * Converts roughness/metalness data into material options only when supported.
 *
 * @param {Function} MaterialCtor
 * Material constructor.
 *
 * @param {Object} data
 * Material data.
 *
 * @returns {Object}
 * Safe material options.
 */
export function makeSafeMaterialOptions(MaterialCtor, data) {
  const name = MaterialCtor?.name || "";

  if (name.includes("Standard") || name.includes("Physical")) {
    return {
      color: data.color,
      roughness: data.roughness ?? 0.85,
      metalness: data.metalness ?? 0
    };
  }

  return {
    color: data.color
  };
}
