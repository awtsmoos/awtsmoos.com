
/**
 * B"H
 * @file LeafCluster.js
 * @description
 * Organic leaf cluster builder.
 */

import { createLeafMesh } from "./LeafMesh.js";
import { normalizeLeafClusterOptions } from "./LeafClusterData.js";

/**
 * B"H
 * Makes a deterministic pseudo-random value.
 *
 * @param {number} index
 * Index.
 *
 * @param {number} seed
 * Seed.
 *
 * @returns {number}
 * 0 to 1 value.
 */
function seeded(index, seed) {
  const x = Math.sin(index * 9127.131 + seed * 131.77) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * B"H
 * Creates a cluster of leaf-shaped meshes.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Options.
 *
 * @returns {any}
 * THREE.Group.
 */
export function createLeafCluster(THREE, options = {}) {
  const clusterOptions = normalizeLeafClusterOptions(options);
  const group = new THREE.Group();
  group.name = clusterOptions.name || "leaf-cluster";

  for (let i = 0; i < clusterOptions.count; i++) {
    const angle = seeded(i, 1) * Math.PI * 2;
    const radius = seeded(i, 2) * clusterOptions.radius;
    const y = (seeded(i, 3) - 0.5) * clusterOptions.heightSpread;
    const scale = clusterOptions.leafScaleMin +
      seeded(i, 4) * (clusterOptions.leafScaleMax - clusterOptions.leafScaleMin);

    const leaf = createLeafMesh(THREE, {
      name: `${group.name}-leaf-${i}`,
      color: clusterOptions.color || (i % 3 === 0 ? 0x1b7f35 : 0x10692c),
      width: clusterOptions.leafWidth || 0.42,
      length: clusterOptions.leafLength || 0.92
    });

    leaf.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );

    leaf.rotation.set(
      seeded(i, 5) * Math.PI,
      angle,
      (seeded(i, 6) - 0.5) * Math.PI * 0.8
    );

    leaf.scale.setScalar(scale);
    group.add(leaf);
  }

  return group;
}
