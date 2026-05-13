
/**
 * B"H
 * @file EnsureHouseDoors.js
 * @description
 * Ensures visible doors are actually present on houses.
 */

import { findLikelyHouses } from "./HouseScan.js";
import { createDoorMesh } from "./DoorMeshFactory.js";
import { getDoorPlacementForHouse } from "./DoorPlacement.js";
import { hasGeneratedDoorForHouse } from "./DoorExistence.js";

/**
 * B"H
 * Adds a visible door for a house.
 *
 * @param {any} scene
 * Scene.
 *
 * @param {any} house
 * House.
 *
 * @returns {any|null}
 * Door or null.
 */
function addDoorForHouse(scene, house) {
  const houseName = house.name || `house_${Math.random().toString(36).slice(2)}`;

  if (hasGeneratedDoorForHouse(scene, houseName)) {
    return null;
  }

  const placement = getDoorPlacementForHouse(house);

  const door = createDoorMesh({
    name: `door_for_${houseName}`,
    width: placement.width,
    height: placement.height,
    depth: placement.depth
  });

  door.position.copy(placement.position);
  door.rotation.copy(placement.rotation);
  door.userData.doorHouseKey = `door_for_${houseName}`;

  scene.add(door);
  return door;
}

/**
 * B"H
 * Ensures doors are visible.
 *
 * @param {Object} context
 * Context.
 *
 * @returns {Promise<any[]>}
 * Added doors.
 */
export async function ensureHouseDoors(context) {
  const scene = context?.scene || context?.olam?.scene;

  if (!scene) {
    throw new Error("Cannot ensure doors without scene");
  }

  const doors = [];

  for (const house of findLikelyHouses(scene)) {
    const door = addDoorForHouse(scene, house);
    if (door) doors.push(door);
  }

  return doors;
}
