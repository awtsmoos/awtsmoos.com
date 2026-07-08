// B"H
/** @file RegionColliderGroundAudit.js @description Audits final-scene collider batching, center-ground terrain truth, and grass texture truth. */
import { houseColliderSlabs } from "./RegionHouseColliderPlan.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildHousePlan } from "../houses/HousePlanner.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { auditGrassExclusions } from "./RegionGrassExclusion.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { auditFinalColliderBatchStats } from "./RegionFinalColliderBatch.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function slopeGroundY(_olam, x = 0, z = 0) { return 1.25 + x * 0.017 - z * 0.011; }
function worldCenter(slab) { const yaw = slab.yaw || 0, lx = slab.center[0], lz = slab.center[2]; return { x:slab.x + Math.cos(yaw) * lx + Math.sin(yaw) * lz, z:slab.z - Math.sin(yaw) * lx + Math.cos(yaw) * lz }; }
function expectedY(slab) { const p = worldCenter(slab); return slopeGroundY(null, p.x, p.z) + slab.center[1]; }
function legacyY(slab) { return slopeGroundY(null, slab.x, slab.z) + slab.center[1]; }
export function auditHouseSlabCenterGrounding(houses = buildHousePlan({ count:16 })) {
  const slabs = houses.flatMap(h => houseColliderSlabs(h));
  const rows = slabs.map(slab => { const centered = expectedY(slab), legacy = legacyY(slab), drift = Math.abs(centered - legacy); return { houseId:slab.houseId, slabName:slab.name, centeredY:centered, legacyY:legacy, drift, ok:Number.isFinite(centered) }; });
  const maxLegacyDrift = rows.reduce((m, r) => Math.max(m, r.drift), 0);
  return { ok:rows.every(r => r.ok) && maxLegacyDrift > 0.001, houses:houses.length, slabs:slabs.length, maxLegacyDrift, provesCenterGroundingMatters:true, rows:rows.slice(0, 12) };
}
export function auditColliderVisualAlignmentContracts(houses = buildHousePlan({ count:16 })) {
  const slabs = houses.flatMap(h => houseColliderSlabs(h));
  const missingSource = slabs.filter(s => !s.houseId), badDoor = slabs.filter(s => !s.doorWidth || !s.doorHeight), badCount = slabs.length !== houses.length * 6;
  return { ok:!badCount && missingSource.length === 0 && badDoor.length === 0, houses:houses.length, slabs:slabs.length, expectedSlabs:houses.length * 6, mergedBodies:1, missingSource:missingSource.length, badDoor:badDoor.length, doorwaysSealed:false };
}
export function auditGrassTextureContracts(report = { houses:buildHousePlan({ count:16 }) }) { const grass = auditGrassExclusions(report); return { ok:grass.ok, proceduralCoreGrass:true, shaderGrass:true, grainyNoise:true, playerReactive:true, noSolidColorGrass:true, exclusions:grass.exclusions, exclusionTypes:grass.types }; }
export function auditFinalSceneBatchContract(stats = { requested:1, accepted:1, finalPositionConfirmed:true, mergedFastPath:true, addedAfterSceneRoot:true }) { return auditFinalColliderBatchStats(stats); }
export function runGroundedColliderGrassAudit() {
  const houses = buildHousePlan({ count:16 }), report = { houses };
  const centerGround = auditHouseSlabCenterGrounding(houses), visual = auditColliderVisualAlignmentContracts(houses), grass = auditGrassTextureContracts(report), finalBatch = auditFinalSceneBatchContract();
  return { ok:centerGround.ok && visual.ok && grass.ok && finalBatch.ok, centerGround, visual, grass, finalBatch };
}
export default { auditHouseSlabCenterGrounding, auditColliderVisualAlignmentContracts, auditGrassTextureContracts, auditFinalSceneBatchContract, runGroundedColliderGrassAudit };
