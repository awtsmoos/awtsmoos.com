// B"H
/**
 * @file RegionCottageRenderer.js
 * @description
 * Visible cottage renderer conductor. The Awtsmoos gathers house plans,
 * assembles each home, installs live doors, and publishes house proof.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { planHouses } from "../houses/HousePlanner.js?v=starter-visible-houses-20260628-bh1";
import { installDoorInteractionRuntime } from "../houses/door/DoorInteractionRuntime.js?v=door-interaction-runtime-20260615-bh2";
import { makeCottage } from "./RegionCottageAssembly.js?v=starter-visible-houses-20260628-bh1";
import { installCottageStats } from "./RegionCottageStats.js?v=starter-visible-houses-20260628-bh1";

function addCottages(root, houses, olam) {
  const allBase = [];
  houses.forEach(house => {
    const cottage = makeCottage(house, root, olam);
    root.add(cottage);
    allBase.push(...cottage.userData.baseColliderSources);
  });
  return allBase;
}

export function buildCottageRenderer(olam, report = {}) {
  const root = new THREE.Group();
  const houses = planHouses({ ...report, count: 24 }).slice(0, 24);
  root.name = "real_cottage_brick_village_renderer";
  const allBase = addCottages(root, houses, olam);
  installDoorInteractionRuntime(olam, root);
  installCottageStats(root, houses, allBase, olam);
  return root;
}

export default buildCottageRenderer;
