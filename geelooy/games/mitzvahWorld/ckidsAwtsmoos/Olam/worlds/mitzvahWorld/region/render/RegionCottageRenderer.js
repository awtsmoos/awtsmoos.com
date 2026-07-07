// B"H
/**
 * @file RegionCottageRenderer.js
 * @description Stable cottage renderer. Houses stay full, tall, clickable, and
 * octree-solid. The earlier impostor LOD made homes look like disappearing
 * shells; this pass chooses correctness first and leaves FPS optimization to
 * safer chunking that never hides the local world.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { planHouses } from "../houses/HousePlanner.js?v=awtsmoos-house-plan-20260614-bh2";
import { installDoorInteractionRuntime } from "../houses/door/DoorInteractionRuntime.js?v=full-revamp-door-click-diag-20260704-bh1";
import { makeCottage } from "./RegionCottageAssembly.js?v=big-solid-house-rooms-20260702-bh12";
import { installCottageStats } from "./RegionCottageStats.js?v=perf-tight-collision-20260703-bh2";
import { registerHouseRoot } from "../../collision/HouseCollisionWorld.js?v=perf-tight-collision-20260703-bh9";
import { publishMultiRoomCollisionDiagnostics } from "../houses/interior/MultiRoomHouseCollision.js?v=lod-house-octree-20260705-bh1";

const HOUSE_COUNT = 24;
const HOUSE_SCALE = new THREE.Vector3(1.18, 1.38, 1.18);

function roomProof(root) {
  const proof = { doors:0, doorPivots:0, internalRooms:0, interiorFloors:0, wallMeshes:0, stairs:0, fullHouses:0 };
  root.traverse?.(node => {
    const d = node.userData || {};
    if (d.doorPanel) proof.doors += 1;
    if (d.doorHingePivot) proof.doorPivots += 1;
    if (d.visibleRoomWall || d.interiorWall) proof.internalRooms += 1;
    if (d.cottageInteriorFloor) proof.interiorFloors += 1;
    if (d.cottageWallSection) proof.wallMeshes += 1;
    if (d.stairStep || /stair/i.test(node.name || "")) proof.stairs += 1;
    if (d.house || d.cottageRoot || /cottage|house/i.test(node.name || "")) proof.fullHouses += 1;
  });
  return proof;
}

function safeDiag(diag) {
  return {
    houses:diag?.houses || 0,
    houseColliders:diag?.houseColliders || 0,
    measuredProxies:diag?.measuredProxies || 0,
    descriptorProxies:diag?.descriptorProxies || 0,
    floorProxyCount:diag?.floorProxyCount || 0,
    wallProxyCount:diag?.wallProxyCount || 0,
    interiorWallProxyCount:diag?.interiorWallProxyCount || 0,
    doorProxyCount:diag?.doorProxyCount || 0,
    broadInvisibleBlockers:diag?.broadInvisibleBlockers || 0,
    octreeRegistered:Boolean(diag?.octreeRegistered),
    octreeProxies:diag?.octreeProxies || 0,
    octreeQueued:diag?.octreeQueued || 0,
    indexEntries:diag?.index?.entries || 0
  };
}

function firstDoor(root) {
  let door = null;
  root.traverse?.(node => {
    if (!door && node.userData?.doorHingePivot && node.userData?.doorState) door = node;
  });
  return door;
}

function passiveDoorProof(olam, root) {
  const door = firstDoor(root);
  const state = door?.userData?.doorState || null;
  return {
    registry:olam.__doorInteractionRegistry?.length || 0,
    open:Boolean(state?.open),
    id:state?.id || door?.name || null,
    hasProxy:Boolean(door?.getObjectByName?.("AWTSMOOS_DOOR_EXPLICIT_INTERACTION_PROXY")),
    clickable:Boolean(door?.userData?.doorHingePivot),
    mutatedDuringBuild:false
  };
}

function scaleCottage(cottage, index) {
  cottage.scale.copy(HOUSE_SCALE);
  cottage.updateMatrixWorld(true);
  Object.assign(cottage.userData ||= {}, {
    stableFullHouse:true,
    noImpostorShell:true,
    biggerTallerHouse:true,
    multiStoryTarget:true,
    houseScale:{ x:HOUSE_SCALE.x, y:HOUSE_SCALE.y, z:HOUSE_SCALE.z },
    houseIndex:index
  });
}

function addCottages(root, houses, olam) {
  const base = [];
  houses.forEach((house, index) => {
    const cottage = makeCottage(house, root, olam);
    scaleCottage(cottage, index);
    root.add(cottage);
    base.push(...(cottage.userData.baseColliderSources || []));
  });
  return base;
}

function makeHouses(report) {
  return planHouses({ ...report, count:HOUSE_COUNT }).slice(0, HOUSE_COUNT);
}

function registerCottageCollision(olam, root, reason, doorProof) {
  root.updateMatrixWorld(true);
  const house = registerHouseRoot(olam, root, { houseId:"living-region-cottages-full", octree:true, forceRefresh:true, octreeProxyLimit:320 });
  const proof = {
    at:Date.now(), reason,
    records:house?.records?.length || 0,
    diag:safeDiag(olam.__awtsmoosHouseCollisionWorld?.diag?.()),
    rooms:roomProof(root),
    houseDiag:publishMultiRoomCollisionDiagnostics(olam, root),
    doorProof
  };
  olam.__livingRegionCottageCollisionProof = proof;
  return { house, proof };
}

export function buildCottageRenderer(olam, report = {}) {
  const root = new THREE.Group();
  root.name = "real_full_cottage_village_no_disappearing_impostor_shells_bh1";
  const houses = makeHouses(report);
  const allBase = addCottages(root, houses, olam);
  installDoorInteractionRuntime(olam, root);
  const doorProof = passiveDoorProof(olam, root);
  installCottageStats(root, houses, allBase, olam);
  const { house, proof } = registerCottageCollision(olam, root, "stable-full-house-octree-door-click", doorProof);
  Object.assign(root.userData.stats ||= {}, { doorClickOpenProof:doorProof, octreeProof:proof.diag, internalRoomProof:proof.rooms, stableFullHouses:true });
  Object.assign(root.userData ||= {}, {
    actualSolidHouseCacheBust:"20260707-full-stable-houses-bh1",
    baseColliderCount:allBase.length,
    bigSolidRooms:true,
    clickableDoors:true,
    doorClickOpenProof:doorProof,
    earlyHouseCollisionRecords:house?.records?.length || 0,
    sidecarHouseCollisionAuthority:true,
    noBuildTimeDoorMutation:true,
    visualLodDisabledForStability:true,
    stableFullHouses:true
  });
  return root;
}

export default buildCottageRenderer;
