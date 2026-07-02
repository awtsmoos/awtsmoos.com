// B"H
/**
 * @file RegionCottageAssembly.js
 * @description
 * The cottage assembly no longer hides behind a fast painted shell. Each home
 * receives a brick body with real wall descriptors, a real doorway, an inside
 * floor, and a live door whose collider can become solid or air.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { buildCottageBricks } from "../houses/CottageBrickBuilder.js?v=live-brick-colliders-20260702-bh1";
import { buildCottageRoof } from "../houses/cottage/CottageRoofBuilder.js?v=low-draw-textured-roof-20260622-bh1";
import { buildCottageWindows } from "../houses/cottage/CottageWindowSystem.js?v=cottage-window-system-20260615-bh3";
import { buildCottageYardProps } from "../houses/cottage/CottageYardPropBuilder.js?v=cottage-yard-story-20260615-bh3";
import { placeCottage } from "./RegionCottageShell.js?v=starter-visible-houses-20260628-bh1";

function maybeDetail(cottage, root, house, spec) {
  if (root.children.length < 18) cottage.add(buildCottageWindows(house, spec));
  if (root.children.length < 14) cottage.add(buildCottageYardProps(house));
}

function sealVisualOnly(child) {
  child.traverse?.(node => {
    if (node.userData?.colliderSources) return;
    Object.assign(node.userData ||= {}, { cottageVisualOnly:true, skipOctree:true, noOctree:true });
  });
}

function sealCottage(cottage, root, house, bricks) {
  Object.assign(cottage.userData ||= {}, {
    cottageBuilding:true,
    houseId:house.id,
    house,
    baseColliderSources:bricks.colliders,
    colliderSources:bricks.colliders,
    doorState:bricks.door?.state || null,
    splitRoof:true,
    splitWindows:root.children.length < 18,
    splitYard:root.children.length < 14,
    colliderMatchedShell:true,
    visualOnlyUntilColliderProof:false,
    realBrickBody:true,
    realInterior:true,
    realDoorway:true,
    liveDoorCollider:true
  });
}

export function makeCottage(house, root, olam) {
  const cottage = new THREE.Group();
  const bricks = buildCottageBricks(house);
  cottage.name = `real_cottage_${house.id}`;
  cottage.add(bricks.group, buildCottageRoof(house, bricks.spec));
  maybeDetail(cottage, root, house, bricks.spec);
  sealVisualOnly(cottage);
  sealCottage(cottage, root, house, bricks);
  placeCottage(cottage, house, olam);
  return cottage;
}
