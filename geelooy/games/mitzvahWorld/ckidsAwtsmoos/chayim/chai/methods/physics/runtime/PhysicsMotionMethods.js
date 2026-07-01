// B"H
/**
 * @file PhysicsMotionMethods.js
 * @purpose Applies forces, jump, movement integration, terrain recovery, and slope limits.
 * @owner Live Chossid capsule movement authority.
 * @inputs Player velocity, collider, octree, terrain-law and mesh ground hits.
 * @outputs Corrected velocity, capsule translation, floor state, and abyss recovery.
 * @runtimeAuthority Moves only the player capsule and velocity state.
 * @updateOrder Runs after movement velocity calculation and before visual sync.
 * @callers physics/index.js composed method table.
 * @invariants Y motion is governed by ground hit and gravity, not attack pulses.
 * @failureModes Abyss or slope failures reset to last safe mesh-ground location.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { captureAirTrajectory, clearAirTrajectory } from "./PhysicsAirRuntime.js";
import { bestGroundHit } from "./PhysicsGroundRuntime.js";
import { steepSlopeY } from "./PhysicsNumbers.js";

export default {
  _applyPhysicsForces(deltaTime, isWorldBusy) {
    const damping = Math.exp(-20 * deltaTime) - 1;
    if (!this.onFloor) {
      if (!isWorldBusy && this.olam) this.velocity.y -= this.olam.GRAVITY * deltaTime;
      else this.velocity.y = Math.min(0, this.velocity.y);
      if (!this.__airTrajectoryLocked) { this.velocity.x += this.velocity.x * damping * 0.1; this.velocity.z += this.velocity.z * damping * 0.1; }
    } else this.velocity.y += this.velocity.y * damping;
    this.velocity.y = Math.max(this.velocity.y, -50);
  },
  _handleJump() {
    if (this.onFloor && this.moving.jump) {
      this.jumped = true; this.onFloor = false; captureAirTrajectory(this); this.velocity.y = this.jumpHeight;
      this.__supportedByDynamicBody = null; this.__dynamicCarrierFrames = 0;
      if (!this.didJump) { this.didJump = true; this.__lastAnimKey = null; this.ayshPeula("jumped", this); }
    } else if (this.didJump && !this.moving.jump) this.didJump = false;
  },
  _executeMovement(deltaTime) {
    const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
    const steps = Math.min(10, Math.ceil(deltaPosition.length() / (this.collider.radius * 0.5)));
    if (!this.olam?.worldOctree) return this.collider.translate(deltaPosition);
    const stepDelta = steps > 1 ? deltaPosition.clone().divideScalar(steps) : deltaPosition;
    for (let i = 0; i < Math.max(1, steps); i += 1) { this.collider.translate(stepDelta); this.collisions(); }
  },
  _resolveGroundCollision() {
    const hit = bestGroundHit(this);
    this.onFloor = Boolean(hit && hit.normal.y > steepSlopeY() && hit.distance <= this.collider.radius + 0.45);
    if (!this.onFloor || this.velocity.y > 0) return;
    const depth = this.collider.radius - hit.distance;
    if (depth > -0.02) this.collider.translate(hit.normal.clone().multiplyScalar(Math.max(0, depth)));
    this.velocity.projectOnPlane(hit.normal); this.velocity.y = 0; clearAirTrajectory(this);
  },
  _enforceTerrainSlopeLimit() {
    const hit = bestGroundHit(this); if (!hit || hit.normal.y >= steepSlopeY()) return false;
    const safe = this.__lastSafeFeet; if (!safe) return false;
    this.velocity.x = 0; this.velocity.z = 0; clearAirTrajectory(this);
    this.setPosition(new THREE.Vector3(safe.x, Math.max(safe.y, hit.position.y), safe.z));
    this.__lastSlopeBlock = { at: Date.now(), normalY: hit.normal.y, x: hit.position.x, z: hit.position.z };
    return true;
  },
  _checkAbyss() {
    const law = bestGroundHit(this);
    if (law && this.collider.start.y < law.position.y + this.collider.radius - 2) {
      console.warn("B\"H | PLAYER_TERRAIN_LAW_RECOVERY", { fromY: this.collider.start.y, groundY: law.position.y });
      this.velocity.set(0, 0, 0); clearAirTrajectory(this); this.setPosition(new THREE.Vector3(this.collider.start.x, law.position.y, this.collider.start.z)); return;
    }
    if (this.collider?.start?.y >= -100) return;
    console.log("B\"H: Player fell into abyss. Respawning."); this.velocity.set(0, 0, 0); clearAirTrajectory(this); this.setPosition(new THREE.Vector3(0, 10, 0));
  }
};
