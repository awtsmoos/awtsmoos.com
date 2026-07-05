// B"H
/** @file MultiRoomHouseCollision.js @description Collision metadata helpers for real room parts. */
import { collectMultiRoomHouseDiagnostics } from "./MultiRoomHouseDiagnostics.js?v=lod-house-octree-20260705-bh1";

export function sealMultiRoomCollision(root, plan) {
  Object.assign(root.userData ||= {}, {
    multiRoomHousePlan:plan,
    realInterior:true,
    realRooms:true,
    broadInvisibleBlockers:0,
    houseCollisionProxyMode:"tight-floor-wall-door-proxies"
  });
  return root;
}

export function publishMultiRoomCollisionDiagnostics(olam, root) {
  return collectMultiRoomHouseDiagnostics(olam, root);
}

export default { sealMultiRoomCollision, publishMultiRoomCollisionDiagnostics };
