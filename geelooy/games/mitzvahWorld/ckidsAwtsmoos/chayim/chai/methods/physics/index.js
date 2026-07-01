// B"H
/**
 * @file index.js
 * @purpose Compose live Chossid physics and expose grounding audit authority.
 * @owner Live mitzvahWorld player movement, collision, and grounding runtime.
 * @inputs Player capsule, movement flags, Olam terrain/collision worlds, and dt.
 * @outputs Grounded capsule movement, animation state, and visible mesh sync.
 * @runtimeAuthority Canonical player physics method table for Chai/Chossid.
 * @updateOrder Ground wrapper, numeric helpers, bubble authority, runtime modules.
 * @callers Chai/Chossid class composition during live game boot.
 * @invariants Idle and active players clamp to real terrain before visual sync.
 * @failureModes Invalid positions no-op or reset through split safety modules.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { ensurePlayerCollisionBubble } from "../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?v=ground-cache-diag-20260701-bh1";
import baseMethods from "./runtime/PhysicsBaseMethods.js";
import frameMethods from "./runtime/PhysicsFrameMethods.js";
import motionMethods from "./runtime/PhysicsMotionMethods.js";
import visualMethods from "./runtime/PhysicsVisualMethods.js";
import { applyLockedAirTrajectory } from "./runtime/PhysicsAirRuntime.js";
import { clampToTerrainFloor as clampCapsuleToTerrainFloor } from "./runtime/PhysicsGroundRuntime.js";
import { normAngle, numeric } from "./runtime/PhysicsNumbers.js";

export function clampToTerrainFloor(player) {
  return clampCapsuleToTerrainFloor(player);
}

export function movementDirection(player) {
  const direction = new THREE.Vector3();
  const moving = player.moving || {}, rotY = player.rotation?.y || 0;
  const forwardX = Math.sin(rotY), forwardZ = Math.cos(rotY);
  const sideX = -Math.cos(rotY), sideZ = Math.sin(rotY);
  const forward = moving.forward || player.movingAutomatically, back = moving.backward;
  player.isWalking = false;
  if (forward) { player.isWalking = true; direction.x += forwardX; direction.z += forwardZ; player.targetRotateOffset = 0; }
  else if (back) { player.isWalking = true; direction.x -= forwardX; direction.z -= forwardZ; player.targetRotateOffset = -Math.PI; }
  if (moving.stridingLeft) {
    player.isWalking = true; direction.x += sideX; direction.z += sideZ; player.targetRotateOffset = Math.PI / 2;
    if (forward) player.targetRotateOffset -= Math.PI / 4; else if (back) player.targetRotateOffset += Math.PI / 4;
  } else if (moving.stridingRight) {
    player.isWalking = true; direction.x -= sideX; direction.z -= sideZ; player.targetRotateOffset = -Math.PI / 2;
    if (forward) player.targetRotateOffset += Math.PI / 4; else if (back) player.targetRotateOffset -= Math.PI / 4;
  }
  player.targetRotateOffset = normAngle(player.targetRotateOffset || 0);
  if (direction.lengthSq() > 0) direction.normalize();
  return direction;
}

export default {
  ...baseMethods,
  ...frameMethods,
  ...motionMethods,
  ...visualMethods,
  _ensurePlayerCollisionBubble() { return ensurePlayerCollisionBubble(this.olam); },
  _clampToTerrainFloor() { return clampToTerrainFloor(this); },
  _clampIdleToTerrain(deltaTime) { clampToTerrainFloor(this); this._syncMesh(deltaTime); },
  _calculateMovementVelocity(deltaTime = 1 / 60) {
    const dir = movementDirection(this);
    if (!this.onFloor && applyLockedAirTrajectory(this)) return;
    const moving = dir.lengthSq() > 0;
    const gaitScale = this.moving?.running ? numeric(this.runModeScale, 1) : numeric(this.walkModeScale, 0.58);
    const speed = numeric(this.speed, 6) * numeric(this.speedScale, 1) * gaitScale;
    const targetX = moving ? dir.x * speed : 0, targetZ = moving ? dir.z * speed : 0;
    const responsiveness = moving ? numeric(this.movementResponsiveness, 16) : numeric(this.stopResponsiveness, 30);
    const alpha = 1 - Math.exp(-responsiveness * Math.max(0.001, deltaTime));
    this.velocity.x += (targetX - this.velocity.x) * alpha;
    this.velocity.z += (targetZ - this.velocity.z) * alpha;
    if (!moving && Math.abs(this.velocity.x) + Math.abs(this.velocity.z) < 0.0004) { this.velocity.x *= 0.5; this.velocity.z *= 0.5; }
  }
};
