// B"H
/** @file MultiStoryHouseDiagnostics.js @description Counts story/stair metadata. */
export function collectMultiStoryDiagnostics(root) {
  const out = { multiStoryHouseCount:0, secondFloorCount:0, stairCount:0, stairCollisionProxyCount:0, interiorDoorCount:0, stairsWalkable:false };
  root?.traverse?.(node => {
    const d = node?.userData || {};
    if (d.multiStoryHousePlan?.enabled) out.multiStoryHouseCount++;
    if (d.cottageSecondFloor) out.secondFloorCount++;
    if (d.cottageStair) out.stairCount++;
    const sources = Array.isArray(d.colliderSources) ? d.colliderSources : [];
    for (const src of sources) {
      if (src.stair) out.stairCollisionProxyCount++;
      if (src.interiorDoor) out.interiorDoorCount++;
    }
    if (d.walkableStair) out.stairsWalkable = true;
  });
  return out;
}

export default collectMultiStoryDiagnostics;
