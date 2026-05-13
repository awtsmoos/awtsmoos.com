
/**
 * B"H
 * @file RoadDefaults.js
 * @description
 * Pure data defaults for road assembly.
 */

/**
 * B"H
 * Road defaults.
 */
export const ROAD_DEFAULTS = Object.freeze({
  name: "awtsmoos-road",
  width: 8,
  length: 40,
  depth: 0.18,
  curbWidth: 0.5,
  curbHeight: 0.32,
  laneWidth: 0.12,
  laneLength: 4,
  laneGap: 3,
  laneYOffset: 0.11,
  position: Object.freeze({
    x: 0,
    y: 0,
    z: 0
  }),
  rotation: Object.freeze({
    x: 0,
    y: 0,
    z: 0
  })
});

/**
 * B"H
 * Merges road options safely.
 *
 * @param {Object} options
 * User options.
 *
 * @returns {Object}
 * Merged options.
 */
export function normalizeRoadOptions(options = {}) {
  return {
    ...ROAD_DEFAULTS,
    ...options,
    position: {
      ...ROAD_DEFAULTS.position,
      ...(options.position || {})
    },
    rotation: {
      ...ROAD_DEFAULTS.rotation,
      ...(options.rotation || {})
    }
  };
}
