// B"H
/**
 * @file dynamicBodyRegistry.js
 * @description Chapter 57: Every moving body receives a name in the book of
 * motion. The Awtsmoos gathers them into `olam.dynamicBodies`, one light list.
 */

/**
 * Ensures the world owns exactly one dynamic body list.
 * @param {object} olam Runtime world.
 * @returns {Array<object>} Shared dynamic body array.
 */
export function ensureDynamicBodies(olam) {
  if (!olam) return [];
  if (!Array.isArray(olam.dynamicBodies)) olam.dynamicBodies = [];
  return olam.dynamicBodies;
}

/**
 * Adds a body once and keeps the list stable.
 * @param {object} olam Runtime world.
 * @param {object} body Dynamic body descriptor.
 * @returns {object} The registered body.
 */
export function registerDynamicBody(olam, body) {
  const list = ensureDynamicBodies(olam);
  if (body && !list.includes(body)) list.push(body);
  return body;
}

/**
 * Removes a body from the runtime list.
 * @param {object} olam Runtime world.
 * @param {object} body Dynamic body descriptor.
 * @returns {void}
 */
export function unregisterDynamicBody(olam, body) {
  const list = ensureDynamicBodies(olam);
  const index = list.indexOf(body);
  if (index >= 0) list.splice(index, 1);
}

/**
 * Updates the four required body vectors without replacing object identity.
 * @param {object} body Dynamic body descriptor.
 * @param {object} position Current center vector.
 * @param {object} previousPosition Previous center vector.
 * @returns {object} The same body with refreshed velocity.
 */
export function updateDynamicBody(body, position, previousPosition) {
  body.previousPosition.copy(previousPosition);
  body.position.copy(position);
  body.velocity.copy(position).sub(previousPosition);
  return body;
}
