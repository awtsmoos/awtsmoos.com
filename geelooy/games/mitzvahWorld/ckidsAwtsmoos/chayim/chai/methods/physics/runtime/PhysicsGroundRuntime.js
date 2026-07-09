// B"H
/** Jump arcs breathe: rise, crest, fall, then land only at the feet. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import TerrainMath from "../../../../../dvarim/terrain/core/TerrainMath.js?compact=true&v=tree-visible-perf-jump-20260708-bh1";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?compact=true&v=jump-air-honest-20260709-bh1";
import { clearAirTrajectory } from "./PhysicsAirRuntime.js?compact=true&v=stable-collision-animation-20260708-bh5";
import { finite, numeric, steepSlopeY } from "./PhysicsNumbers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const groundRay = new THREE.Ray();
export const MIN_JUMP_AIR_MS = 650;
const LAND_GAP = 0.045;
const DEEP_OVERLAP = -0.16;
const MIN_LAND_VY = -0.55;
const MAX_LANDING_SPEED = 34;

export function jumpAge(player) {
  return Date.now() - Number(player?.__jumpStartedAt || 0);
}

export function inAirborneLock(player) {
  return Date.now() < Number(player?.__jumpAirborneUntil || 0);
}

export function jumpRising(player) {
  const vy = numeric(player?.velocity?.y, 0);
  return vy > 0.05 || Boolean(player?.jumped && !player?.onFloor && vy > MIN_LAND_VY);
}

export function jumpTooFresh(player) {
  return Boolean(player?.jumped && jumpAge(player) < MIN_JUMP_AIR_MS);
}

export function mustRemainAirborne(player, hit = null) {
  if (!player?.jumped && !inAirborneLock(player)) return false;
  if (inAirborneLock(player) || jumpTooFresh(player) || jumpRising(player)) return true;
  const radius = numeric(player?.collider?.radius, numeric(player?.radius, 0.45));
  const gap = hit ? numeric(hit.distance, Infinity) - radius : Infinity;
  return gap > LAND_GAP;
}

function realGround(hit) {
  return Boolean(hit && !hit.fallback && (hit.meshGroundAuthority || hit.source === "octree" || hit.lawFallback || hit.source === "terrain-law"));
}

export function canAcceptGroundContact(player, hit, options = {}) {
  if (!hit?.normal || !player?.collider || !realGround(hit)) return false;
  if (hit.normal.y <= steepSlopeY()) return false;
  if (!options.allowCoyote && mustRemainAirborne(player, hit)) return false;
  const radius = numeric(player.collider.radius, numeric(player.radius, 0.45));
  const gap = numeric(hit.distance, Infinity) - radius;
  const vy = numeric(player.velocity?.y, 0);
  if (vy > 0.08 || vy < -MAX_LANDING_SPEED) return false;
  return gap <= LAND_GAP && gap >= DEEP_OVERLAP;
}

export function terrainFallbackY(player, x, z, fallback) {
  const law = player?.olam?.awtsmoosTerrainLaw;
  if (!law?.data) return fallback;
  const lx = x - numeric(law.position?.x, 0), lz = z - numeric(law.position?.z, 0);
  const y = numeric(law.position?.y, 0) + TerrainMath.calculateHeightAt(lx, lz, law.data);
  return finite(y) ? y : fallback;
}

function lawHit(player) {
  const law = player?.olam?.awtsmoosTerrainLaw, start = player?.collider?.start;
  if (!law?.data || !start) return false;
  const y = terrainFallbackY(player, start.x, start.z, NaN);
  if (!finite(y)) return false;
  const e = 1.25, lx = start.x - numeric(law.position?.x, 0), lz = start.z - numeric(law.position?.z, 0);
  const hx = TerrainMath.calculateHeightAt(lx + e, lz, law.data) - TerrainMath.calculateHeightAt(lx - e, lz, law.data);
  const hz = TerrainMath.calculateHeightAt(lx, lz + e, law.data) - TerrainMath.calculateHeightAt(lx, lz - e, law.data);
  return { distance:start.y - y, position:new THREE.Vector3(start.x, y, start.z), normal:new THREE.Vector3(-hx / (e * 2), 1, -hz / (e * 2)).normalize(), object:{ name:"awtsmoosTerrainLawFallback" }, lawFallback:true, fallback:false, source:"terrain-law" };
}

export function bestGroundHit(player) {
  const start = player?.collider?.start;
  if (!start) return false;
  const bubble = ensurePlayerCollisionBubble(player?.olam);
  bubble?.updateFromPlayer?.(player);
  const feetY = start.y - numeric(player?.collider?.radius, numeric(player?.radius, 0.45));
  const mesh = bubble?.olam?.__awtsmoosGroundCollisionWorld?.groundAt?.(start.x, start.z, { fallback:feetY, radius:bubble.nearRadius, fallbackFn:(x, z, fallback) => terrainFallbackY(player, x, z, fallback) });
  if (mesh && finite(mesh.y) && !mesh.fallback) return { distance:start.y - mesh.y, position:mesh.point || new THREE.Vector3(start.x, mesh.y, start.z), normal:mesh.normal || new THREE.Vector3(0, 1, 0), object:mesh.object || { name:mesh.mesh || "terrain" }, meshGroundAuthority:true, fallback:false, source:mesh.source || "mesh-ground" };
  groundRay.origin.copy(start); groundRay.direction.set(0, -1, 0);
  return player.olam?.worldOctree?.rayIntersect?.(groundRay) || lawHit(player);
}

export function clampToTerrainFloor(player, slack = 0.012) {
  const hit = bestGroundHit(player);
  if (!canAcceptGroundContact(player, hit)) return false;
  const bubble = ensurePlayerCollisionBubble(player?.olam);
  const grounded = bubble?.groundPlayer?.(player, { slack, fallbackFn:(x, z, fallback) => terrainFallbackY(player, x, z, fallback) });
  const start = player?.collider?.start, radius = numeric(player?.collider?.radius, numeric(player?.radius, 0.45));
  if (!start || !finite(hit.position?.y)) return false;
  const delta = hit.position.y + radius + slack - start.y;
  if (!grounded && (!finite(delta) || Math.abs(delta) > 0.1)) return false;
  if (!grounded) player.collider.translate({ x:0, y:delta, z:0 });
  player.onFloor = player.grounded = player.isOnGround = true; player.jumped = false;
  if (player.velocity) player.velocity.y = 0;
  clearAirTrajectory(player); player.__lastGroundedAt = Date.now();
  player.__lastGroundClamp = { at:Date.now(), delta:grounded ? 0 : delta, groundY:hit.position.y, source:hit.object?.name || "ground", minAirMs:MIN_JUMP_AIR_MS };
  return true;
}
