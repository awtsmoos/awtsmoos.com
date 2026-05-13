
/**
 * B"H
 * @file RoadLaneMarks.js
 * @description
 * Lane mark generator.
 */

import { createCurbGeometry } from "./RoadSegmentGeometry.js";

/**
 * B"H
 * Creates dashed lane marks.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Road options.
 *
 * @param {any} material
 * Lane material.
 *
 * @returns {any[]}
 * Lane mark meshes.
 */
export function createLaneMarks(THREE, options, material) {
  const marks = [];
  const span = options.length / 2;
  let z = -span + options.laneLength / 2;

  while (z < span) {
    const mesh = new THREE.Mesh(
      createCurbGeometry(THREE, {
        width: options.laneWidth,
        height: 0.035,
        length: options.laneLength
      }),
      material
    );

    mesh.name = `${options.name}-lane-mark-${marks.length}`;
    mesh.position.set(0, options.depth / 2 + options.laneYOffset, z);
    marks.push(mesh);

    z += options.laneLength + options.laneGap;
  }

  return marks;
}
