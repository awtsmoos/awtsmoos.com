
/**
 * B"H
 * @file LeafMesh.js
 * @description
 * Leaf mesh builder.
 */

import { normalizeLeafOptions } from "./LeafShapeData.js";
import { createLeafGeometry, createLeafVeinGeometry } from "./LeafGeometry.js";
import { createLeafMaterial } from "./LeafMaterial.js";
import { assertLeafThree } from "../infrastructure/ThreeNamespaceGuard.js";

/**
 * B"H
 * Creates one leaf mesh.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Leaf options.
 *
 * @returns {any}
 * Leaf group.
 */
export function createLeafMesh(THREE, options = {}) {
  assertLeafThree(THREE);

  const leafOptions = normalizeLeafOptions(options);
  const group = new THREE.Group();
  group.name = leafOptions.name || "leaf";

  const leaf = new THREE.Mesh(
    createLeafGeometry(THREE, leafOptions),
    createLeafMaterial(THREE, leafOptions)
  );

  leaf.name = `${group.name}-blade`;

  if (leaf.castShadow !== undefined) leaf.castShadow = true;
  if (leaf.receiveShadow !== undefined) leaf.receiveShadow = true;

  group.add(leaf);

  const veinGeometry = createLeafVeinGeometry(THREE, leafOptions);

  if (veinGeometry) {
    const vein = new THREE.Mesh(
      veinGeometry,
      createLeafMaterial(THREE, {
        ...leafOptions,
        color: leafOptions.veinColor || 0x0b4f1d
      })
    );

    vein.name = `${group.name}-vein`;
    vein.position.z = 0.012;
    group.add(vein);
  }

  return group;
}
