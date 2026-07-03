// B"H
/**
 * @file LivingRegionCollision.js
 * @description House collision is not a rumor; after final placement the root
 * is registered into both the house sidecar and the real octree.
 */
import { buildRegionColliderRuntime } from "../RegionColliderRuntime.js?v=default-test-npcs-animals-20260702-bh1";
import { finalizeRegionColliderBatch } from "../RegionFinalColliderBatch.js?v=default-test-npcs-animals-20260702-bh1";
import { registerHouseRoot } from "../../../collision/HouseCollisionWorld.js?v=default-test-npcs-animals-20260702-bh1";
import { addLayer } from "./LivingRegionLayers.js?v=default-test-npcs-animals-20260702-bh1";

export function addFinalCollision(root, olam, report) {
  addLayer(root, "colliders-authoring", () => buildRegionColliderRuntime(olam, report));
  return finalizeRegionColliderBatch(olam, root);
}

export function registerPlacedCottages(olam, cottages) {
  cottages?.updateMatrixWorld?.(true);
  const house = registerHouseRoot(olam, cottages, { houseId: "living-region-cottages" });
  olam.__livingRegionHouseCollisionRegistered = house?.records?.length || 0;
  return house;
}
