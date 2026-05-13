
/**
 * B"H
 * @file RoadSegmentGeometry.js
 * @description
 * Pure road geometry helpers.
 *
 * This file is intentionally small.
 * RoadAssembler should not be a giant beast.
 */

/**
 * B"H
 * Creates a box geometry for a road segment.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Road options.
 *
 * @param {number} options.width
 * Width.
 *
 * @param {number} options.length
 * Length.
 *
 * @param {number} options.depth
 * Depth.
 *
 * @returns {any}
 * THREE.BoxGeometry.
 */
export function createRoadSegmentGeometry(THREE, options) {
  return new THREE.BoxGeometry(
    options.width,
    options.depth,
    options.length
  );
}

/**
 * B"H
 * Creates a rounded curb geometry.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Curb options.
 *
 * @param {number} options.width
 * Curb width.
 *
 * @param {number} options.height
 * Curb height.
 *
 * @param {number} options.length
 * Curb length.
 *
 * @returns {any}
 * THREE.BoxGeometry.
 */
export function createCurbGeometry(THREE, options) {
  return new THREE.BoxGeometry(
    options.width,
    options.height,
    options.length
  );
}
