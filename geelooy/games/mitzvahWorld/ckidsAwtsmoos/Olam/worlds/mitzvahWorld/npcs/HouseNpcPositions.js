
/**
 * B"H
 * @file HouseNpcPositions.js
 * @description
 * Places NPCs visibly near houses when houses exist.
 */

import * as THREE from "/games/scripts/build/three.module.js";

/**
 * B"H
 * Checks if object is probably a house.
 *
 * @param {any} object
 * Object.
 *
 * @returns {boolean}
 * True if house-like.
 */
function isHouseLike(object) {
  const name = String(object?.name || "").toLowerCase();
  return name.includes("house") || name.includes("home") || name.includes("hut");
}

/**
 * B"H
 * Finds house roots.
 *
 * @param {any} scene
 * Scene.
 *
 * @returns {any[]}
 * Houses.
 */
function findHouses(scene) {
  const houses = [];

  scene.traverse(child => {
    if (isHouseLike(child)) houses.push(child);
  });

  return houses;
}

/**
 * B"H
 * Gets positions near houses.
 *
 * @param {any} scene
 * Scene.
 *
 * @returns {number[][]}
 * Position arrays.
 */
export function getVisibleNpcPositions(scene) {
  const houses = findHouses(scene);
  const positions = [];

  for (const house of houses.slice(0, 4)) {
    const box = new THREE.Box3().setFromObject(house);

    if (!Number.isFinite(box.min.x) || !Number.isFinite(box.max.x)) continue;

    const center = box.getCenter(new THREE.Vector3());
    const frontZ = box.min.z - 1.4;

    positions.push([center.x - 1.4, 0, frontZ]);
    positions.push([center.x + 1.4, 0, frontZ]);
  }

  if (positions.length) return positions;

  return [
    [2.4, 0, -3.5],
    [-2.7, 0, -4.2],
    [4.8, 0, 2.8],
    [-5.2, 0, 3.1]
  ];
}
