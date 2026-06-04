// B"H
/**
 * @file math.js
 * @description
 * Chapter 12: The Awtsmoos gives numbers a reusable vessel.
 * Every future tree, road, hill, and house can share deterministic randomness,
 * finite coercion, and instance composition instead of copying fragile snippets.
 */
import * as THREE from "/games/scripts/build/three.module.js";

/** @param {*} value @param {number} fallback @returns {number} */
export function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/** @param {number} a @param {number} b @param {number} c @returns {number} */
export function hash(a, b = 0, c = 1) {
  const x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return x - Math.floor(x);
}

/** @param {THREE.InstancedMesh} mesh @param {number} i @param {THREE.Vector3} p @param {THREE.Quaternion} q @param {THREE.Vector3} s */
export function setInstance(mesh, i, p, q, s) {
  mesh.setMatrixAt(i, new THREE.Matrix4().compose(p, q, s));
}

/** @param {THREE.Vector3} a @param {THREE.Vector3} b */
export function segmentBetween(a, b) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return { mid, q, length: dir.length() };
}
