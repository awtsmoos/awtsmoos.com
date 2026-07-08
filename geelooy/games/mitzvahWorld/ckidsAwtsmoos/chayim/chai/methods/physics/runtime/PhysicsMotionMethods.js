// B"H
/**
 * @file PhysicsMotionMethods.js
 * @purpose Forces, jump, movement, collision, and slope recovery. The jump is
 * an upward letter of the Awtsmoos; ground checks may witness it, not erase it.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { captureAirTrajectory, clearAirTrajectory } from "./PhysicsAirRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { bestGroundHit } from "./PhysicsGroundRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { steepSlopeY, numeric } from "./PhysicsNumbers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function nearJumpGround(player) {
  const hit = bestGroundHit(player), r = numeric(player?.collider?.radius, numeric(player?.radius, .45));
  return Boolean(hit && hit.normal?.y > steepSlopeY() && hit.distance <= r + .95);
}
function jumpRising(player) {
  const vy = numeric(player?.velocity?.y, 0);
  return vy > .05 || (player?.jumped && !player?.onFloor && vy > -.01);
}
export default {
  _applyPhysicsForces(deltaTime, isWorldBusy) { const damping = Math.exp(-20 * deltaTime) - 1; if (!this.onFloor) { if (!isWorldBusy && this.olam) this.velocity.y -= this.olam.GRAVITY * deltaTime; else if (!this.jumped) this.velocity.y = Math.min(0, this.velocity.y); if (!this.__airTrajectoryLocked) { this.velocity.x += this.velocity.x * damping * .1; this.velocity.z += this.velocity.z * damping * .1; } } else this.velocity.y += this.velocity.y * damping; this.velocity.y = Math.max(this.velocity.y, -50); },
  _handleJump() { if (!this.velocity || !this.moving?.jump) { if (this.didJump && !this.moving?.jump) this.didJump = false; return; } const canJump = this.onFloor || nearJumpGround(this) || Date.now() - Number(this.__lastGroundedAt || 0) < 180; if (canJump && !this.didJump) { this.jumped = true; this.onFloor = false; this.grounded = false; this.isOnGround = false; captureAirTrajectory(this); this.velocity.y = numeric(this.jumpHeight, 12); this.__supportedByDynamicBody = null; this.__dynamicCarrierFrames = 0; this.didJump = true; this.__lastAnimKey = null; this.ayshPeula?.("jumped", this); this.__lastJumpProof = { at:Date.now(), velocityY:this.velocity.y, canJump }; } },
  _executeMovement(deltaTime) { const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime); const steps = Math.min(8, Math.ceil(deltaPosition.length() / Math.max(.08, this.collider.radius * .65))); if (!this.olam?.worldOctree) return this.collider.translate(deltaPosition); const stepDelta = steps > 1 ? deltaPosition.clone().divideScalar(steps) : deltaPosition; for (let i = 0; i < Math.max(1, steps); i++) { this.collider.translate(stepDelta); this.collisions(); } },
  _resolveGroundCollision() { const hit = bestGroundHit(this); if (jumpRising(this)) { this.onFloor = false; this.grounded = false; this.isOnGround = false; return; } this.onFloor = Boolean(hit && hit.normal.y > steepSlopeY() && hit.distance <= this.collider.radius + .55); if (this.onFloor) this.__lastGroundedAt = Date.now(); if (!this.onFloor || this.velocity.y > 0) return; const depth = this.collider.radius - hit.distance; if (depth > -.02) this.collider.translate(hit.normal.clone().multiplyScalar(Math.max(0, depth))); this.velocity.projectOnPlane(hit.normal); this.velocity.y = 0; clearAirTrajectory(this); },
  _enforceTerrainSlopeLimit() { const hit = bestGroundHit(this); if (!hit || hit.normal.y >= steepSlopeY()) return false; const safe = this.__lastSafeFeet; if (!safe) return false; this.velocity.x = 0; this.velocity.z = 0; clearAirTrajectory(this); this.setPosition(new THREE.Vector3(safe.x, Math.max(safe.y, hit.position.y), safe.z)); this.__lastSlopeBlock = { at:Date.now(), normalY:hit.normal.y, x:hit.position.x, z:hit.position.z }; return true; },
  _checkAbyss() { const law = bestGroundHit(this); if (law && this.collider.start.y < law.position.y + this.collider.radius - 2) { this.velocity.set(0, 0, 0); clearAirTrajectory(this); this.setPosition(new THREE.Vector3(this.collider.start.x, law.position.y, this.collider.start.z)); return; } if (this.collider?.start?.y >= -100) return; this.velocity.set(0, 0, 0); clearAirTrajectory(this); this.setPosition(new THREE.Vector3(0, 10, 0)); }
};
