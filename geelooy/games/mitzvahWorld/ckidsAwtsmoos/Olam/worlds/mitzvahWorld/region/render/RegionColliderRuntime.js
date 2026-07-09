// B"H
/** @file RegionColliderRuntime.js @description Author final-position-ready merged collider geometry; octree insertion waits for scene-root finalization. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { mergeGeometries } from "/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { groundY } from "./RegionGround.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { sealHardCollider, sealRegionVisual } from "./RegionSeal.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { parcelCollisionManifest, auditManifest } from "../parcels/ParcelCollisionManifest.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { houseColliderSlabs } from "./RegionHouseColliderPlan.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function mat() { return new THREE.MeshBasicMaterial({ visible:false, color:0xff00ff, wireframe:true }); }
function houseList(report) { return report && Array.isArray(report.houses) ? report.houses : []; }
function parcelList(report) { const h = houseList(report); return Array.isArray(h.parcels) ? h.parcels : h.map(x => x.parcel).filter(Boolean); }
function slabWorldCenter(slab) { const yaw = slab.yaw || 0, lx = slab.center[0], lz = slab.center[2]; return { x:slab.x + Math.cos(yaw) * lx + Math.sin(yaw) * lz, z:slab.z - Math.sin(yaw) * lx + Math.cos(yaw) * lz }; }
function slabGeometry(olam, slab) {
  const g = new THREE.BoxGeometry(1, 1, 1), yaw = slab.yaw || 0, center = slabWorldCenter(slab);
  const p = new THREE.Vector3(center.x, groundY(olam, center.x, center.z) + slab.center[1], center.z);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
  g.applyMatrix4(new THREE.Matrix4().compose(p, q, new THREE.Vector3(slab.size[0], slab.size[1], slab.size[2])));
  g.userData = { sourceName:slab.houseId, slabName:slab.name, doorwayGap:true, visibleTwin:true, measuredShell:true, centerGrounded:true, groundSampleX:center.x, groundSampleZ:center.z };
  return g;
}
function houseSlabSpecs(report = {}) { return houseList(report).filter(h => Number.isFinite(h.x) && Number.isFinite(h.z)).flatMap(h => houseColliderSlabs(h)); }
function disposeSourceGeometries(geos, merged) { for (const g of geos) if (g !== merged && typeof g.dispose === "function") g.dispose(); }
function manifestStats(report) {
  const parcels = parcelList(report), manifest = report?.houses?.parcelCollisionManifest || parcelCollisionManifest(parcels), audit = auditManifest(manifest);
  return { parcels:parcels.length, manifestCount:manifest.length, auditOk:audit.ok, fenceSegments:manifest.reduce((n, m) => n + (m.fences?.length || 0), 0), gates:manifest.filter(m => m.gate?.required).length, doors:manifest.filter(m => m.door?.required).length, audit };
}
export function buildRegionColliderRuntime(olam, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_wall_slab_colliders_pending_final_batch";
  const specs = houseSlabSpecs(report), pstats = manifestStats(report), houses = houseList(report).length;
  if (!specs.length) { root.userData.stats = { houses, colliderBodies:0, houseSlabs:0, invisibleWallsPurged:true, doorwaysSealed:false, centerGrounded:true, waitsForFinalScenePlacement:true, ...pstats }; olam.__livingRegionDetachedColliders = []; return sealRegionVisual(root, { detachedColliderAuthoringRoot:true, parcelManifest:true }); }
  const geos = specs.map(s => slabGeometry(olam, s)), merged = mergeGeometries(geos, false) || geos[0];
  const mesh = new THREE.Mesh(merged, mat()); mesh.name = "final_batch_merged_house_wall_slabs_with_front_door_gaps";
  sealHardCollider(mesh, { mergedRegionCollider:true, sourceCount:houses, slabCount:specs.length, visibleTwinRequired:true, parcelManifest:true, doorwaysSealed:false, centerGrounded:true, waitsForFinalScenePlacement:true, pendingFinalOctreeBatch:true, finalPositionConfirmed:false });
  root.add(mesh); root.visible = typeof globalThis !== "undefined" && Boolean(globalThis.__AWTSMOOS_SHOW_REGION_COLLIDERS__);
  disposeSourceGeometries(geos, merged);
  root.userData.stats = { houses, colliderBodies:1, houseSlabs:specs.length, accepted:0, invisibleWallsPurged:true, doorwaysSealed:false, centerGrounded:true, waitsForFinalScenePlacement:true, mergedFastPath:true, ...pstats };
  olam.__livingRegionDetachedColliders = [];
  return sealRegionVisual(root, { detachedColliderAuthoringRoot:true, parcelManifest:true, houseSlabColliders:true, centerGrounded:true, waitsForFinalScenePlacement:true });
}
export { slabWorldCenter };
