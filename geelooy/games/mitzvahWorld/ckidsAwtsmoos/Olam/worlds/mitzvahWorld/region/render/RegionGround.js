// B"H
/** @file RegionGround.js @description Terrain-aware grounding helpers for every region object. */
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../../../../../dvarim/terrain/core/TerrainMath.js";
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
export function groundY(olam, x = 0, z = 0, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (law?.data) return num(law.position?.y) + TerrainMath.calculateHeightAt(x - num(law.position?.x), z - num(law.position?.z), law.data);
  const hit = olam?.worldOctree?.rayIntersect?.(new THREE.Ray(new THREE.Vector3(x, 500, z), new THREE.Vector3(0, -1, 0)));
  return Number.isFinite(hit?.position?.y) ? hit.position.y : fallback;
}
export function groundedMatrix(olam, x, z, sx, sy, sz, yaw = 0, lift = 0) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
  const p = new THREE.Vector3(x, groundY(olam, x, z) + lift + sy * 0.5, z);
  return new THREE.Matrix4().compose(p, q, new THREE.Vector3(sx, sy, sz));
}
export function groundGroup(olam, group, x, z, lift = 0) { group.position.set(x, groundY(olam, x, z) + lift, z); return group; }
