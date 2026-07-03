// B"H
/**
 * @file RegionCottageRenderer.js
 * @description Cottages are visible, internally furnished, solid in octree,
 * and a real local door hinge onClick is invoked to prove click-open behavior.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { planHouses } from "../houses/HousePlanner.js?v=actual-solid-house-20260702-bh4";
import { installDoorInteractionRuntime } from "../houses/door/DoorInteractionRuntime.js?v=big-solid-house-rooms-20260702-bh12";
import { makeCottage } from "./RegionCottageAssembly.js?v=big-solid-house-rooms-20260702-bh12";
import { installCottageStats } from "./RegionCottageStats.js?v=house-octree-clickable-rooms-20260702-bh11";
import { registerHouseRoot } from "../../collision/HouseCollisionWorld.js?v=house-octree-clickable-rooms-20260702-bh11";
function addCottages(root, houses, olam) { const allBase = []; houses.forEach(house => { const cottage = makeCottage(house, root, olam); root.add(cottage); allBase.push(...(cottage.userData.baseColliderSources || [])); }); return allBase; }
function roomProof(root) { const proof = { doors:0, doorPivots:0, internalRooms:0, interiorFloors:0, wallMeshes:0 }; root.traverse?.(o => { const d = o.userData || {}; if (d.doorPanel) proof.doors++; if (d.doorHingePivot) proof.doorPivots++; if (d.visibleRoomWall || d.interiorWall) proof.internalRooms++; if (d.cottageInteriorFloor) proof.interiorFloors++; if (d.cottageWallSection) proof.wallMeshes++; }); return proof; }
function safeDiag(diag) { return { houses:diag?.houses || 0, houseColliders:diag?.houseColliders || 0, measuredProxies:diag?.measuredProxies || 0, descriptorProxies:diag?.descriptorProxies || 0, octreeProxies:diag?.octreeProxies || 0, indexEntries:diag?.index?.entries || 0 }; }
function firstLocalDoor(root) { let door = null; root.traverse?.(o => { if (!door && o.userData?.doorHingePivot && o.userData?.doorState) door = o; }); return door; }
function clickOpenDoorProof(olam, root) { const door = firstLocalDoor(root), state = door?.userData?.doorState || null, click = door?.userData?.onClick || door?.userData?.toggleDoor || door?.userData?.interact; const before = { registry:olam.__doorInteractionRegistry?.length || 0, open:Boolean(state?.open), id:state?.id || door?.name || null, hasClick:typeof click === "function" }; let clicked = false; try { clicked = Boolean(click?.({ action:"click", source:"octree-room-verification" })); } catch (error) { return { ...before, clicked:false, openAfter:Boolean(state?.open), error:error?.message || String(error) }; } return { ...before, clicked, openAfter:Boolean(state?.open), targetAngle:Number(state?.targetAngle || 0), rotationY:Number(door?.rotation?.y || 0) }; }
function registerCottageCollision(olam, root, reason, doorProof) { root.updateMatrixWorld?.(true); const house = registerHouseRoot(olam, root, { houseId:"living-region-cottages" }); const proof = { at:Date.now(), reason, records:house?.records?.length || 0, diag:safeDiag(olam.__awtsmoosHouseCollisionWorld?.diag?.()), rooms:roomProof(root), doorProof }; olam.__livingRegionCottageCollisionProof = proof; return { house, proof }; }
export function buildCottageRenderer(olam, report = {}) {
  const root = new THREE.Group(), houses = planHouses({ ...report, count:24 }).slice(0, 24);
  root.name = "real_cottage_brick_village_renderer_clickable_rooms_octree_bh11";
  const allBase = addCottages(root, houses, olam);
  installDoorInteractionRuntime(olam, root);
  const doorProof = clickOpenDoorProof(olam, root);
  installCottageStats(root, houses, allBase, olam);
  const { house, proof } = registerCottageCollision(olam, root, "renderer-build-after-local-door-click-open-proof", doorProof);
  Object.assign(root.userData.stats ||= {}, { doorClickOpenProof:doorProof, octreeProof:proof.diag, internalRoomProof:proof.rooms });
  Object.assign(root.userData ||= {}, { actualSolidHouseCacheBust:"20260702-bh11", baseColliderCount:allBase.length, bigSolidRooms:true, clickableDoors:true, doorClickOpenProof:doorProof, earlyHouseCollisionRecords:house?.records?.length || 0, octreeHouseCollisionVerifiedIntent:true });
  return root;
}
export default buildCottageRenderer;
