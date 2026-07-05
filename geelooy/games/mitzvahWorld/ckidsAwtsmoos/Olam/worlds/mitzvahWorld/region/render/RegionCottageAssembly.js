// B"H
/**
 * @file RegionCottageAssembly.js
 * @description Real cottage assembly with fresh cache keys all the way down.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { buildCottageBricks } from "../houses/CottageBrickBuilder.js?v=big-solid-house-rooms-20260702-bh12";
import { buildCottageRoof } from "../houses/cottage/CottageRoofBuilder.js?v=big-solid-house-rooms-20260702-bh12";
import { buildCottageWindows } from "../houses/cottage/CottageWindowSystem.js?v=actual-solid-house-20260702-bh5";
import { buildCottageYardProps } from "../houses/cottage/CottageYardPropBuilder.js?v=actual-solid-house-20260702-bh5";
import { placeCottage } from "./RegionCottageShell.js?v=actual-solid-house-20260702-bh5";

function maybeDetail(cottage, root, house, spec) {
  if (root.children.length < 18) cottage.add(buildCottageWindows(house, spec));
  if (root.children.length < 14) cottage.add(buildCottageYardProps(house));
}
function sealVisualOnly(child) { child.traverse?.(node => { if (node.userData?.colliderSources) return; Object.assign(node.userData ||= {}, { cottageVisualOnly:true, skipOctree:true, noOctree:true }); }); }
function sealCottage(cottage, root, house, bricks) {
	  Object.assign(cottage.userData ||= { }, { cottageBuilding:true, houseId:house.id, house, baseColliderSources:bricks.colliders, colliderSources:bricks.colliders, multiRoomHousePlan:bricks.group?.userData?.multiRoomHousePlan || null, doorState:bricks.door?.state || null, splitRoof:true, splitWindows:root.children.length < 18, splitYard:root.children.length < 14, colliderMatchedShell:true, visualOnlyUntilColliderProof:false, realBrickBody:true, realInterior:true, realRooms:true, realDoorway:true, liveDoorCollider:true, actualSolidHouseCacheBust:"20260705-lod-house-octree-bh1" });
}
export function makeCottage(house, root, olam) {
  const cottage = new THREE.Group(), bricks = buildCottageBricks(house);
  cottage.name = `real_cottage_${house.id}_big_solid_rooms_bh12`;
  cottage.add(bricks.group, buildCottageRoof(house, bricks.spec));
  maybeDetail(cottage, root, house, bricks.spec);
  sealVisualOnly(cottage); sealCottage(cottage, root, house, bricks); placeCottage(cottage, house, olam);
  return cottage;
}
