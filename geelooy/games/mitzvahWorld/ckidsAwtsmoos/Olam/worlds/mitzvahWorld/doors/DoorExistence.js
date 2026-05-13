
/**
 * B"H
 * @file DoorExistence.js
 * @description
 * Door existence checks.
 */

/**
 * B"H
 * Checks if a house already has one of our real doors.
 *
 * @param {any} scene
 * Scene.
 *
 * @param {string} houseName
 * House name.
 *
 * @returns {boolean}
 * True if door exists.
 */
export function hasGeneratedDoorForHouse(scene, houseName) {
  let found = false;
  const key = `door_for_${houseName}`;

  scene.traverse(child => {
    if (child?.userData?.doorHouseKey === key) found = true;
  });

  return found;
}
