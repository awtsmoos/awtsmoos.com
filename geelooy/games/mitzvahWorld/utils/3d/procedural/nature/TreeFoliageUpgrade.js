
/**
 * B"H
 * @file TreeFoliageUpgrade.js
 * @description
 * Replaces ugly square leaf planes with shaped leaf clusters when a tree group is available.
 */

import { createLeafCluster } from "./LeafCluster.js";

/**
 * B"H
 * Detects likely rectangular old leaf meshes.
 *
 * @param {any} object
 * THREE object.
 *
 * @returns {boolean}
 * True if likely an old leaf plane.
 */
function isLikelyOldLeafPlane(object) {
  const name = String(object?.name || "").toLowerCase();

  return Boolean(
    object &&
    object.isMesh &&
    (
      name.includes("leaf") ||
      name.includes("leaves") ||
      name.includes("foliage")
    ) &&
    object.geometry &&
    String(object.geometry.type || "").toLowerCase().includes("plane")
  );
}

/**
 * B"H
 * Removes old plane leaves and adds shaped leaf clusters.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {any} treeGroup
 * Tree group.
 *
 * @param {Object} options
 * Upgrade options.
 *
 * @returns {any}
 * Same tree group.
 */
export function upgradeTreeFoliage(THREE, treeGroup, options = {}) {
  if (!treeGroup || typeof treeGroup.traverse !== "function") return treeGroup;

  const oldLeaves = [];

  treeGroup.traverse(child => {
    if (isLikelyOldLeafPlane(child)) {
      oldLeaves.push(child);
    }
  });

  for (const oldLeaf of oldLeaves) {
    if (oldLeaf.parent) {
      oldLeaf.parent.remove(oldLeaf);
    }
  }

  const cluster = createLeafCluster(THREE, {
    name: `${treeGroup.name || "tree"}-shaped-foliage`,
    count: options.count || 42,
    radius: options.radius || 2.2,
    heightSpread: options.heightSpread || 2.0,
    leafWidth: options.leafWidth || 0.38,
    leafLength: options.leafLength || 0.85
  });

  cluster.position.set(
    options.x ?? 0,
    options.y ?? 3.2,
    options.z ?? 0
  );

  treeGroup.add(cluster);
  return treeGroup;
}
