// B"H
/** @file CottageBrickBuilder.js @description Larger sealed cottage: shell, rooms, floor, live door. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=door-roof-target-20260708-bh2";
import { COTTAGE_BRICK_PALETTE as P } from "./CottageBrickPalette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addCottageWalls } from "./CottageBrickWalls.js?compact=true&v=door-roof-target-20260708-bh2";
import { addCottageBeams, addCottageWindows } from "./CottageBrickDetails.js?compact=true&v=actual-solid-house-20260702-bh5";
import { buildCottageDoor } from "./CottageDoorSystem.js?compact=true&v=door-roof-target-20260708-bh2";
import { addCottageInterior } from "./CottageInteriorSystem.js?compact=true&v=big-solid-house-rooms-20260702-bh12";
import { multiRoomHousePlan } from "./interior/MultiRoomHousePlan.js?compact=true&v=lod-house-octree-20260705-bh1";
import { addRoomThresholds } from "./interior/MultiRoomHouseMeshes.js?compact=true&v=lod-house-octree-20260705-bh1";
import { sealMultiRoomCollision } from "./interior/MultiRoomHouseCollision.js?compact=true&v=lod-house-octree-20260705-bh1";
import { multiStoryHousePlan } from "./stories/MultiStoryHousePlan.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addMultiStoryMeshes } from "./stories/MultiStoryHouseMeshes.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addHouseStairCollision } from "./stairs/HouseStairCollision.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { markInteriorDoors } from "./doors/InteriorDoorRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { sealHouseOctreeProxies } from "./octree/HouseOctreeProxyBuilder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const min=(value,fallback)=>Math.max(fallback,Number(value)||fallback);
export function cottageSpec(house={}){return{width:min((house.sx||6.2)*1.45,9.4),depth:min((house.sz||5.4)*1.45,8.2),height:min((house.sy||3.2)*1.22,4.05),brick:P.wall.size,doorWidth:min(house.door?.width||1.55,1.55),doorHeight:min(house.door?.height||2.35,2.35)};}
function seal(group,house,colliders,door){Object.assign(group.userData||={}, {cottageBrickSystem:true,houseId:house.id,colliderSources:colliders,colliderSchema:"compound-cottage-v14-sealed-upper-shell",collisionStrategy:"static-compound-thick-walls-partitions-live-door",doorState:door.state,liveDoorCollider:true,realInterior:true,realRooms:true,realDoorway:true,noFakeDoorWall:true,sealedUpperShell:true,noOpenRoofEdge:true,actualSolidHouseCacheBust:"20260708-door-roof-target-bh2"});}
export function buildCottageBricks(house={}){const group=new THREE.Group(),spec=cottageSpec(house),colliders=[],plan=multiRoomHousePlan(house,spec),storyPlan=multiStoryHousePlan(house,spec),door=buildCottageDoor(house,spec);group.name=`cottage_brick_system_${house.id}_sealed_door_roof_bh2`;addCottageWalls(group,house,spec,colliders);addCottageInterior(group,house,spec,colliders);addRoomThresholds(group,house,spec,plan);addMultiStoryMeshes(group,house,spec,storyPlan);addHouseStairCollision(colliders,house,spec,storyPlan);group.add(door.root);addCottageBeams(group,house,spec);group.userData.roofHandledByCottageRoofBuilder=true;addCottageWindows(group,house,spec);seal(group,house,colliders,door);sealMultiRoomCollision(group,plan);group.userData.multiStoryHousePlan=storyPlan;if(storyPlan.enabled)markInteriorDoors(group,Math.max(1,plan.interiorDoorways||1));sealHouseOctreeProxies(group);return{group,colliders,spec,door};}
export default buildCottageBricks;
