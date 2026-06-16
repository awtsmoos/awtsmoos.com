// B"H
/**
 * @file EnsureHouseDoors.js
 * @description Ensures visible parser-clear doors are actually present on houses.
 */
import { scanHouses } from "./HouseScan.js?v=awtsmoos-house-scan-20260614-bh2";
import { createDoorMesh } from "./DoorMeshFactory.js";
import { getDoorPlacementForHouse } from "./DoorPlacement.js";
import { hasDoorForHouse } from "./DoorExistence.js?v=awtsmoos-door-existence-20260614-bh2";
function sceneOf(context) { const olam = context && context.olam ? context.olam : null; return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
function houseName(house, index) { return house && house.name ? house.name : `house_${index}`; }
function keyHouse(name) { return { name }; }
function markDoor(door, name) { if (!door.userData) door.userData = {}; door.userData.doorHouseKey = name; door.userData.generatedHouseDoor = true; door.userData.skipOctree = false; door.userData.isSolid = true; }
function addDoorForHouse(scene, house, index) {
  const name = houseName(house, index);
  if (hasDoorForHouse(scene, keyHouse(name))) return null;
  const placement = getDoorPlacementForHouse(house);
  const door = createDoorMesh({ name:`door_for_${name}`, width:placement.width, height:placement.height, depth:placement.depth });
  door.position.copy(placement.position); door.rotation.copy(placement.rotation); markDoor(door, name); scene.add(door); return door;
}
export async function ensureHouseDoors(context = {}) {
  const scene = sceneOf(context); if (!scene) throw new Error("Cannot ensure doors without scene");
  const doors = []; const houses = scanHouses(scene);
  houses.forEach((house, index) => { const door = addDoorForHouse(scene, house, index); if (door) doors.push(door); });
  return doors;
}
