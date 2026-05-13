
/**
 * B"H
 * @file LeafClusterData.js
 * @description
 * Leaf cluster data.
 */

/**
 * B"H
 * Default cluster settings.
 */
export const LEAF_CLUSTER_DEFAULTS = Object.freeze({
  count: 18,
  radius: 1.2,
  heightSpread: 0.8,
  leafScaleMin: 0.7,
  leafScaleMax: 1.35
});

/**
 * B"H
 * Normalizes cluster options.
 *
 * @param {Object} options
 * Options.
 *
 * @returns {Object}
 * Normalized options.
 */
export function normalizeLeafClusterOptions(options = {}) {
  return {
    ...LEAF_CLUSTER_DEFAULTS,
    ...options
  };
}
