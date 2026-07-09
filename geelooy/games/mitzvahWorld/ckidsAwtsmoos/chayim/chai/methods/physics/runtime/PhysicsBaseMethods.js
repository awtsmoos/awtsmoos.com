// B"H
/** @file PhysicsBaseMethods.js @description Capsule base physics with anti-fling collision clamps. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=stable-collision-animation-20260708-bh5";
import { solveMovingSolid } from "../../../../../dvarim/movers/runtime/movingSolidSolver.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?compact=true&v=perf-tight-collision-20260703-bh2";
import { clearAirTrajectory } from "./PhysicsAirRuntime.js?compact=true&v=stable-collision-animation-20260708-bh5";
import { bestGroundHit, canAcceptGroundContact } from "./PhysicsGroundRuntime.js?compact=true&v=stable-collision-animation-20260708-bh5";
import { finite, numeric } from "./PhysicsNumbers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const MAX_CORRECTION = 0.55;
const MAX_UP_CORRECTION = 0.18;

function capsuleFromFeet(feet, height, radius) {
  const r = Math.max(0.01, numeric(radius, 0.45));
  const h = Math.max(r * 2, numeric(height, 1.5));
  return {
    start: new THREE.Vector3(feet.x, feet.y + r, feet.z),
    end: new THREE.Vector3(feet.x, feet.y + h - r, feet.z)
  };
}

function finiteVector3(vec3) {
  return Boolean(vec3 && finite(vec3.x) && finite(vec3.y) && finite(vec3.z));
}

function finiteResult(result) {
  return Boolean(
    result &&
    finite(result.depth) &&
    result.normal &&
    finite(result.normal.x) &&
    finite(result.normal.y) &&
    finite(result.normal.z)
  );
}

function safePush(result) {
  const normal = result.normal.clone();
  if (Math.abs(normal.y) > 0.85 && result.depth > MAX_UP_CORRECTION) normal.y = Math.sign(normal.y) * 0.35;
  if (normal.lengthSq() < 1e-10) return null;
  normal.normalize();
  const depth = Math.min(Math.max(result.depth, 0), MAX_CORRECTION);
  return normal.multiplyScalar(depth);
}

function removeIntoVelocity(player, normal) {
  const dot = normal.dot(player.velocity);
  if (dot < 0) player.velocity.addScaledVector(normal, -dot);
  player.velocity.y = Math.max(player.velocity.y, -28);
}

function dynamicBodiesOf(player) {
  const bodies = player && player.olam && player.olam.dynamicBodies;
  return Array.isArray(bodies) ? bodies : [];
}

export default {
  setPosition(vec3) {
    if (!finiteVector3(vec3)) {
      console.warn('B"H: invalid player feet position ignored.');
      return;
    }
    if (!this.collider || !this.collider.start || !this.collider.end) return;
    this.collider.radius = numeric(this.radius, this.collider.radius || 0.45);
    const capsule = capsuleFromFeet(vec3, this.height, this.collider.radius);
    this.collider.start.copy(capsule.start);
    this.collider.end.copy(capsule.end);
    clearAirTrajectory(this);
    this.isTeleporting = true;
  },

  collisions() {
    const bubble = ensurePlayerCollisionBubble(this.olam);
    if (bubble && typeof bubble.resolveMovement === 'function') bubble.resolveMovement(this);
    const octree = this.olam && this.olam.worldOctree;
    const result = octree && typeof octree.capsuleIntersect === 'function' ? octree.capsuleIntersect(this.collider) : null;
    if (!finiteResult(result)) return;
    const push = safePush(result);
    if (!push) return;
    this.collider.translate(push);
    removeIntoVelocity(this, result.normal);
    if (this.__airTrajectoryLocked) {
      this.__airVelocityX = this.velocity.x;
      this.__airVelocityZ = this.velocity.z;
    }
    this.__lastSafeCollision = {
      at: Date.now(),
      depth: result.depth,
      applied: push.length(),
      object: result.object && result.object.name ? result.object.name : null
    };
  },

  async calculateOffset() {
    if (!this.onFloor) return;
    await new Promise(resolve => requestAnimationFrame(resolve));
    const hit = bestGroundHit(this);
    if (hit && finite(hit.distance)) this.offset = hit.distance;
  },

  getCapsule() {
    if (!this.collider) return null;
    return {
      radius: this.collider.radius,
      height: (this.collider.end.y - this.collider.start.y) + this.collider.radius * 2
    };
  },

  _solveDynamicBodies(phase = 'unknown') {
    if (this.__spikeColliderDisabled) return false;
    const bodies = dynamicBodiesOf(this);
    if (!bodies.length) return false;
    let supported = false;
    for (const body of bodies) {
      if (body && body.type === 'movingBlock') {
        const result = solveMovingSolid(body, this);
        const type = result && result.type ? String(result.type) : '';
        supported = supported || Boolean(result && result.hit && type.startsWith('top'));
      }
    }
    this.__lastDynamicSolvePhase = phase;
    return supported;
  },

  _checkNaNAndReset() {
    if (!this.mesh) return false;
    if (finiteVector3(this.mesh.position)) return false;
    console.warn('B"H: player position was NaN; resetting.', { was: this.mesh.position.clone() });
    this.velocity.set(0, 0, 0);
    clearAirTrajectory(this);
    this.setPosition(new THREE.Vector3(0, 10, 0));
    if (this.olam && this.olam.ayin) this.olam.ayin.currentDistance = 5;
    return true;
  },

  _updateSubSystems(dt) {
    if (typeof this.updateRayColor === 'function') this.updateRayColor();
    if (typeof this.updateHandState === 'function') this.updateHandState();
    if (typeof this.updateBlockHighlight === 'function') this.updateBlockHighlight();
    if (typeof this.updateParticles === 'function') this.updateParticles(dt);
    const updater = this.activeObject && this.activeObject.mesh && this.activeObject.mesh.userData && this.activeObject.mesh.userData.onUpdate;
    if (typeof updater === 'function') updater(dt);
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
