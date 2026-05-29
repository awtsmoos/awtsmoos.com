// B"H
/**
 * @file aabb.js
 * @description Chapter 57: The Awtsmoos teaches the box to speak plainly.
 * No triangles, no rays, no hidden geometry court: only min, max, and truth.
 */

/**
 * Builds an AABB from a center and half extents.
 * @param {{x:number,y:number,z:number}} position Center of the body.
 * @param {{x:number,y:number,z:number}} halfExtents Half size on each axis.
 * @returns {{minX:number,maxX:number,minY:number,maxY:number,minZ:number,maxZ:number}}
 */
export function boxFromCenter(position, halfExtents) {
  return {
    minX: position.x - halfExtents.x,
    maxX: position.x + halfExtents.x,
    minY: position.y - halfExtents.y,
    maxY: position.y + halfExtents.y,
    minZ: position.z - halfExtents.z,
    maxZ: position.z + halfExtents.z
  };
}

/**
 * Builds the full swept AABB between two body poses.
 * @param {{x:number,y:number,z:number}} previousPosition Previous center.
 * @param {{x:number,y:number,z:number}} position Current center.
 * @param {{x:number,y:number,z:number}} halfExtents Half size on each axis.
 * @returns {{sweptMinX:number,sweptMaxX:number,sweptMinY:number,sweptMaxY:number,sweptMinZ:number,sweptMaxZ:number}}
 */
export function sweptBox(previousPosition, position, halfExtents) {
  return {
    sweptMinX: Math.min(previousPosition.x, position.x) - halfExtents.x,
    sweptMaxX: Math.max(previousPosition.x, position.x) + halfExtents.x,
    sweptMinY: Math.min(previousPosition.y, position.y) - halfExtents.y,
    sweptMaxY: Math.max(previousPosition.y, position.y) + halfExtents.y,
    sweptMinZ: Math.min(previousPosition.z, position.z) - halfExtents.z,
    sweptMaxZ: Math.max(previousPosition.z, position.z) + halfExtents.z
  };
}

/**
 * Tests strict AABB overlap.
 * @param {object} a First min/max box.
 * @param {object} b Second min/max box.
 * @returns {boolean} True when volumes overlap on all axes.
 */
export function boxesOverlap(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX &&
    a.minY < b.maxY && a.maxY > b.minY &&
    a.minZ < b.maxZ && a.maxZ > b.minZ;
}

/**
 * Tests whether a point is inside a precomputed route broadphase.
 * @param {{x:number,z:number}} point Player or probe point.
 * @param {{minX:number,maxX:number,minZ:number,maxZ:number}} pathBox Route bounds.
 * @returns {boolean} True when detailed collision is worth doing.
 */
export function pointInPathBox(point, pathBox) {
  return point.x >= pathBox.minX && point.x <= pathBox.maxX &&
    point.z >= pathBox.minZ && point.z <= pathBox.maxZ;
}
