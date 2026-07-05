// B"H
/** @file CottageBrickBuilder.js @description Larger real cottage: shell, rooms, floor, and live door. */
import * as THREE from "/games/scripts/build/three.module.js";
import { COTTAGE_BRICK_PALETTE as P } from "./CottageBrickPalette.js";
import { addCottageWalls } from "./CottageBrickWalls.js?v=big-solid-house-rooms-20260702-bh12";
import { addCottageBeams, addCottageWindows } from "./CottageBrickDetails.js?v=actual-solid-house-20260702-bh5";
import { buildCottageDoor } from "./CottageDoorSystem.js?v=big-solid-house-rooms-20260702-bh12";
import { addCottageInterior } from "./CottageInteriorSystem.js?v=big-solid-house-rooms-20260702-bh12";
import { multiRoomHousePlan } from "./interior/MultiRoomHousePlan.js?v=lod-house-octree-20260705-bh1";
import { addRoomThresholds } from "./interior/MultiRoomHouseMeshes.js?v=lod-house-octree-20260705-bh1";
import { sealMultiRoomCollision } from "./interior/MultiRoomHouseCollision.js?v=lod-house-octree-20260705-bh1";
import { multiStoryHousePlan } from "./stories/MultiStoryHousePlan.js";
import { addMultiStoryMeshes } from "./stories/MultiStoryHouseMeshes.js";
import { addHouseStairCollision } from "./stairs/HouseStairCollision.js";
import { markInteriorDoors } from "./doors/InteriorDoorRuntime.js";
import { sealHouseOctreeProxies } from "./octree/HouseOctreeProxyBuilder.js";

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
	    colliderSchema:"compound-cottage-v13-multi-room-octree-proxies",
    collisionStrategy:"static-compound-thick-walls-partitions-live-door",
    doorState:door.state,
    liveDoorCollider:true,
    realInterior:true,
    realRooms:true,
    realDoorway:true,
    noFakeDoorWall:true,
	    actualSolidHouseCacheBust:"20260705-lod-house-octree-bh1"
	  });
	}

export function buildCottageBricks(house = {}) {
  const group = new THREE.Group();
  const spec = cottageSpec(house);
	  const colliders = [], plan = multiRoomHousePlan(house, spec), storyPlan = multiStoryHousePlan(house, spec);
  const door = buildCottageDoor(house, spec);
  group.name = `cottage_brick_system_${house.id}_big_solid_rooms_bh12`;
  addCottageWalls(group, house, spec, colliders);
	  addCottageInterior(group, house, spec, colliders);
	  addRoomThresholds(group, house, spec, plan);
  addMultiStoryMeshes(group, house, spec, storyPlan);
  addHouseStairCollision(colliders, house, spec, storyPlan);
  group.add(door.root);
  addCottageBeams(group, house, spec);
  group.userData.roofHandledByCottageRoofBuilder = true;
  addCottageWindows(group, house, spec);
	  seal(group, house, colliders, door);
	  sealMultiRoomCollision(group, plan);
  group.userData.multiStoryHousePlan = storyPlan;
  if (storyPlan.enabled) markInteriorDoors(group, Math.max(1, plan.interiorDoorways || 1));
  sealHouseOctreeProxies(group);
	  return { group, colliders, spec, door };
	}

export default buildCottageBricks;
