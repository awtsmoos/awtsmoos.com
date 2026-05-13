
/**
 * B"H
 * @file RoadGroupTransform.js
 * @description
 * Applies final road transform.
 */

/**
 * B"H
 * Applies position and rotation to the road group.
 *
 * @param {any} group
 * THREE.Group.
 *
 * @param {Object} options
 * Normalized road options.
 *
 * @returns {any}
 * Same group.
 */
export function applyRoadGroupTransform(group, options) {
  group.position.set(
    options.position.x,
    options.position.y,
    options.position.z
  );

  group.rotation.set(
    options.rotation.x,
    options.rotation.y,
    options.rotation.z
  );

  return group;
}
