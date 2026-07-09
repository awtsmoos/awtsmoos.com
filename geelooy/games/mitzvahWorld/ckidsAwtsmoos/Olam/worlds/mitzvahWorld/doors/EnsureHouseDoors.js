// B"H
/** @file EnsureHouseDoors.js @description Ensures visible parser-clear doors are present without blocking thresholds. */
import { scanHouses } from "./HouseScan.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { createDoorMesh } from "./DoorMeshFactory.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { getDoorPlacementForHouse } from "./DoorPlacement.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { hasDoorForHouse } from "./DoorExistence.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function sceneOf(context) { const olam = context && context.olam ? context.olam : null; return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
function houseName(house, index) { return house && house.name ? house.name : `house_${index}`; }
function keyHouse(name) { return { name }; }
function markDoor(door, name) { Object.assign(door.userData ||= {}, { doorHouseKey:name, generatedHouseDoor:true, skipOctree:true, noOctree:true, addToOctree:false, isSolid:false, passableDoorway:true, doorwayThresholdPassable:true, visibleDoorMeshNoCollider:true }); }
function addDoorForHouse(scene, house, index) { const name = houseName(house, index); if (hasDoorForHouse(scene, keyHouse(name))) return null; const placement = getDoorPlacementForHouse(house); const door = createDoorMesh({ name:`door_for_${name}`, width:placement.width, height:placement.height, depth:placement.depth }); door.position.copy(placement.position); door.rotation.copy(placement.rotation); markDoor(door, name); scene.add(door); return door; }
export async function ensureHouseDoors(context = {}) { const scene = sceneOf(context); if (!scene) throw new Error("Cannot ensure doors without scene"); const doors = [], houses = scanHouses(scene); houses.forEach((house, index) => { const door = addDoorForHouse(scene, house, index); if (door) doors.push(door); }); globalThis.__AWTS_PASSABLE_DOOR_PROOF__ = { doors:doors.length, seal:"full-chain-cache-bust-20260708-bh10" }; return doors; }
