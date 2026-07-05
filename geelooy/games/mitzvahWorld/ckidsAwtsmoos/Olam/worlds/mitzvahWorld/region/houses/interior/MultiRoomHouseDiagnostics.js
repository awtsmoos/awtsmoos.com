// B"H
/** @file MultiRoomHouseDiagnostics.js @description House/octree proof counters. */
import { collectMultiStoryDiagnostics } from "../stories/MultiStoryHouseDiagnostics.js";
function blank() {
  return {
    houseCount:0,
    multiRoomHouseCount:0,
    roomCount:0,
    floorProxyCount:0,
    exteriorWallProxyCount:0,
    interiorWallProxyCount:0,
    wallProxyCount:0,
    doorProxyCount:0,
    closedDoorBlockers:0,
    openDoorPasses:true,
    closedDoorBlocks:true,
    broadInvisibleBlockers:0,
    octreeRegistered:false,
    octreeRebuildEveryFrame:false,
    multiStoryHouseCount:0,
    secondFloorCount:0,
    stairCount:0,
    stairCollisionProxyCount:0,
    interiorDoorCount:0,
    stairsWalkable:false
  };
}

export function collectMultiRoomHouseDiagnostics(olam, root) {
  const out = blank();
  root?.traverse?.(node => {
    const d = node?.userData || {};
    if (d.cottageBuilding) {
      out.houseCount++;
      if (d.realRooms || d.multiRoomHousePlan) out.multiRoomHouseCount++;
      out.roomCount += Number(d.multiRoomHousePlan?.roomCount || 0);
    }
    if (d.broadInvisibleHouseBlocker) out.broadInvisibleBlockers++;
    const sources = Array.isArray(d.colliderSources) ? d.colliderSources : [];
    for (const src of sources) {
      if (src.floor) out.floorProxyCount++;
      if (src.secondFloor) out.secondFloorCount++;
      if (src.stair) out.stairCollisionProxyCount++;
      if (src.interiorDoor) out.interiorDoorCount++;
      if (src.category === "cottage-wall" || src.actualSolidWall) out.exteriorWallProxyCount++;
      if (src.interiorPartition || src.category === "cottage-room-wall") out.interiorWallProxyCount++;
      if (src.door) {
        out.doorProxyCount++;
        if (src.solid !== false && src.open !== true) out.closedDoorBlockers++;
      }
    }
  });
  out.wallProxyCount = out.exteriorWallProxyCount + out.interiorWallProxyCount;
  Object.assign(out, collectMultiStoryDiagnostics(root), {
    secondFloorCount:Math.max(out.secondFloorCount, collectMultiStoryDiagnostics(root).secondFloorCount),
    stairCollisionProxyCount:Math.max(out.stairCollisionProxyCount, collectMultiStoryDiagnostics(root).stairCollisionProxyCount),
    interiorDoorCount:Math.max(out.interiorDoorCount, collectMultiStoryDiagnostics(root).interiorDoorCount)
  });
  const diag = olam?.__awtsmoosHouseCollisionWorld?.diag?.() || null;
  out.octreeRegistered = Boolean(diag?.octreeQueued || diag?.octreeProxies);
  out.octreeProxyCount = Number(diag?.octreeProxies || 0);
  out.houseCollisionRecords = Number(diag?.houseColliders || 0);
  out.ok = out.houseCount > 0 && out.multiRoomHouseCount > 0 && out.floorProxyCount > 0 && out.wallProxyCount > 0 && out.interiorWallProxyCount > 0 && out.doorProxyCount > 0 && out.broadInvisibleBlockers === 0;
  olam.__mitzvahHouseDiag = out;
  globalThis.__MITZVAH_HOUSE_DIAG__ = () => out;
  return out;
}

export default collectMultiRoomHouseDiagnostics;
