// B"H
/** @file PhysicsMotionMethods.js @description Jump arc preserves air time and lands only on real contact. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=stable-collision-animation-20260708-bh4";
import { captureAirTrajectory, clearAirTrajectory } from "./PhysicsAirRuntime.js?compact=true&v=stable-collision-animation-20260708-bh3";
import { bestGroundHit, canAcceptGroundContact } from "./PhysicsGroundRuntime.js?compact=true&v=stable-collision-animation-20260708-bh4";
import { steepSlopeY, numeric } from "./PhysicsNumbers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const COYOTE_MS = 180;
const AIRBORNE_LOCK_MS = 260;

function nearJumpGround(p) {
  const h = bestGroundHit(p);
  return Boolean(h && h.normal?.y > steepSlopeY() && canAcceptGroundContact(p, h, { allowCoyote:true }));
}

function rising(p) {
  const vy = numeric(p?.velocity?.y, 0);
  return vy > 0.05 || (p?.jumped && !p?.onFloor && vy > -0.2);
}

function playJump(p) {
  p.__lastAnimKey = null;
  p.playChaweeyoos?.(p.getChaweeyoos?.("jump") || "jump", { loop:false, force:true, duration:0.1, timeScale:1 });
}

export default {
  _applyPhysicsForces(dt, busy) {
    const damping = Math.exp(-18 * dt) - 1;
    if (!this.onFloor) {
      if (!busy && this.olam) this.velocity.y -= this.olam.GRAVITY * dt;
      else if (!this.jumped) this.velocity.y = Math.min(0, this.velocity.y);
      if (!this.__airTrajectoryLocked) {
        this.velocity.x += this.velocity.x * damping * 0.08;
        this.velocity.z += this.velocity.z * damping * 0.08;
      }
    } else this.velocity.y += this.velocity.y * damping;
    this.velocity.y = Math.max(this.velocity.y, -32);
  },

  _handleJump() {
    if (!this.velocity || !this.moving?.jump) {
      if (this.didJump && !this.moving?.jump) this.didJump = false;
      return;
    }
    const canJump = this.onFloor || nearJumpGround(this) || Date.now() - Number(this.__lastGroundedAt || 0) < COYOTE_MS;
    if (!canJump || this.didJump) return;
    this.jumped = true;
    this.didJump = true;
    this.onFloor = false;
    this.grounded = false;
    this.isOnGround = false;
    this.__jumpStartedAt = Date.now();
    this.__jumpAirborneUntil = Date.now() + AIRBORNE_LOCK_MS;
    captureAirTrajectory(this);
    this.velocity.y = numeric(this.jumpHeight, 12);
    this.__supportedByDynamicBody = null;
    this.__dynamicCarrierFrames = 0;
    this.hitFloor = false;
    playJump(this);
    this.ayshPeula?.("jumped", this);
    this.__lastJumpProof = { at:Date.now(), velocityY:this.velocity.y, canJump, animation:true, airborneLockMs:AIRBORNE_LOCK_MS };
  },

  _executeMovement(dt) {
    const delta = this.velocity.clone().multiplyScalar(dt);
    const steps = Math.min(10, Math.ceil(delta.length() / Math.max(0.06, this.collider.radius * 0.45)));
    if (!this.olam?.worldOctree) return this.collider.translate(delta);
    const step = steps > 1 ? delta.clone().divideScalar(steps) : delta;
    for (let i = 0; i < Math.max(1, steps); i += 1) {
      this.collider.translate(step);
      this.collisions();
    }
  },

  _resolveGroundCollision() {
    const hit = bestGroundHit(this);
    if (!canAcceptGroundContact(this, hit) || rising(this)) {
      this.onFloor = false;
      this.grounded = false;
      this.isOnGround = false;
      return;
    }
    this.onFloor = true;
    this.grounded = true;
    this.isOnGround = true;
    this.__lastGroundedAt = Date.now();
    const depth = this.collider.radius - hit.distance;
    if (depth > -0.015) this.collider.translate(hit.normal.clone().multiplyScalar(Math.min(Math.max(0, depth), 0.16)));
    this.velocity.projectOnPlane(hit.normal);
    this.velocity.y = 0;
    this.jumped = false;
    this.hitFloor = true;
    clearAirTrajectory(this);
  },

  _enforceTerrainSlopeLimit() {
    const hit = bestGroundHit(this);
    if (!hit || hit.normal.y >= steepSlopeY()) return false;
    const safe = this.__lastSafeFeet;
    if (!safe) return false;
    this.velocity.x = 0;
    this.velocity.z = 0;
    clearAirTrajectory(this);
    this.setPosition(new THREE.Vector3(safe.x, Math.max(safe.y, hit.position.y), safe.z));
    this.__lastSlopeBlock = { at:Date.now(), normalY:hit.normal.y };
    return true;
  },

  _checkAbyss() {
    const law = bestGroundHit(this);
    if (law && this.collider.start.y < law.position.y + this.collider.radius - 3) {
      this.velocity.set(0, 0, 0);
      clearAirTrajectory(this);
      this.setPosition(new THREE.Vector3(this.collider.start.x, law.position.y, this.collider.start.z));
      return;
    }
    if (this.collider?.start?.y >= -100) return;
    this.velocity.set(0, 0, 0);
    clearAirTrajectory(this);
    this.setPosition(new THREE.Vector3(0, 10, 0));
  }
};
