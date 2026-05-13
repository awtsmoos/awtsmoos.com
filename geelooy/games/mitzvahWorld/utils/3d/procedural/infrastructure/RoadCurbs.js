
/**
 * B"H
 * @file RoadCurbs.js
 * @description
 * Curb mesh generator.
 */

import { createCurbGeometry } from "./RoadSegmentGeometry.js";

/**
 * B"H
 * Creates the two road curbs.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Road options.
 *
 * @param {any} material
 * Curb material.
 *
 * @returns {any[]}
 * Curb meshes.
 */
export function createCurbs(THREE, options, material) {
  const left = new THREE.Mesh(
    createCurbGeometry(THREE, {
      width: options.curbWidth,
      height: options.curbHeight,
      length: options.length
    }),
    material
  );

  const right = left.clone();

  left.name = `${options.name}-curb-left`;
  right.name = `${options.name}-curb-right`;

  left.position.set(
    -options.width / 2 - options.curbWidth / 2,
    options.curbHeight / 2,
    0
  );

  right.position.set(
    options.width / 2 + options.curbWidth / 2,
    options.curbHeight / 2,
    0
  );

  return [left, right];
}
