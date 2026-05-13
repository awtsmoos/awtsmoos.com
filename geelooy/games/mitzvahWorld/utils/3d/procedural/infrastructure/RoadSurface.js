
/**
 * B"H
 * @file RoadSurface.js
 * @description
 * Road surface mesh builder.
 */

import { createRoadSegmentGeometry } from "./RoadSegmentGeometry.js";

/**
 * B"H
 * Creates the main asphalt road mesh.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Road options.
 *
 * @param {any} material
 * Asphalt material.
 *
 * @returns {any}
 * Road mesh.
 */
export function createRoadSurface(THREE, options, material) {
  const road = new THREE.Mesh(
    createRoadSegmentGeometry(THREE, options),
    material
  );

  road.name = `${options.name}-surface`;
  road.position.set(0, options.depth / 2, 0);

  if (road.receiveShadow !== undefined) {
    road.receiveShadow = true;
  }

  return road;
}
