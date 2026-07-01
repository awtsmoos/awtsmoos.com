// B"H
/**
 * @file PhysicsFrameMethods.js
 * @purpose Runs the per-frame player physics sequence without oversized index code.
 * @owner Live Chossid movement, grounding, and collision frame authority.
 * @inputs Delta time, player movement flags, world octree state, and active object.
 * @outputs Updated capsule, velocity, floor state, animation, and mesh sync.
 * @runtimeAuthority Orchestrates physics methods; delegates ground truth to mesh world.
 * @updateOrder Called by Chossid heesHawvoos after subsystem initialization.
 * @callers physics/index.js default method table.
 * @invariants Idle players clamp through composed terrain authority before sync.
 * @failureModes Missing mesh/collider/velocity halts the frame safely.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import Tzomayach from "../../../../tzomayach.js";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?v=ground-cache-diag-20260701-bh1";
import { clearAirTrajectory, needsOctreePhysics } from "./PhysicsAirRuntime.js";
import { terrainFallbackY } from "./PhysicsGroundRuntime.js";

function finishFrame(player, deltaTime) {
  player._updateAnimationState(deltaTime); player._syncMesh(deltaTime);
  if (player.activeObject && typeof player.alignObject === "function") player.alignObject();
  Tzomayach.prototype.heesHawvoos.call(player, deltaTime);
}

export default {
  heesHawvoos(dt) {
    if (!this.mesh || !this.collider || !this.velocity) return;
    const deltaTime = Math.min(dt, 0.1);
    if (this.isTeleporting) { this.isTeleporting = false; this._syncMesh(deltaTime); return; }
    if (this._checkNaNAndReset()) return;
    this._updateSubSystems(deltaTime);
    const isWorldBusy = this.olam?.worldOctree ? this.olam.worldOctree.isProcessing : true;
    if (!needsOctreePhysics(this)) return this._idlePhysics(deltaTime);
    if (this.collider?.start) this.__lastSafeFeet = new THREE.Vector3(this.collider.start.x, this.collider.start.y - this.collider.radius, this.collider.start.z);
    this._clampToTerrainFloor(); this._checkGround(); this._solveDynamicBodies("pre-forces");
    this._applyPhysicsForces(deltaTime, isWorldBusy); this._calculateMovementVelocity(deltaTime); this._handleJump();
    this._executeMovement(deltaTime); this._resolveGroundCollision(); this._clampToTerrainFloor();
    this._enforceTerrainSlopeLimit(); this._solveDynamicBodies("post-motion"); this._checkAbyss();
    ensurePlayerCollisionBubble(this.olam)?.frame?.(this, { fallbackFn: (x, z, fallback) => terrainFallbackY(this, x, z, fallback) });
    finishFrame(this, deltaTime);
  },
  _idlePhysics(deltaTime) {
    this.velocity.set(0, 0, 0); clearAirTrajectory(this); this._clampIdleToTerrain(deltaTime);
    if (this.activeObject && typeof this.alignObject === "function") this.alignObject();
    Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
  }
};
