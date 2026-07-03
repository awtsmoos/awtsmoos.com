// B"H
/**
 * @file LivingRegionCollision.js
 * @description House collision is not a rumor; after final placement the root
 * is registered into the house sidecar. The broad merged slab collider stays
 * out of the global octree so player physics cannot hit invisible proxy walls.
 */
import { buildRegionColliderRuntime } from "../RegionColliderRuntime.js?v=perf-tight-collision-20260703-bh2";
import { registerHouseRoot } from "../../../collision/HouseCollisionWorld.js?v=perf-tight-collision-20260703-bh2";
import { addLayer } from "./LivingRegionLayers.js?v=perf-tight-collision-20260703-bh2";

export function addFinalCollision(root, olam, report) {
  addLayer(root, "colliders-authoring", () => buildRegionColliderRuntime(olam, report));
  const stats = {
    requested:0,
    accepted:0,
    skipped:true,
    sidecarHouseAuthority:true,
    globalOctreeHouseSlabs:false,
    reason:"house-collision-sidecar-handles-cottages",
    seal:"no-merged-house-slabs-in-global-octree-bh1"
  };
  olam.__livingRegionFinalColliderBatch = [];
  olam.__livingRegionFinalColliderBatchStats = stats;
  return stats;
}

export function registerPlacedCottages(olam, cottages) {
  cottages?.updateMatrixWorld?.(true);
  const house = registerHouseRoot(olam, cottages, { houseId: "living-region-cottages" });
  olam.__livingRegionHouseCollisionRegistered = house?.records?.length || 0;
  return house;
}
