// B"H
/**
 * @file RegionCottageStats.js
 * @description
 * Door ticks and village house proof. In emergency repair mode, houses are
 * visible and doors animate, but global collider sources stay empty so the
 * player no longer falls into poisoned collision space.
 */
import { publishVillageHouseReport } from "../houses/VillageHouseRuntimeReport.js?v=starter-visible-houses-20260628-bh1";
import { updateDoorAnimations } from "../houses/door/DoorAnimationRuntime.js?v=door-animation-runtime-20260615-bh2";

function movingDoor(root) {
  let moving = false;
  root?.traverse?.(child => {
    const state = child.userData?.doorState;
    const gap = Math.abs(Number(state?.targetAngle || 0) - Number(state?.angle || 0));
    if (state && gap > 0.006) moving = true;
  });
  return moving;
}

export function tickCottageDoors(root, delta) {
  const dt = Number(delta) || 1 / 60;
  if (!movingDoor(root)) return;
  updateDoorAnimations(root, dt);
  root.userData.colliderSources = [];
  root.userData.stats.colliderSources = 0;
}

export function installCottageStats(root, houses, _allBase, olam) {
  root.userData = {
    ...(root.userData || {}),
    cottageRenderer: true,
    cottageCount: houses.length,
    baseColliderSources: [],
    colliderSources: [],
    stats: {
      cottages: houses.length,
      starterVisibleHouses: houses.filter(house => house.starterVisibleHouse).length,
      brickSystem: true,
      splitRoof: true,
      splitWindows: true,
      splitYard: true,
      doors: true,
      liveDoors: true,
      fullVillageGameplay: true,
      colliderSources: 0,
      visualOnlyUntilColliderProof: true
    }
  };
  root.userData.tick = delta => tickCottageDoors(root, delta);
  root.userData.stats.houseVisibilityReport = publishVillageHouseReport(root, olam);
}
