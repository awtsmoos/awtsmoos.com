// B"H
/**
 * @file RegionCottageRenderer.js
 * @description Cottages are visible, furnished, clickable, and sidecar-solid;
 * visual LOD collapses non-near homes to one impostor while preserving
 * colliders, door state, octree registration, and near hydration.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { planHouses } from "../houses/HousePlanner.js?v=awtsmoos-house-plan-20260614-bh2";
import { installDoorInteractionRuntime } from "../houses/door/DoorInteractionRuntime.js?v=full-revamp-door-click-diag-20260704-bh1";
import { makeCottage } from "./RegionCottageAssembly.js?v=big-solid-house-rooms-20260702-bh12";
import { installCottageStats } from "./RegionCottageStats.js?v=perf-tight-collision-20260703-bh2";
import { registerHouseRoot } from "../../collision/HouseCollisionWorld.js?v=perf-tight-collision-20260703-bh9";
import { publishMultiRoomCollisionDiagnostics } from "../houses/interior/MultiRoomHouseCollision.js?v=lod-house-octree-20260705-bh1";

const FULL_DIST = 20;
const ALWAYS_FULL_HOUSE_IDS = new Set(["study_house_visible"]);
const IMPOSTOR_MAT = new THREE.MeshLambertMaterial({ color:0xb87944 });
const ROOF_MAT = new THREE.MeshLambertMaterial({ color:0x8a3526 });

function addCottages(root, houses, olam) {
  const allBase = [];
  houses.forEach(house => {
    const cottage = makeCottage(house, root, olam);
    root.add(cottage);
    allBase.push(...(cottage.userData.baseColliderSources || []));
  });
  return allBase;
}

function roomProof(root) {
  const proof = { doors:0, doorPivots:0, internalRooms:0, interiorFloors:0, wallMeshes:0 };
  root.traverse?.(o => {
    const d = o.userData || {};
    if (d.doorPanel) proof.doors++;
    if (d.doorHingePivot) proof.doorPivots++;
    if (d.visibleRoomWall || d.interiorWall) proof.internalRooms++;
    if (d.cottageInteriorFloor) proof.interiorFloors++;
    if (d.cottageWallSection) proof.wallMeshes++;
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

function firstLocalDoor(root) {
  let door = null;
  root.traverse?.(o => {
    if (!door && o.userData?.doorHingePivot && o.userData?.doorState) door = o;
  });
  return door;
}

function passiveDoorProof(olam, root) {
  const door = firstLocalDoor(root);
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

function registerCottageCollision(olam, root, reason, doorProof) {
  root.updateMatrixWorld?.(true);
  const house = registerHouseRoot(olam, root, { houseId:"living-region-cottages", octree:true, forceRefresh:true, octreeProxyLimit:180 });
  const proof = {
    at:Date.now(),
    reason,
    records:house?.records?.length || 0,
    diag:safeDiag(olam.__awtsmoosHouseCollisionWorld?.diag?.()),
    rooms:roomProof(root),
    houseDiag:publishMultiRoomCollisionDiagnostics(olam, root),
    doorProof
  };
  olam.__livingRegionCottageCollisionProof = proof;
  return { house, proof };
}

function playerPosition(olam) {
  return (olam?.player || olam?.chossid)?.mesh?.position || { x:0, z:0 };
}

function dist2(cottage, p) {
  const dx = Number(cottage.position?.x || 0) - Number(p.x || 0);
  const dz = Number(cottage.position?.z || 0) - Number(p.z || 0);
  return dx * dx + dz * dz;
}

function ensureImpostor(cottage) {
  const existing = cottage.getObjectByName?.("AWTSMOOS_COTTAGE_LOD_IMPOSTOR");
  if (existing) return existing;
  const house = cottage.userData?.house || {};
  const width = Math.max(5.8, Number(house.sx || 6.8) * 1.35);
  const depth = Math.max(4.8, Number(house.sz || 5.8) * 1.35);
  const height = Math.max(3.5, Number(house.sy || 3.35) * 1.2);
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), IMPOSTOR_MAT);
  body.name = "AWTSMOOS_COTTAGE_LOD_IMPOSTOR_BODY";
  body.position.y = height / 2;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 1.08, .65, depth * 1.08), ROOF_MAT);
  roof.name = "AWTSMOOS_COTTAGE_LOD_IMPOSTOR_ROOF";
  roof.position.y = height + .36;
  roof.rotation.z = .08;
  const group = new THREE.Group();
  group.name = "AWTSMOOS_COTTAGE_LOD_IMPOSTOR";
  group.add(body, roof);
  Object.assign(group.userData ||= {}, { cottageLodImpostor:true, visualOnly:true, skipOctree:true, noOctree:true });
  group.traverse?.(node => Object.assign(node.userData ||= {}, { cottageLodImpostor:true, visualOnly:true, skipOctree:true, noOctree:true }));
  cottage.add(group);
  return group;
}

function setFullCottage(cottage, visible) {
  cottage.traverse?.(node => {
    if (node === cottage) return;
    node.visible = node.userData?.cottageLodImpostor ? !visible : visible;
  });
}

function shouldHydrateFull(cottage, p) {
  const house = cottage.userData?.house || {};
  if (ALWAYS_FULL_HOUSE_IDS.has(String(house.id || ""))) return true;
  return Math.sqrt(dist2(cottage, p)) <= FULL_DIST;
}

function applyCottageVisualLod(root, olam) {
  const p = playerPosition(olam);
  const stats = { full:0, impostor:0, lodApplied:true, fullDist:FULL_DIST, alwaysFull:[...ALWAYS_FULL_HOUSE_IDS] };
  for (const cottage of root.children || []) {
    const full = shouldHydrateFull(cottage, p);
    cottage.visible = true;
    ensureImpostor(cottage);
    setFullCottage(cottage, full);
    cottage.userData.visualLodTier = full ? "full" : "impostor";
    if (full) stats.full++;
    else stats.impostor++;
  }
  root.userData.cottageVisualLodStats = stats;
  root.userData.stats = { ...(root.userData.stats || {}), cottageVisualLod:stats };
  if (olam) olam.__livingRegionCottageVisualLod = stats;
  return stats;
}

function installCottageVisualLod(root, olam) {
  const baseTick = root.userData?.tick;
  root.userData.tick = delta => {
    baseTick?.(delta);
    root.__cottageLodAcc = (root.__cottageLodAcc || 0) + (Number(delta) || 1 / 60);
    if (root.__cottageLodAcc < .22) return;
    root.__cottageLodAcc = 0;
    applyCottageVisualLod(root, olam);
  };
  applyCottageVisualLod(root, olam);
}

export function buildCottageRenderer(olam, report = {}) {
  const root = new THREE.Group();
  const houses = planHouses({ ...report, count:24 }).slice(0, 24);
  root.name = "real_cottage_brick_village_renderer_clickable_rooms_sidecar_bh12";
  const allBase = addCottages(root, houses, olam);
  installDoorInteractionRuntime(olam, root);
  const doorProof = passiveDoorProof(olam, root);
  installCottageStats(root, houses, allBase, olam);
  const { house, proof } = registerCottageCollision(olam, root, "renderer-build-tight-house-octree-no-auto-door-click", doorProof);
  installCottageVisualLod(root, olam);
  Object.assign(root.userData.stats ||= {}, { doorClickOpenProof:doorProof, octreeProof:proof.diag, internalRoomProof:proof.rooms });
  Object.assign(root.userData ||= {}, {
    actualSolidHouseCacheBust:"20260703-bh12",
    baseColliderCount:allBase.length,
    bigSolidRooms:true,
    clickableDoors:true,
    doorClickOpenProof:doorProof,
    earlyHouseCollisionRecords:house?.records?.length || 0,
    sidecarHouseCollisionAuthority:true,
    noBuildTimeDoorMutation:true,
    visualLodPreservesCollision:true
  });
  return root;
}

export default buildCottageRenderer;
