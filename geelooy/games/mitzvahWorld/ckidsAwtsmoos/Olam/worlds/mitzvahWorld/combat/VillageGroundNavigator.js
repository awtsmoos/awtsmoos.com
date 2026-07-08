// B"H
/**
 * VillageGroundNavigator.js
 * Animals walk on mesh-ground truth. The constructor binding is deliberately
 * local (`GroundNavigator`) so no deferred module cache can ask for an undefined
 * class name when the battle layer wakes after first render.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { groundYAt } from "../../../methods/loadNivrayim/villageGrounding.js?compact=true&v=mitzvah-battle-split-20260703-bh1";

const ray = new THREE.Ray();
const proposed = new THREE.Vector3();
const direction = new THREE.Vector3();
const side = new THREE.Vector3();
const CACHE_MS = 650;
const CELL = 1.25;
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const now = () => globalThis.performance?.now?.() || Date.now();
const meshOf = mob => mob?.mesh || null;
const rayIntersect = olam => olam?.worldOctree?.rayIntersect?.(ray) || null;

class GroundNavigator {
  constructor(olam) { this.olam = olam; this.groundCache = new Map(); this.obstacleCache = new Map(); }
  key(x, z) { return `${Math.round(x / CELL)}:${Math.round(z / CELL)}`; }
  groundY(x, z, fallback = 0) {
    const key = this.key(x, z), old = this.groundCache.get(key), stamp = now();
    if (old && stamp - old.at < CACHE_MS) return old.y;
    const raw = groundYAt(this.olam, x, z, fallback), y = Number.isFinite(raw) ? raw : fallback;
    this.groundCache.set(key, { y, at:stamp });
    if (this.groundCache.size > 900) this.groundCache.delete(this.groundCache.keys().next().value);
    return y;
  }
  blocked(from, dir, distance, mob) {
    if (mob?.lowCostChase && mob.__navFrame % 6 !== 0) return false;
    const octant = Math.round(Math.atan2(dir.x, dir.z) / (Math.PI / 4));
    const key = `${this.key(from.x, from.z)}:${octant}`;
    const old = this.obstacleCache.get(key), stamp = now();
    if (old && stamp - old.at < 360) return old.blocked;
    ray.origin.set(from.x, from.y + .75, from.z); ray.direction.copy(dir);
    const hit = rayIntersect(this.olam), normalY = Number(hit?.normal?.y ?? 0);
    const blocked = Boolean(hit && hit.distance <= distance + .72 && normalY < .68);
    this.obstacleCache.set(key, { blocked, at:stamp });
    if (this.obstacleCache.size > 650) this.obstacleCache.delete(this.obstacleCache.keys().next().value);
    return blocked;
  }
  move(mob, goal, dt, scale, stopDistance = 0) {
    const mesh = meshOf(mob); if (!mesh || !goal) return;
    mob.__navFrame = (mob.__navFrame || 0) + 1;
    direction.copy(goal).sub(mesh.position); direction.y = 0;
    const distance = direction.length(); if (distance < .01) return this.snap(mob);
    direction.normalize();
    const tooClose = stopDistance > 0 && distance < stopDistance * .82;
    const closeEnough = stopDistance > 0 && Math.abs(distance - stopDistance) < .18;
    if (tooClose) direction.multiplyScalar(-1); else if (closeEnough && !mob.lowCostChase) direction.set(direction.z, 0, -direction.x).multiplyScalar(mob.orbitSign || 1);
    const maxStep = mob.lowCostChase ? .16 : tooClose ? .24 : .32;
    const step = Math.min(Math.max(0, n(mob.speed, 3) * scale * dt), maxStep);
    if (!mob.lowCostChase && this.blocked(mesh.position, direction, step, mob)) {
      side.set(direction.z, 0, -direction.x);
      if (this.blocked(mesh.position, side, step, mob)) side.multiplyScalar(-1);
      direction.lerp(side, .82).normalize();
    }
    mob.__smoothDir ||= new THREE.Vector3(); mob.__smoothDir.lerp(direction, mob.lowCostChase ? .34 : .62).normalize();
    proposed.copy(mesh.position).addScaledVector(mob.__smoothDir, step);
    proposed.y = this.groundY(proposed.x, proposed.z, mesh.position.y - n(mob.groundLift, 0)) + n(mob.groundLift, 0);
    mesh.position.lerp(proposed, mob.lowCostChase ? .82 : 1);
    mesh.rotation.y = Math.atan2(mob.__smoothDir.x, mob.__smoothDir.z);
    mesh.userData.forwardFix = "plusZ";
  }
  snap(mob) {
    const mesh = meshOf(mob); if (!mesh) return;
    mesh.position.y = this.groundY(mesh.position.x, mesh.position.z, mesh.position.y - n(mob.groundLift, 0)) + n(mob.groundLift, 0);
  }
}

export { GroundNavigator as VillageGroundNavigator };
export default GroundNavigator;
export function getVillageGroundNavigator(olam) {
  if (!olam.__villageGroundNavigator) olam.__villageGroundNavigator = new GroundNavigator(olam);
  return olam.__villageGroundNavigator;
}
