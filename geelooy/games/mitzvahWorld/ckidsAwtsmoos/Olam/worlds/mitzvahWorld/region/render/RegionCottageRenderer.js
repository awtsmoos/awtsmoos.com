// B"H
/**
 * Visible cottage renderer conductor. Fresh cache keys reveal the solid house
 * the player actually collides with, not yesterday's painted dream.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { planHouses } from "../houses/HousePlanner.js?v=actual-solid-house-20260702-bh4";
import { installDoorInteractionRuntime } from "../houses/door/DoorInteractionRuntime.js?v=actual-solid-house-20260702-bh4";
import { makeCottage } from "./RegionCottageAssembly.js?v=actual-solid-house-20260702-bh5";
import { installCottageStats } from "./RegionCottageStats.js?v=actual-solid-house-20260702-bh4";

function addCottages(root, houses, olam) {
  const allBase = [];
  houses.forEach(house => {
    const cottage = makeCottage(house, root, olam);
    root.add(cottage);
    allBase.push(...(cottage.userData.baseColliderSources || []));
  });
  return allBase;
}

export function buildCottageRenderer(olam, report = {}) {
  const root = new THREE.Group();
  const houses = planHouses({ ...report, count: 24 }).slice(0, 24);
  root.name = "real_cottage_brick_village_renderer_actual_solid_bh4";
  const allBase = addCottages(root, houses, olam);
  installDoorInteractionRuntime(olam, root);
  installCottageStats(root, houses, allBase, olam);
  Object.assign(root.userData ||= {}, { actualSolidHouseCacheBust:"20260702-bh4", baseColliderCount:allBase.length });
  return root;
}

export default buildCottageRenderer;
