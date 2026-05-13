
/**
 * B"H
 * @file TreeParts.js
 * @description
 * Procedural tree part builders.
 */

import { resolveThreeNamespace } from "../infrastructure/ThreeNamespaceResolver.js";
import { createLeafCluster } from "./LeafCluster.js";

/**
 * B"H
 * Creates a safe material.
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
function makeMaterial(THREE, color) {
  const Ctor =
    THREE.MeshLambertMaterial ||
    THREE.MeshPhongMaterial ||
    THREE.MeshBasicMaterial;

  return new Ctor({ color });
}

/**
 * B"H
 * Creates trunk mesh.
 *
 * @param {any} threeOrContext
 * THREE namespace or context.
 *
 * @param {Object} options
 * Tree options.
 *
 * @returns {any}
 * Trunk mesh.
 */
export function createTreeTrunk(threeOrContext, options = {}) {
  const THREE = resolveThreeNamespace(threeOrContext);
  const radius = options.trunkRadius ?? 0.28;
  const height = options.trunkHeight ?? 4;

  const geometry = typeof THREE.CylinderGeometry === "function"
    ? new THREE.CylinderGeometry(radius * 0.75, radius, height, 10)
    : new THREE.BoxGeometry(radius * 2, height, radius * 2);

  const trunk = new THREE.Mesh(
    geometry,
    makeMaterial(THREE, options.trunkColor ?? 0x4a2b12)
  );

  trunk.name = `${options.name || "tree"}-trunk`;
  trunk.position.y = height / 2;

  return trunk;
}

/**
 * B"H
 * Creates shaped foliage.
 *
 * @param {any} threeOrContext
 * THREE namespace or context.
 *
 * @param {Object} options
 * Tree options.
 *
 * @returns {any}
 * Foliage group.
 */
export function createTreeFoliage(threeOrContext, options = {}) {
  const foliage = createLeafCluster(threeOrContext, {
    name: `${options.name || "tree"}-foliage`,
    count: options.leafCount ?? 64,
    radius: options.foliageRadius ?? 2.2,
    heightSpread: options.foliageHeightSpread ?? 1.8,
    leafWidth: options.leafWidth ?? 0.38,
    leafLength: options.leafLength ?? 0.86,
    leafScaleMin: 0.55,
    leafScaleMax: 1.25
  });

  foliage.position.y = options.foliageY ?? 4.25;

  return foliage;
}
