// B"H
/** @file CottageBrickBuilder.js @description Larger real cottage: shell, rooms, floor, and live door. */
import * as THREE from "/games/scripts/build/three.module.js";
import { COTTAGE_BRICK_PALETTE as P } from "./CottageBrickPalette.js";
import { addCottageWalls } from "./CottageBrickWalls.js?v=big-solid-house-rooms-20260702-bh12";
import { addCottageBeams, addCottageWindows } from "./CottageBrickDetails.js?v=actual-solid-house-20260702-bh5";
import { buildCottageDoor } from "./CottageDoorSystem.js?v=big-solid-house-rooms-20260702-bh12";
import { addCottageInterior } from "./CottageInteriorSystem.js?v=big-solid-house-rooms-20260702-bh12";

const min = (value, fallback) => Math.max(fallback, Number(value) || fallback);

export function cottageSpec(house = {}) {
  return {
    width:min((house.sx || 6.2) * 1.45, 9.4),
    depth:min((house.sz || 5.4) * 1.45, 8.2),
    height:min((house.sy || 3.2) * 1.22, 4.05),
    brick:P.wall.size,
    doorWidth:min(house.door?.width || 1.55, 1.55),
    doorHeight:min(house.door?.height || 2.35, 2.35)
  };
}

function seal(group, house, colliders, door) {
  Object.assign(group.userData ||= {}, {
    cottageBrickSystem:true,
    houseId:house.id,
    colliderSources:colliders,
    colliderSchema:"compound-cottage-v12-big-solid-rooms",
    collisionStrategy:"static-compound-thick-walls-partitions-live-door",
    doorState:door.state,
    liveDoorCollider:true,
    realInterior:true,
    realRooms:true,
    realDoorway:true,
    noFakeDoorWall:true,
    actualSolidHouseCacheBust:"20260702-bh12"
  });
}

export function buildCottageBricks(house = {}) {
  const group = new THREE.Group();
  const spec = cottageSpec(house);
  const colliders = [];
  const door = buildCottageDoor(house, spec);
  group.name = `cottage_brick_system_${house.id}_big_solid_rooms_bh12`;
  addCottageWalls(group, house, spec, colliders);
  addCottageInterior(group, house, spec, colliders);
  group.add(door.root);
  addCottageBeams(group, house, spec);
  group.userData.roofHandledByCottageRoofBuilder = true;
  addCottageWindows(group, house, spec);
  seal(group, house, colliders, door);
  return { group, colliders, spec, door };
}

export default buildCottageBricks;
