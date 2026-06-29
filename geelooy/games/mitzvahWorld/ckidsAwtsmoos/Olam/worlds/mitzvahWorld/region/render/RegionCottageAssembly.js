// B"H
/**
 * @file RegionCottageAssembly.js
 * @description
 * Emergency-safe cottages: visual shells, real clickable doors, no giant
 * collider slabs poisoning the player/ground collision vessel.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { cottageSpec } from "../houses/CottageBrickBuilder.js?v=textured-wall-sections-20260621-bh1";
import { buildCottageDoor } from "../houses/CottageDoorSystem.js?v=hinged-door-system-20260615-bh2";
import { buildCottageInterior } from "../houses/CottageInteriorBuilder.js?v=socketed-interior-system-20260615-bh3";
import { buildCottageRoof } from "../houses/cottage/CottageRoofBuilder.js?v=low-draw-textured-roof-20260622-bh1";
import { buildCottageWindows } from "../houses/cottage/CottageWindowSystem.js?v=cottage-window-system-20260615-bh3";
import { buildCottageYardProps } from "../houses/cottage/CottageYardPropBuilder.js?v=cottage-yard-story-20260615-bh3";
import { buildFastShell, placeCottage } from "./RegionCottageShell.js?v=starter-visible-houses-20260628-bh1";

function maybeDetail(cottage, root, house, spec) {
  if (root.children.length < 18) cottage.add(buildCottageWindows(house, spec));
  if (root.children.length < 14) cottage.add(buildCottageYardProps(house));
  if (root.children.length < 5) cottage.add(buildCottageInterior(house, spec).group);
}

function sealVisualOnly(child) {
  child.traverse?.(node => {
    Object.assign(node.userData ||= {}, {
      cottageVisualOnly: true,
      skipOctree: true,
      noOctree: true
    });
  });
}

function sealCottage(cottage, root, house, door) {
  Object.assign(cottage.userData ||= {}, {
    cottageBuilding: true,
    houseId: house.id,
    house,
    baseColliderSources: [],
    colliderSources: [],
    doorState: door.state,
    splitRoof: true,
    splitWindows: root.children.length < 18,
    splitYard: root.children.length < 14,
    colliderMatchedShell: false,
    visualOnlyUntilColliderProof: true
  });
}

export function makeCottage(house, root, olam) {
  const cottage = new THREE.Group();
  const spec = cottageSpec(house);
  const door = buildCottageDoor(house, spec);
  cottage.name = `real_cottage_${house.id}`;
  cottage.add(buildFastShell(house), buildCottageRoof(house, spec), door.root);
  maybeDetail(cottage, root, house, spec);
  sealVisualOnly(cottage);
  sealCottage(cottage, root, house, door);
  placeCottage(cottage, house, olam);
  return cottage;
}
