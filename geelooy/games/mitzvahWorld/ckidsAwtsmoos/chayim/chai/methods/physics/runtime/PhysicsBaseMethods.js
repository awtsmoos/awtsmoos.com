// B"H
/** @file PhysicsBaseMethods.js @description Capsule base physics with anti-fling collision clamps. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=stable-collision-animation-20260708-bh4";
import { solveMovingSolid } from "../../../../../dvarim/movers/runtime/movingSolidSolver.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?compact=true&v=perf-tight-collision-20260703-bh2";
import { clearAirTrajectory } from "./PhysicsAirRuntime.js?compact=true&v=stable-collision-animation-20260708-bh3";
import { bestGroundHit, canAcceptGroundContact } from "./PhysicsGroundRuntime.js?compact=true&v=stable-collision-animation-20260708-bh4";
import { finite, numeric } from "./PhysicsNumbers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const MAX_CORRECTION = 0.55;
const MAX_UP_CORRECTION = 0.18;

function capsuleFromFeet(feet, height, radius) {
  const r = Math.max(0.01, numeric(radius, 0.45));
  const h = Math.max(r * 2, numeric(height, 1.5));
  return { start:new THREE.Vector3(feet.x, feet.y + r, feet.z), end:new THREE.Vector3(feet.x, feet.y + h - r, feet.z) };
}

function finiteResult(r) {
  return r && finite(r.depth) && finite(r.normal?.x) && finite(r.normal?.y) && finite(r.normal?.z);
}

function safePush(result) {
  const n = result.normal.clone();
  if (Math.abs(n.y) > 0.85 && result.depth > MAX_UP_CORRECTION) n.y = Math.sign(n.y) * 0.35;
  if (n.lengthSq() < 1e-10) return null;
  n.normalize();
  const d = Math.min(Math.max(result.depth, 0), MAX_CORRECTION);
  return n.multiplyScalar(d);
}

function removeIntoVelocity(player, normal) {
  const dot = normal.dot(player.velocity);
  if (dot < 0) player.velocity.addScaledVector(normal, -dot);
  player.velocity.y = Math.max(player.velocity.y, -28);
}

export default {
  setPosition(vec3) {
    if (!vec3 || !finite(vec3.x) || !finite(vec3.y) || !finite(vec3.z)) return console.warn("B"H: invalid player feet position ignored.");
    if (!this.collider?.start || !this.collider?.end) return;
    this.collider.radius = numeric(this.radius, this.collider.radius || 0.45);
    const c = capsuleFromFeet(vec3, this.height, this.collider.radius);
    this.collider.start.copy(c.start);
    this.collider.end.copy(c.end);
    clearAirTrajectory(this);
    this.isTeleporting = true;
  },

  collisions() {
    ensurePlayerCollisionBubble(this.olam)?.resolveMovement?.(this);
    const result = this.olam?.worldOctree?.capsuleIntersect?.(this.collider);
    if (!finiteResult(result)) return;
    const push = safePush(result);
    if (!push) return;
    this.collider.translate(push);
    removeIntoVelocity(this, result.normal);
    if (this.__airTrajectoryLocked) {
      this.__airVelocityX = this.velocity.x;
      this.__airVelocityZ = this.velocity.z;
    }
    this.__lastSafeCollision = { at:Date.now(), depth:result.depth, applied:push.length(), object:result.object?.name || null };
  },

  async calculateOffset() {
    if (!this.onFloor) return;
    await new Promise(resolve => requestAnimationFrame(resolve));
    const hit = bestGroundHit(this);
    if (hit && finite(hit.distance)) this.offset = hit.distance;
  },

  getCapsule() {
    if (!this.collider) return null;
    return { radius:this.collider.radius, height:(this.collider.end.y - this.collider.start.y) + this.collider.radius * 2 };
  },

  _solveDynamicBodies(phase = "unknown") {
    if (this.__spikeColliderDisabled) return false;
    const bodies = this.olam?.dynamicBodies;
    if (!Array.isArray(bodies) || !bodies.length) return false;
    let supported = false;
    for (const body of bodies) if (body?.type === "movingBlock") {
      const result = solveMovingSolid(body, this);
      supported ||= Boolean(result?.hit && String(result.type || "").startsWith("top"));
    }
    this.__lastDynamicSolvePhase = phase;
    return supported;
  },

  _checkNaNAndReset() {
    if (!this.mesh) return false;
    if (finite(this.mesh.position.x) && finite(this.mesh.position.y) && finite(this.mesh.position.z)) return false;
    console.warn("B"H: Player position NaN; resetting.", { was:this.mesh.position.clone() });
    this.velocity.set(0, 0, 0);
    clearAirTrajectory(this);
    this.setPosition(new THREE.Vector3(0, 10, 0));
    if (this.olam?.ayin) this.olam.ayin.currentDistance = 5;
    return true;
  },

  _updateSubSystems(dt) {
    this.updateRayColor?.();
    this.updateHandState?.();
    this.updateBlockHighlight?.();
    this.updateParticles?.(dt);
    this.activeObject?.mesh?.userData?.onUpdate?.(dt);
  },

  _checkGround() {
    const hit = bestGroundHit(this);
    this.groundHitResult = hit;
    this.onFloor = canAcceptGroundContact(this, hit);
    this.grounded = this.onFloor;
    this.isOnGround = this.onFloor;
    if (this.onFloor) {
      this.__lastGroundedAt = Date.now();
      clearAirTrajectory(this);
    }
  }
};
