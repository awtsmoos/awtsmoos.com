// B"H
/** @file PhysicsGroundRuntime.js @purpose Ground proof that cannot cancel a fresh jump. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=stable-collision-animation-20260708-bh4";
import TerrainMath from "../../../../../dvarim/terrain/core/TerrainMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?compact=true&v=perf-tight-collision-20260703-bh2";
import { clearAirTrajectory } from "./PhysicsAirRuntime.js?compact=true&v=stable-collision-animation-20260708-bh3";
import { finite, numeric, steepSlopeY } from "./PhysicsNumbers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const groundRay = new THREE.Ray();
const GROUND_GAP = 0.075;
const DEEP_OVERLAP = -0.22;

export function jumpRising(player) {
  return Number(player?.velocity?.y || 0) > 0.05 || Boolean(player?.jumped && !player?.onFloor && Number(player?.velocity?.y || 0) > -0.1);
}

export function inAirborneLock(player) {
  return Date.now() < Number(player?.__jumpAirborneUntil || 0);
}

export function canAcceptGroundContact(player, hit, options = {}) {
  if (!hit?.normal || !player?.collider) return false;
  if (hit.normal.y <= steepSlopeY()) return false;
  if (!options.allowCoyote && inAirborneLock(player)) return false;
  if (!options.allowCoyote && jumpRising(player)) return false;
  const radius = numeric(player.collider.radius, numeric(player.radius, 0.45));
  const gap = numeric(hit.distance, Infinity) - radius;
  const descending = numeric(player.velocity?.y, 0) <= 0.35;
  return descending && gap <= GROUND_GAP && gap >= DEEP_OVERLAP;
}

export function terrainFallbackY(player, x, z, fallback) {
  const law = player?.olam?.awtsmoosTerrainLaw;
  if (!law?.data) return fallback;
  const y = numeric(law.position?.y, 0) + TerrainMath.calculateHeightAt(x - numeric(law.position?.x, 0), z - numeric(law.position?.z, 0), law.data);
  return finite(y) ? y : fallback;
}

function lawHit(player) {
  const law = player?.olam?.awtsmoosTerrainLaw, start = player?.collider?.start;
  if (!law?.data || !start) return false;
  const lx = start.x - numeric(law.position?.x, 0), lz = start.z - numeric(law.position?.z, 0), y = terrainFallbackY(player, start.x, start.z, NaN);
  if (!finite(y)) return false;
  const e = 1.25;
  const hx1 = TerrainMath.calculateHeightAt(lx + e, lz, law.data), hx0 = TerrainMath.calculateHeightAt(lx - e, lz, law.data);
  const hz1 = TerrainMath.calculateHeightAt(lx, lz + e, law.data), hz0 = TerrainMath.calculateHeightAt(lx, lz - e, law.data);
  const normal = new THREE.Vector3(-(hx1 - hx0) / (e * 2), 1, -(hz1 - hz0) / (e * 2)).normalize();
  return { distance:start.y - y, position:new THREE.Vector3(start.x, y, start.z), normal, object:{ name:"awtsmoosTerrainLawFallback" }, lawFallback:true };
}

export function bestGroundHit(player) {
  const start = player?.collider?.start;
  if (!start) return false;
  const bubble = ensurePlayerCollisionBubble(player?.olam);
  bubble?.updateFromPlayer?.(player);
  const radius = numeric(player?.collider?.radius, numeric(player?.radius, 0.45));
  const feetY = start.y - radius;
  const mesh = bubble?.olam?.__awtsmoosGroundCollisionWorld?.groundAt?.(start.x, start.z, {
    fallback:feetY,
    radius:bubble.nearRadius,
    fallbackFn:(x, z, fallback) => terrainFallbackY(player, x, z, fallback)
  });
  if (mesh && finite(mesh.y)) return { distance:start.y - mesh.y, position:mesh.point || new THREE.Vector3(start.x, mesh.y, start.z), normal:mesh.normal || new THREE.Vector3(0, 1, 0), object:mesh.object || { name:mesh.mesh || "terrain" }, meshGroundAuthority:true, fallback:mesh.fallback };
  groundRay.origin.copy(start);
  groundRay.direction.set(0, -1, 0);
  return player.olam?.worldOctree?.rayIntersect?.(groundRay) || lawHit(player);
}

export function clampToTerrainFloor(player, slack = 0.015) {
  if (jumpRising(player) || inAirborneLock(player)) return false;
  const bubble = ensurePlayerCollisionBubble(player?.olam);
  const hit = bestGroundHit(player);
  if (!canAcceptGroundContact(player, hit)) return false;
  const grounded = bubble?.groundPlayer?.(player, { slack, fallbackFn:(x, z, fallback) => terrainFallbackY(player, x, z, fallback) });
  const start = player?.collider?.start, radius = numeric(player?.collider?.radius, numeric(player?.radius, 0.45));
  if (!start || !finite(hit.position?.y)) return false;
  const target = hit.position.y + radius + slack;
  const delta = target - start.y;
  if (!grounded && (!finite(delta) || Math.abs(delta) > 0.28)) return false;
  if (!grounded) player.collider.translate({ x:0, y:delta, z:0 });
  player.onFloor = true;
  player.grounded = true;
  player.isOnGround = true;
  player.jumped = false;
  if (player.velocity) player.velocity.y = 0;
  clearAirTrajectory(player);
  player.__lastGroundClamp = { at:Date.now(), delta:grounded ? 0 : delta, groundY:hit.position.y, source:hit.object?.name || "ground" };
  return true;
}
