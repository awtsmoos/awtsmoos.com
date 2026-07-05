// B"H
/** House collision is sidecar-authoritative; broad merged slabs never enter the player octree. */
import { buildRegionColliderRuntime } from "../RegionColliderRuntime.js?v=perf-tight-collision-20260703-bh2";
import { registerHouseRoot } from "../../../collision/HouseCollisionWorld.js?v=perf-tight-collision-20260703-bh9";
import { addLayer } from "./LivingRegionLayers.js?v=perf-tight-collision-20260703-bh2";

export function addFinalCollision(root, olam, report) {
  addLayer(root, "colliders-authoring", () => buildRegionColliderRuntime(olam, report));
  const stats = { requested:0, accepted:0, skipped:true, sidecarHouseAuthority:true, globalOctreeHouseSlabs:false, reason:"house-collision-sidecar-handles-cottages", seal:"no-merged-house-slabs-in-global-octree-bh2" };
  olam.__livingRegionFinalColliderBatch = [];
  olam.__livingRegionFinalColliderBatchStats = stats;
  return stats;
}
export function registerPlacedCottages(olam, cottages) {
  cottages?.updateMatrixWorld?.(true);
  const house = registerHouseRoot(olam, cottages, { houseId:"living-region-cottages", forceRefresh:true, octree:false });
  olam.__livingRegionHouseCollisionRegistered = house?.records?.length || 0;
  olam.__livingRegionHouseCollisionOctree = false;
  return house;
}
