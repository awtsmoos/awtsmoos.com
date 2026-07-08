// B"H
/**
 * @file PhysicsBaseMethods.js
 * @purpose Provides capsule setup, collision, dynamic body, NaN, and ground checks.
 * @owner Live Chossid physics method table.
 * @inputs Player capsule, Olam octree, ground bubble, and moving body registry.
 * @outputs Corrected capsule state and diagnostic safety flags.
 * @runtimeAuthority Mutates only player physics state and collision response.
 * @updateOrder Loaded before frame, motion, and visual modules compose index.js.
 * @callers physics/index.js default export composition.
 * @invariants Capsule radius/height remain finite and mesh-ground remains preferred.
 * @failureModes Invalid player data is ignored or reset to safe spawn.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { solveMovingSolid } from "../../../../../dvarim/movers/runtime/movingSolidSolver.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?compact=true&v=perf-tight-collision-20260703-bh2";
import { clearAirTrajectory } from "./PhysicsAirRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { bestGroundHit } from "./PhysicsGroundRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { finite, numeric, steepSlopeY } from "./PhysicsNumbers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function capsuleFromFeet(feet, height, radius) {
  const r = Math.max(0.01, numeric(radius, 0.45));
  const h = Math.max(r * 2, numeric(height, 1.5));
  return { start: new THREE.Vector3(feet.x, feet.y + r, feet.z), end: new THREE.Vector3(feet.x, feet.y + h - r, feet.z) };
}

export default {
  setPosition(vec3) {
    if (!vec3 || !finite(vec3.x) || !finite(vec3.y) || !finite(vec3.z)) return console.warn("B\"H: invalid player feet position ignored.");
    if (!this.collider?.start || !this.collider?.end) return;
    this.collider.radius = numeric(this.radius, this.collider.radius || 0.45);
    const capsule = capsuleFromFeet(vec3, this.height, this.collider.radius);
    this.collider.start.copy(capsule.start); this.collider.end.copy(capsule.end);
    clearAirTrajectory(this); this.isTeleporting = true;
  },
  collisions() {
    ensurePlayerCollisionBubble(this.olam)?.resolveMovement?.(this);
    const result = this.olam?.worldOctree?.capsuleIntersect?.(this.collider);
    if (!result) return;
    this.collider.translate(result.normal.multiplyScalar(result.depth));
    this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
    if (this.__airTrajectoryLocked) { this.__airVelocityX = this.velocity.x; this.__airVelocityZ = this.velocity.z; }
  },
  async calculateOffset() {
    if (!this.onFloor) return;
    await new Promise(resolve => requestAnimationFrame(resolve));
    const hit = bestGroundHit(this);
    if (hit && Number.isFinite(hit.distance)) this.offset = hit.distance;
  },
  getCapsule() {
    if (!this.collider) return null;
    return { radius: this.collider.radius, height: (this.collider.end.y - this.collider.start.y) + (this.collider.radius * 2) };
  },
  _solveDynamicBodies(phase = "unknown") {
    if (this.__spikeColliderDisabled) return false;
    const bodies = this.olam?.dynamicBodies; if (!Array.isArray(bodies) || bodies.length === 0) return false;
    let supported = false;
    for (const body of bodies) if (body?.type === "movingBlock") {
      const result = solveMovingSolid(body, this); supported ||= Boolean(result?.hit && String(result.type || "").startsWith("top"));
    }
    this.__lastDynamicSolvePhase = phase; return supported;
  },
  _checkNaNAndReset() {
    if (!this.mesh) return false;
    if (finite(this.mesh.position.x) && finite(this.mesh.position.y) && finite(this.mesh.position.z)) return false;
    console.warn("B\"H: Player position NaN; resetting.", { was: this.mesh.position.clone() });
    this.velocity.set(0, 0, 0); clearAirTrajectory(this); this.setPosition(new THREE.Vector3(0, 10, 0));
    if (this.olam?.ayin) this.olam.ayin.currentDistance = 5;
    return true;
  },
  _updateSubSystems(dt) { this.updateRayColor?.(); this.updateHandState?.(); this.updateBlockHighlight?.(); this.updateParticles?.(dt); this.activeObject?.mesh?.userData?.onUpdate?.(dt); },
  _checkGround() {
    const hit = bestGroundHit(this);
    this.onFloor = Boolean(hit && hit.normal.y > steepSlopeY() && hit.distance <= this.collider.radius + 0.35 && hit.distance >= -1.0);
    this.groundHitResult = hit; if (this.onFloor) clearAirTrajectory(this);
  }
};
