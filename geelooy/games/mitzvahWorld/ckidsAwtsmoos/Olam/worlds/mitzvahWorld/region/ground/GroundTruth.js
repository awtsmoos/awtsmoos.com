// B"H
/**
 * @file GroundTruth.js
 * @description One terrain law: every road, fence, house, animal, NPC, tree, and collider bows to the same earth.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import TerrainMath from "../../../../../dvarim/terrain/core/TerrainMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { meshGroundHit } from "../../collision/GroundCollisionWorld.js?compact=true&v=inline-octree-no-worker-import-20260702-bh1";
const ray = new THREE.Ray(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
function num(v, f = 0) { return Number.isFinite(Number(v)) ? Number(v) : f; }
function lawOf(olam) { return olam && olam.awtsmoosTerrainLaw ? olam.awtsmoosTerrainLaw : null; }
function lawPosition(law) { return law && law.position ? law.position : {}; }
function octreeOf(olam) { return olam && olam.worldOctree ? olam.worldOctree : null; }
export function groundY(olam, x = 0, z = 0, fallback = 0) {
  const mesh = meshGroundHit(olam, x, z, { fallback, fallbackFn:() => null });
  if (mesh && !mesh.fallback && Number.isFinite(mesh.y)) return mesh.y;
  const law = lawOf(olam), pos = lawPosition(law);
  if (law && law.data) return num(pos.y) + TerrainMath.calculateHeightAt(x - num(pos.x), z - num(pos.z), law.data);
  ray.origin.set(x, 500, z);
  const octree = octreeOf(olam), hit = octree && typeof octree.rayIntersect === "function" ? octree.rayIntersect(ray) : null;
  return hit && hit.position && Number.isFinite(hit.position.y) ? hit.position.y : fallback;
}
export function groundNormal(olam, x, z) {
  const e = .75, y0 = groundY(olam, x, z);
  const dx = groundY(olam, x + e, z, y0) - groundY(olam, x - e, z, y0), dz = groundY(olam, x, z + e, y0) - groundY(olam, x, z - e, y0);
  return new THREE.Vector3(-dx, e * 2, -dz).normalize();
}
export function groundedMatrix(olam, x, z, sx, sy, sz, yaw = 0, lift = 0) { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)); const p = new THREE.Vector3(x, groundY(olam, x, z) + lift + sy * .5, z); return new THREE.Matrix4().compose(p, q, new THREE.Vector3(sx, sy, sz)); }
export function snapObjectToGround(olam, object, x, z, lift = 0) { object.position.set(x, groundY(olam, x, z) + lift, z); if (!object.userData) object.userData = {}; object.userData.groundTruthSnapped = true; return object; }
