// B"H
/**
 * @file VillageGroundNavigator.js
 * @description
 * Chapter 710: close pursuit becomes smooth breath, not octree thunder.
 * The Awtsmoos teaches beasts to use the terrain law for paws and to ask the
 * obstacle-octree only when truly needed. Close approach now glides through a
 * damped velocity vessel instead of stuttering under repeated ray questions.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../../../../dvarim/terrain/core/TerrainMath.js";

const down = new THREE.Vector3(0, -1, 0);
const ray = new THREE.Ray();
const proposed = new THREE.Vector3();
const direction = new THREE.Vector3();
const side = new THREE.Vector3();
const CACHE_MS = 950;
const CELL = 1.5;
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;

export default class VillageGroundNavigator {
  constructor(olam) { this.olam = olam; this.groundCache = new Map(); this.obstacleCache = new Map(); }
  terrainLawY(x, z, fallback = 0) {
    const law = this.olam?.awtsmoosTerrainLaw;
    const lx = x - n(law?.position?.x), lz = z - n(law?.position?.z);
    return law?.data ? n(law.position?.y) + TerrainMath.calculateHeightAt(lx, lz, law.data) : fallback;
  }
  groundY(x, z, fallback = 0, fast = false) {
    const lawY = this.terrainLawY(x, z, fallback);
    if (fast) return Number.isFinite(lawY) ? lawY : fallback;
    const key = `${Math.round(x / CELL)}:${Math.round(z / CELL)}`;
    const old = this.groundCache.get(key);
    if (old && performance.now() - old.at < CACHE_MS) return old.y;
    ray.origin.set(x, Math.max(lawY + 18, 40), z); ray.direction.copy(down);
    const hit = this.olam?.worldOctree?.rayIntersect?.(ray);
    const octY = hit?.position?.y ?? (Number.isFinite(hit?.distance) ? ray.origin.y - hit.distance : NaN);
    const normalY = Number(hit?.normal?.y ?? 1);
    const y = Number.isFinite(octY) && normalY > 0.45 && Math.abs(octY - lawY) < 2.5 ? Math.max(lawY, octY) : lawY;
    const safe = Number.isFinite(y) ? y : fallback;
    this.groundCache.set(key, { y: safe, at: performance.now() });
    if (this.groundCache.size > 900) this.groundCache.delete(this.groundCache.keys().next().value);
    return safe;
  }
  blocked(from, dir, distance, mob) {
    if (mob?.lowCostChase && mob.__navFrame % 6 !== 0) return false;
    const octant = Math.round(Math.atan2(dir.x, dir.z) / (Math.PI / 4));
    const key = `${Math.round(from.x / CELL)}:${Math.round(from.z / CELL)}:${octant}`;
    const old = this.obstacleCache.get(key);
    if (old && performance.now() - old.at < 360) return old.blocked;
    ray.origin.set(from.x, from.y + 0.75, from.z); ray.direction.copy(dir);
    const hit = this.olam?.worldOctree?.rayIntersect?.(ray);
    const blocked = Boolean(hit && hit.distance <= distance + 0.72 && Number(hit.normal?.y ?? 0) < 0.68);
    this.obstacleCache.set(key, { blocked, at: performance.now() });
    if (this.obstacleCache.size > 650) this.obstacleCache.delete(this.obstacleCache.keys().next().value);
    return blocked;
  }
  move(mob, goal, dt, scale, stopDistance = 0) {
    const mesh = mob?.mesh; if (!mesh || !goal) return;
    mob.__navFrame = (mob.__navFrame || 0) + 1;
    direction.copy(goal).sub(mesh.position); direction.y = 0;
    const distance = direction.length();
    if (distance < 0.01) return this.snap(mob);
    direction.normalize();
    const tooClose = stopDistance > 0 && distance < stopDistance * 0.82;
    const closeEnough = stopDistance > 0 && Math.abs(distance - stopDistance) < 0.18;
    if (tooClose) direction.multiplyScalar(-1);
    else if (closeEnough && !mob.lowCostChase) direction.set(direction.z, 0, -direction.x).multiplyScalar(mob.orbitSign || 1);
    const maxStep = mob.lowCostChase ? 0.24 : tooClose ? 0.34 : 0.42;
    const step = Math.min(mob.speed * scale * dt, maxStep);
    if (!mob.lowCostChase && this.blocked(mesh.position, direction, step, mob)) {
      side.set(direction.z, 0, -direction.x);
      if (this.blocked(mesh.position, side, step, mob)) side.multiplyScalar(-1);
      direction.lerp(side, 0.82).normalize();
    }
    mob.__smoothDir ||= new THREE.Vector3();
    mob.__smoothDir.lerp(direction, mob.lowCostChase ? 0.34 : 0.62).normalize();
    proposed.copy(mesh.position).addScaledVector(mob.__smoothDir, step);
    proposed.y = this.groundY(proposed.x, proposed.z, mesh.position.y - mob.groundLift, Boolean(mob.lowCostChase)) + mob.groundLift;
    mesh.position.lerp(proposed, mob.lowCostChase ? 0.82 : 1);
    mesh.rotation.y = Math.atan2(mob.__smoothDir.x, mob.__smoothDir.z) + Math.PI;
  }
  snap(mob) { if (mob?.mesh) mob.mesh.position.y = this.groundY(mob.mesh.position.x, mob.mesh.position.z, mob.mesh.position.y - mob.groundLift, true) + mob.groundLift; }
}
export function getVillageGroundNavigator(olam) { return olam.__villageGroundNavigator ||= new VillageGroundNavigator(olam); }
