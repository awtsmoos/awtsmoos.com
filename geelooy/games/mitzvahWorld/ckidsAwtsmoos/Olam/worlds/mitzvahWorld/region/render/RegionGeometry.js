// B"H
/** @file RegionGeometry.js @description Shared geometry cache for high-performance region visuals. */
import * as THREE from "/games/scripts/build/three.module.js";
const cache = new Map();
export function regionGeometry(kind = "box") {
  if (cache.has(kind)) return cache.get(kind);
  const g = kind === "blade" ? new THREE.PlaneGeometry(.09, 1, 1, 1) : kind === "flower" ? new THREE.SphereGeometry(.5, 8, 5) : kind === "stem" ? new THREE.CylinderGeometry(.08, .08, 1, 6) : kind === "rock" ? new THREE.SphereGeometry(.5, 10, 7) : kind === "trunk" ? new THREE.CylinderGeometry(.5, .65, 1, 8) : kind === "canopy" ? new THREE.SphereGeometry(.5, 10, 8) : kind === "road" ? new THREE.BoxGeometry(1, 1, 1) : kind === "cone" ? new THREE.ConeGeometry(.5, 1, 10) : new THREE.BoxGeometry(1, 1, 1);
  g.computeBoundingBox(); g.computeBoundingSphere(); cache.set(kind, g); return g;
}
export function geometryStats() { return { geometries: cache.size }; }
