
/**
 * B"H
 * @file LeafShapeData.js
 * @description
 * Data for actual leaf shapes instead of ugly square planes.
 */

/**
 * B"H
 * Default leaf shape data.
 */
export const LEAF_SHAPE_DEFAULTS = Object.freeze({
  width: 0.55,
  length: 1.15,
  veinDepth: 0.018,
  color: 0x167832,
  roughness: 0.9,
  metalness: 0,
  side: "double"
});

/**
 * B"H
 * Merges leaf options.
 *
 * @param {Object} options
 * Input options.
 *
 * @returns {Object}
 * Leaf options.
 */
export function normalizeLeafOptions(options = {}) {
  return {
    ...LEAF_SHAPE_DEFAULTS,
    ...options
  };
}
