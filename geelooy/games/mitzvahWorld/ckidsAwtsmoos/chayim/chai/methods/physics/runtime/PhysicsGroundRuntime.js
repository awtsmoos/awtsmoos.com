// B"H
/**
 * @file PhysicsGroundRuntime.js
 * @purpose Finds real mesh ground before terrain-law fallback and clamps the player.
 * @owner Live Chossid grounding and terrain collision authority.
 * @inputs Player capsule, Olam ground collision world, octree, and terrain law.
 * @outputs Best ground hit, fallback height, and grounded capsule correction.
 * @runtimeAuthority Ground authority only; never invents fake floor completion.
 * @updateOrder Called before force application, after motion, and during abyss checks.
 * @callers physics/index.js and split physics method modules.
 * @invariants Mesh collision is preferred before terrain-law fallback.
 * @failureModes Missing meshes fall back to terrain math, then false.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../../../../../dvarim/terrain/core/TerrainMath.js";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?v=ground-cache-diag-20260701-bh1";
import { clearAirTrajectory } from "./PhysicsAirRuntime.js";
import { finite, numeric } from "./PhysicsNumbers.js";

const groundRay = new THREE.Ray();

export function terrainFallbackY(player, x, z, fallback) {
  const law = player?.olam?.awtsmoosTerrainLaw;
  if (!law?.data) return fallback;
  const y = numeric(law.position?.y, 0) + TerrainMath.calculateHeightAt(
    x - numeric(law.position?.x, 0), z - numeric(law.position?.z, 0), law.data);
  return finite(y) ? y : fallback;
}

function terrainLawFallbackHit(player) {
  const law = player?.olam?.awtsmoosTerrainLaw, start = player?.collider?.start;
  if (!law?.data || !start) return false;
  const lx = start.x - numeric(law.position?.x, 0), lz = start.z - numeric(law.position?.z, 0);
  const y = numeric(law.position?.y, 0) + TerrainMath.calculateHeightAt(lx, lz, law.data);
  if (!finite(y)) return false;
  const e = 1.25, hx1 = TerrainMath.calculateHeightAt(lx + e, lz, law.data);
  const hx0 = TerrainMath.calculateHeightAt(lx - e, lz, law.data);
  const hz1 = TerrainMath.calculateHeightAt(lx, lz + e, law.data);
  const hz0 = TerrainMath.calculateHeightAt(lx, lz - e, law.data);
  const normal = new THREE.Vector3(-(hx1 - hx0) / (e * 2), 1, -(hz1 - hz0) / (e * 2)).normalize();
  return { distance: start.y - y, position: new THREE.Vector3(start.x, y, start.z), normal, object: { name: "awtsmoosTerrainLawFallback" }, lawFallback: true };
}

export function bestGroundHit(player) {
  const bubble = ensurePlayerCollisionBubble(player?.olam);
  bubble?.updateFromPlayer?.(player);
  const radius = numeric(player?.collider?.radius, numeric(player?.radius, 0.45));
  const feetY = player?.collider?.start ? player.collider.start.y - radius : 0;
  const mesh = bubble?.olam?.__awtsmoosGroundCollisionWorld?.groundAt?.(player.collider.start.x, player.collider.start.z, {
    fallback: feetY, radius: bubble.nearRadius,
    fallbackFn: (x, z, fallback) => terrainFallbackY(player, x, z, fallback)
  });
  if (mesh && Number.isFinite(mesh.y)) return { distance: player.collider.start.y - mesh.y, position: mesh.point, normal: mesh.normal, object: mesh.object || { name: mesh.mesh || "terrain" }, meshGroundAuthority: true, fallback: mesh.fallback };
  groundRay.origin.copy(player.collider.start); groundRay.direction.set(0, -1, 0);
  return player.olam?.worldOctree?.rayIntersect?.(groundRay) || terrainLawFallbackHit(player);
}

export function clampToTerrainFloor(player, slack = 0.015) {
  const bubble = ensurePlayerCollisionBubble(player?.olam);
  const grounded = bubble?.groundPlayer?.(player, { slack, fallbackFn: (x, z, fallback) => terrainFallbackY(player, x, z, fallback) });
  if (grounded) clearAirTrajectory(player);
  return Boolean(grounded);
}
