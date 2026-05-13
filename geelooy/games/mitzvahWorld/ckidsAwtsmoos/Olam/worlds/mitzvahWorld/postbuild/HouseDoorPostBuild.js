
/**
 * B"H
 * @file HouseDoorPostBuild.js
 * @description
 * Ensures houses have visible doors.
 */

import { createHouseDoorMesh } from "./HouseDoorMesh.js";
import { isLikelyHouse, getHouseObject3D, hasDoorChild } from "./HouseDetector.js";

/**
 * B"H
 * Adds door to one house if missing.
 *
 * @param {any} house
 * House.
 *
 * @returns {void}
 * Nothing.
 */
function addDoorIfMissing(house) {
  const root = getHouseObject3D(house);

  if (!root || typeof root.add !== "function") return;
  if (hasDoorChild(root)) return;

  const door = createHouseDoorMesh({
    name: `${root.name || "house"}-auto-door`
  });

  root.add(door);
}

/**
 * B"H
 * Ensures all likely houses have doors.
 *
 * @param {Object} context
 * Context.
 *
 * @returns {Promise<void>}
 * Nothing.
 */
export async function ensureHouseDoors(context) {
  const nivrayim = context?.nivrayim || [];

  for (const nivra of nivrayim) {
    if (isLikelyHouse(nivra)) {
      addDoorIfMissing(nivra);
    }
  }
}
