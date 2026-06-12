// B"H
/**
 * @file VillageGroundNavigator.js
 * @description
 * Chapter 709: the beasts learn derech eretz. They may approach the player,
 * circle, and strike, but they may not climb inside the player's bones. The
 * Awtsmoos renews distance itself every instant; this navigator keeps that
 * distance honest, grounding paws, steering around walls, and turning faces
 * toward the road rather than backward into exile.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../../../../dvarim/terrain/core/TerrainMath.js";

const down = new THREE.Vector3(0, -1, 0);
const ray = new THREE.Ray();
const proposed = new THREE.Vector3();
const direction = new THREE.Vector3();
const side = new THREE.Vector3();
const CACHE_MS = 850;
const CELL = 1.25;

/** Shared static-world navigator for lightweight village wildlife. */
export default class VillageGroundNavigator {
  /** @param {object} olam World vessel with terrain law and static octree. */
  constructor(olam) { this.olam = olam; this.groundCache = new Map(); this.obstacleCache = new Map(); }

  /** @param {number} x World X. @param {number} z World Z. @param {number} fallback Fallback Y. @returns {number} Ground height. */
  groundY(x, z, fallback = 0) {
    const key = `${Math.round(x / CELL)}:${Math.round(z / CELL)}`;
    const old = this.groundCache.get(key);
    if (old && performance.now() - old.at < CACHE_MS) return old.y;
    const law = this.olam?.awtsmoosTerrainLaw;
    const lx = x - Number(law?.position?.x || 0), lz = z - Number(law?.position?.z || 0);
    const lawY = law?.data ? Number(law.position?.y || 0) + TerrainMath.calculateHeightAt(lx, lz, law.data) : fallback;
    ray.origin.set(x, Math.max(lawY + 18, 40), z); ray.direction.copy(down);
    const hit = this.olam?.worldOctree?.rayIntersect?.(ray);
    const octY = hit?.position?.y ?? (Number.isFinite(hit?.distance) ? ray.origin.y - hit.distance : NaN);
    const normalY = Number(hit?.normal?.y ?? 1);
    const y = Number.isFinite(octY) && normalY > 0.45 && Math.abs(octY - lawY) < 2.5 ? Math.max(lawY, octY) : lawY;
    this.groundCache.set(key, { y: Number.isFinite(y) ? y : fallback, at: performance.now() });
    if (this.groundCache.size > 1600) this.groundCache.delete(this.groundCache.keys().next().value);
    return Number.isFinite(y) ? y : fallback;
  }

  /** @param {THREE.Vector3} from Current position. @param {THREE.Vector3} dir Flat direction. @param {number} distance Probe distance. @returns {boolean} Static obstacle ahead. */
  blocked(from, dir, distance) {
    const octant = Math.round(Math.atan2(dir.x, dir.z) / (Math.PI / 4));
    const key = `${Math.round(from.x / CELL)}:${Math.round(from.z / CELL)}:${octant}`;
    const old = this.obstacleCache.get(key);
    if (old && performance.now() - old.at < 220) return old.blocked;
    ray.origin.set(from.x, from.y + 0.75, from.z); ray.direction.copy(dir);
    const hit = this.olam?.worldOctree?.rayIntersect?.(ray);
    const blocked = Boolean(hit && hit.distance <= distance + 0.72 && Number(hit.normal?.y ?? 0) < 0.68);
    this.obstacleCache.set(key, { blocked, at: performance.now() });
    if (this.obstacleCache.size > 1200) this.obstacleCache.delete(this.obstacleCache.keys().next().value);
    return blocked;
  }

  /** @param {object} mob Wildlife vessel. @param {THREE.Vector3} goal Goal. @param {number} dt Delta seconds. @param {number} scale Speed scale. @param {number} stopDistance Desired distance. */
  move(mob, goal, dt, scale, stopDistance = 0) {
    const mesh = mob?.mesh; if (!mesh || !goal) return;
    direction.copy(goal).sub(mesh.position); direction.y = 0;
    const distance = direction.length();
    if (distance < 0.01) return this.snap(mob);
    direction.normalize();
    const tooClose = stopDistance > 0 && distance < stopDistance * 0.82;
    const closeEnough = stopDistance > 0 && Math.abs(distance - stopDistance) < 0.28;
    if (tooClose) direction.multiplyScalar(-1);
    else if (closeEnough) direction.set(direction.z, 0, -direction.x).multiplyScalar(mob.orbitSign || 1);
    const step = Math.min(mob.speed * scale * dt, tooClose ? 0.34 : 0.42);
    if (this.blocked(mesh.position, direction, step)) {
      side.set(direction.z, 0, -direction.x);
      if (this.blocked(mesh.position, side, step)) side.multiplyScalar(-1);
      direction.lerp(side, 0.82).normalize();
    }
    proposed.copy(mesh.position).addScaledVector(direction, step);
    proposed.y = this.groundY(proposed.x, proposed.z, mesh.position.y - mob.groundLift) + mob.groundLift;
    mesh.position.copy(proposed);
    mesh.rotation.y = Math.atan2(direction.x, direction.z) + Math.PI;
  }

  /** @param {object} mob Wildlife vessel. */
  snap(mob) { if (mob?.mesh) mob.mesh.position.y = this.groundY(mob.mesh.position.x, mob.mesh.position.z, mob.mesh.position.y - mob.groundLift) + mob.groundLift; }
}

/** @param {object} olam World vessel. @returns {VillageGroundNavigator} Shared navigator. */
export function getVillageGroundNavigator(olam) { return olam.__villageGroundNavigator ||= new VillageGroundNavigator(olam); }
