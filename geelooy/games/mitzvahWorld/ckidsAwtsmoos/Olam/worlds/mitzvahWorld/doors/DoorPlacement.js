
/**
 * B"H
 * @file DoorPlacement.js
 * @description
 * Places doors on house fronts in world coordinates.
 */

import * as THREE from "/games/scripts/build/three.module.js";

/**
 * B"H
 * Gets door world transform for a house.
 *
 * @param {any} house
 * House.
 *
 * @returns {{position:any,rotation:any,width:number,height:number,depth:number}}
 * Door transform.
 */
export function getDoorPlacementForHouse(house) {
  const box = new THREE.Box3().setFromObject(house);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const frontZ = box.min.z - 0.09;
  const doorHeight = Math.max(1.75, Math.min(2.4, size.y * 0.48));
  const doorWidth = Math.max(0.9, Math.min(1.45, size.x * 0.2));

  return {
    position: new THREE.Vector3(center.x, box.min.y + doorHeight / 2, frontZ),
    rotation: new THREE.Euler(0, 0, 0),
    width: doorWidth,
    height: doorHeight,
    depth: 0.16
  };
}
