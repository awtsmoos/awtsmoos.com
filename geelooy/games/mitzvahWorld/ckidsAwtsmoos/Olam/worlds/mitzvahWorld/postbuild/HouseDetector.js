
/**
 * B"H
 * @file HouseDetector.js
 * @description
 * Finds likely houses in built objects.
 */

/**
 * B"H
 * Checks if object looks like a house.
 *
 * @param {any} object
 * Object.
 *
 * @returns {boolean}
 * True if likely house.
 */
export function isLikelyHouse(object) {
  const name = String(object?.name || object?.id || "").toLowerCase();
  const type = String(object?.type || "").toLowerCase();

  return (
    name.includes("house") ||
    name.includes("home") ||
    name.includes("hut") ||
    type.includes("house") ||
    type.includes("home") ||
    type.includes("hut")
  );
}

/**
 * B"H
 * Gets house mesh/group from a nivra.
 *
 * @param {any} house
 * House object.
 *
 * @returns {any|null}
 * Visual object.
 */
export function getHouseObject3D(house) {
  return house?.mesh || house?.group || house?.object3D || house || null;
}

/**
 * B"H
 * Checks whether a house already has a door-like child.
 *
 * @param {any} root
 * House object.
 *
 * @returns {boolean}
 * True if door exists.
 */
export function hasDoorChild(root) {
  if (!root || typeof root.traverse !== "function") return false;

  let found = false;

  root.traverse(child => {
    const name = String(child?.name || "").toLowerCase();

    if (name.includes("door")) {
      found = true;
    }
  });

  return found;
}
