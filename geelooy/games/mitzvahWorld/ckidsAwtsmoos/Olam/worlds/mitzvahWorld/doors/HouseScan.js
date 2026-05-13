
/**
 * B"H
 * @file HouseScan.js
 * @description
 * Finds likely house objects in the scene.
 */

import * as THREE from "/games/scripts/build/three.module.js";

/**
 * B"H
 * Checks house-like name.
 *
 * @param {any} object
 * Object.
 *
 * @returns {boolean}
 * True if likely house.
 */
function nameLooksHouseLike(object) {
  const name = String(object?.name || "").toLowerCase();
  return name.includes("house") || name.includes("home") || name.includes("hut");
}

/**
 * B"H
 * Checks house-like size.
 *
 * @param {any} object
 * Object.
 *
 * @returns {boolean}
 * True if big enough.
 */
function sizeLooksHouseLike(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());

  return (
    Number.isFinite(size.x) &&
    size.x > 2.2 &&
    size.y > 2.2 &&
    size.z > 2.2 &&
    size.x < 80 &&
    size.y < 80 &&
    size.z < 80
  );
}

/**
 * B"H
 * Finds likely houses.
 *
 * @param {any} scene
 * Scene.
 *
 * @returns {any[]}
 * Houses.
 */
export function findLikelyHouses(scene) {
  const houses = [];
  const seen = new Set();

  if (!scene || typeof scene.traverse !== "function") return houses;

  scene.traverse(child => {
    if (!child || child === scene || seen.has(child)) return;

    if (nameLooksHouseLike(child) || sizeLooksHouseLike(child)) {
      houses.push(child);
      seen.add(child);
    }
  });

  return houses.slice(0, 12);
}
