
/**
 * B"H
 * @file NpcMaterialTools.js
 * @description
 * NPC material utilities.
 */

/**
 * B"H
 * Makes a material safely.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {number} color
 * Color.
 *
 * @returns {any}
 * Material.
 */
export function makeNpcMaterial(THREE, color) {
  const Ctor =
    THREE.MeshStandardMaterial ||
    THREE.MeshLambertMaterial ||
    THREE.MeshPhongMaterial ||
    THREE.MeshBasicMaterial;

  if (!Ctor) {
    throw new Error("No usable material constructor for NPC");
  }

  const options = { color };

  if (Ctor === THREE.MeshStandardMaterial) {
    options.roughness = 0.85;
    options.metalness = 0;
  }

  return new Ctor(options);
}

/**
 * B"H
 * Applies color to meshes whose names match.
 *
 * @param {any} root
 * Root object.
 *
 * @param {string[]} names
 * Name fragments.
 *
 * @param {any} material
 * Material.
 *
 * @returns {void}
 */
export function applyMaterialByName(root, names, material) {
  if (!root || typeof root.traverse !== "function") return;

  root.traverse(child => {
    const lower = String(child.name || "").toLowerCase();

    if (child.isMesh && names.some(name => lower.includes(name))) {
      child.material = material;
    }
  });
}
