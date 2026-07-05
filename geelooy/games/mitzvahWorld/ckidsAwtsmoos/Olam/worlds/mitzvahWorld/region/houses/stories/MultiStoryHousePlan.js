// B"H
/** @file MultiStoryHousePlan.js @description Selects cottages that receive a second story and stairs. */
export function multiStoryHousePlan(house = {}, spec = {}, indexHint = 0) {
  const raw = String(house.id || "");
  const idNumber = Number(raw.match(/\d+/)?.[0] ?? indexHint);
  const enabled = idNumber % 2 === 0;
  return {
    enabled,
    storyCount:enabled ? 2 : 1,
    secondFloorCount:enabled ? 1 : 0,
    stairCount:enabled ? 1 : 0,
    floorHeight:Number(spec.height || 4) + .18,
    stair:{ width:1.6, depth:3.7, steps:9, x:Number(spec.width || 9) * -.28, z:Number(spec.depth || 8) * -.2 }
  };
}

export default multiStoryHousePlan;
