// B"H
/** Visible cottage renderer conductor: brick bodies own walls, door runtime owns live toggles. */
import * as THREE from "/games/scripts/build/three.module.js";
import { planHouses } from "../houses/HousePlanner.js?v=actual-solid-house-20260702-bh4";
import { installDoorInteractionRuntime } from "../houses/door/DoorInteractionRuntime.js?v=big-solid-house-rooms-20260702-bh12";
import { makeCottage } from "./RegionCottageAssembly.js?v=big-solid-house-rooms-20260702-bh12";
import { installCottageStats } from "./RegionCottageStats.js?v=actual-solid-house-20260702-bh4";
function addCottages(root, houses, olam) {
  const allBase = [];
  houses.forEach(house => { const cottage = makeCottage(house, root, olam); root.add(cottage); allBase.push(...(cottage.userData.baseColliderSources || [])); });
  return allBase;
}
export function buildCottageRenderer(olam, report = {}) {
  const root = new THREE.Group(), houses = planHouses({ ...report, count:24 }).slice(0, 24);
  root.name = "real_cottage_brick_village_renderer_big_solid_rooms_bh12";
  const allBase = addCottages(root, houses, olam);
  installDoorInteractionRuntime(olam, root);
  installCottageStats(root, houses, allBase, olam);
  Object.assign(root.userData ||= {}, { actualSolidHouseCacheBust:"20260702-bh12", baseColliderCount:allBase.length, bigSolidRooms:true });
  return root;
}
export default buildCottageRenderer;
