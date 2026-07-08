// B"H
/**
 * @file PhysicsAirRuntime.js
 * @purpose Owns air-trajectory locks, animation guards, and movement-need tests.
 * @owner Live Chossid physics frame loop.
 * @inputs Player entity flags, velocity, movement state, and animation names.
 * @outputs Stable air velocity locks and safe animation requests.
 * @runtimeAuthority Mutates only player physics flags and animation guard state.
 * @updateOrder Used before/after jump, floor clamps, and movement solves.
 * @callers physics/index.js, PhysicsGroundRuntime, PhysicsBaseMethods.
 * @invariants Air lock preserves X/Z while falling, and clears on real ground.
 * @failureModes Missing velocity or animation methods become no-op safeguards.
 */
import { MOVING_EPSILON_SQ, numeric } from "./PhysicsNumbers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function needsOctreePhysics(entity) {
  if (!entity) return false;
  if (entity.type === "chossid" || entity.olam?.chossid === entity || entity.olam?.player === entity) return true;
  const m = entity.moving || {};
  return Boolean(m.forward || m.backward || m.stridingLeft || m.stridingRight ||
    m.turningLeft || m.turningRight || m.jump || entity.movingAutomatically ||
    entity.navTarget || entity.currentPath || entity._isMoving ||
    ((entity.velocity?.lengthSq?.() || 0) > MOVING_EPSILON_SQ));
}

export function captureAirTrajectory(player) {
  player.__airTrajectoryLocked = true;
  player.__airVelocityX = numeric(player.velocity?.x, 0);
  player.__airVelocityZ = numeric(player.velocity?.z, 0);
}

export function clearAirTrajectory(player) {
  if (!player) return;
  player.__airTrajectoryLocked = false;
  player.__airVelocityX = 0;
  player.__airVelocityZ = 0;
}

export function applyLockedAirTrajectory(player) {
  if (!player?.__airTrajectoryLocked) return false;
  player.velocity.x = numeric(player.__airVelocityX, 0);
  player.velocity.z = numeric(player.__airVelocityZ, 0);
  return true;
}

export function setAnim(player, key, options) {
  const resolved = player.getChaweeyoos?.(key);
  if (!resolved) return;
  const guard = `${key}:${resolved}`;
  if (player.__lastAnimKey === guard && !options?.force) return;
  player.__lastAnimKey = guard;
  player.playChaweeyoos?.(resolved, options);
}
