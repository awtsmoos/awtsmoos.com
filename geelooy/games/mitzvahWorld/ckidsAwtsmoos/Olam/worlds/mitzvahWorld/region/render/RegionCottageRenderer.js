// B"H
/**
 * @file RegionCottageRenderer.js
 * @description Cottages are visible, furnished, clickable, and sidecar-solid;
 * build time never secretly opens a player's door or queues broad octree walls.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { planHouses } from "../houses/HousePlanner.js?v=actual-solid-house-20260702-bh4";
import { installDoorInteractionRuntime } from "../houses/door/DoorInteractionRuntime.js?v=full-revamp-door-click-diag-20260704-bh1";
import { makeCottage } from "./RegionCottageAssembly.js?v=big-solid-house-rooms-20260702-bh12";
import { installCottageStats } from "./RegionCottageStats.js?v=perf-tight-collision-20260703-bh2";
import { registerHouseRoot } from "../../collision/HouseCollisionWorld.js?v=perf-tight-collision-20260703-bh9";
import { publishMultiRoomCollisionDiagnostics } from "../houses/interior/MultiRoomHouseCollision.js?v=lod-house-octree-20260705-bh1";
function addCottages(root, houses, olam) { const allBase = []; houses.forEach(house => { const cottage = makeCottage(house, root, olam); root.add(cottage); allBase.push(...(cottage.userData.baseColliderSources || [])); }); return allBase; }
function roomProof(root) { const proof = { doors:0, doorPivots:0, internalRooms:0, interiorFloors:0, wallMeshes:0 }; root.traverse?.(o => { const d = o.userData || {}; if (d.doorPanel) proof.doors++; if (d.doorHingePivot) proof.doorPivots++; if (d.visibleRoomWall || d.interiorWall) proof.internalRooms++; if (d.cottageInteriorFloor) proof.interiorFloors++; if (d.cottageWallSection) proof.wallMeshes++; }); return proof; }
function safeDiag(diag) { return { houses:diag?.houses || 0, houseColliders:diag?.houseColliders || 0, measuredProxies:diag?.measuredProxies || 0, descriptorProxies:diag?.descriptorProxies || 0, floorProxyCount:diag?.floorProxyCount || 0, wallProxyCount:diag?.wallProxyCount || 0, interiorWallProxyCount:diag?.interiorWallProxyCount || 0, doorProxyCount:diag?.doorProxyCount || 0, broadInvisibleBlockers:diag?.broadInvisibleBlockers || 0, octreeRegistered:Boolean(diag?.octreeRegistered), octreeProxies:diag?.octreeProxies || 0, octreeQueued:diag?.octreeQueued || 0, indexEntries:diag?.index?.entries || 0 }; }
function firstLocalDoor(root) { let door = null; root.traverse?.(o => { if (!door && o.userData?.doorHingePivot && o.userData?.doorState) door = o; }); return door; }
function passiveDoorProof(olam, root) { const door = firstLocalDoor(root), state = door?.userData?.doorState || null; return { registry:olam.__doorInteractionRegistry?.length || 0, open:Boolean(state?.open), id:state?.id || door?.name || null, hasProxy:Boolean(door?.getObjectByName?.("AWTSMOOS_DOOR_EXPLICIT_INTERACTION_PROXY")), clickable:Boolean(door?.userData?.doorHingePivot), mutatedDuringBuild:false }; }
function registerCottageCollision(olam, root, reason, doorProof) { root.updateMatrixWorld?.(true); const house = registerHouseRoot(olam, root, { houseId:"living-region-cottages", octree:true, forceRefresh:true, octreeProxyLimit:180 }); const proof = { at:Date.now(), reason, records:house?.records?.length || 0, diag:safeDiag(olam.__awtsmoosHouseCollisionWorld?.diag?.()), rooms:roomProof(root), houseDiag:publishMultiRoomCollisionDiagnostics(olam, root), doorProof }; olam.__livingRegionCottageCollisionProof = proof; return { house, proof }; }
export function buildCottageRenderer(olam, report = {}) {
  const root = new THREE.Group(), houses = planHouses({ ...report, count:24 }).slice(0, 24);
  root.name = "real_cottage_brick_village_renderer_clickable_rooms_sidecar_bh12";
  const allBase = addCottages(root, houses, olam);
  installDoorInteractionRuntime(olam, root);
  const doorProof = passiveDoorProof(olam, root);
  installCottageStats(root, houses, allBase, olam);
	  const { house, proof } = registerCottageCollision(olam, root, "renderer-build-tight-house-octree-no-auto-door-click", doorProof);
  Object.assign(root.userData.stats ||= {}, { doorClickOpenProof:doorProof, octreeProof:proof.diag, internalRoomProof:proof.rooms });
  Object.assign(root.userData ||= {}, { actualSolidHouseCacheBust:"20260703-bh12", baseColliderCount:allBase.length, bigSolidRooms:true, clickableDoors:true, doorClickOpenProof:doorProof, earlyHouseCollisionRecords:house?.records?.length || 0, sidecarHouseCollisionAuthority:true, noBuildTimeDoorMutation:true });
  return root;
}
export default buildCottageRenderer;
