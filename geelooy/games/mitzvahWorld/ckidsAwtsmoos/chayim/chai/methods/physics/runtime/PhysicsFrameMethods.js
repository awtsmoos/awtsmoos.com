// B"H
/** @file PhysicsFrameMethods.js @purpose Hot path without per-frame profiler allocation. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=trees-house-fps-final-20260708-bh4";
import Tzomayach from "../../../../tzomayach.js?compact=true&v=trees-house-fps-final-20260708-bh4";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?compact=true&v=trees-house-fps-final-20260708-bh4";
import { clearAirTrajectory, needsOctreePhysics } from "./PhysicsAirRuntime.js?compact=true&v=trees-house-fps-final-20260708-bh4";
import { terrainFallbackY, clampToTerrainFloor } from "./PhysicsGroundRuntime.js?compact=true&v=trees-house-fps-final-20260708-bh4";

function primeJump(player) {
  if (!player || !player.moving || !player.moving.jump || player.didJump) return;
  if (typeof player._clampToTerrainFloor === "function") player._clampToTerrainFloor();
  if (!player.onFloor) clampToTerrainFloor(player, 0.02);
}

function finishFrame(player, deltaTime) {
  player._updateAnimationState(deltaTime);
  player._syncMesh(deltaTime);
  if (player.activeObject && typeof player.alignObject === "function") player.alignObject();
  Tzomayach.prototype.heesHawvoos.call(player, deltaTime);
}

function maybeProfile(player, started) {
  if (globalThis.__AWTS_PROFILE_PLAYER__ !== true) return;
  const total = performance.now() - started;
  const payload = { at:Date.now(), total:Math.round(total * 10) / 10 };
  player.__awtsmoosPlayerPhysicsLast = payload;
  if (player.olam) player.olam.__lastPlayerPhysicsStats = payload;
}

export default {
  heesHawvoos(dt) {
    if (!this.mesh || !this.collider || !this.velocity) return;
    const started = globalThis.__AWTS_PROFILE_PLAYER__ === true ? performance.now() : 0;
    const deltaTime = Math.min(dt, 0.1);
    if (this.isTeleporting) {
      this.isTeleporting = false;
      this._syncMesh(deltaTime);
      maybeProfile(this, started);
      return;
    }
    if (this._checkNaNAndReset()) {
      maybeProfile(this, started);
      return;
    }
    this._updateSubSystems(deltaTime);
    const isWorldBusy = this.olam && this.olam.worldOctree ? this.olam.worldOctree.isProcessing : true;
    if (!needsOctreePhysics(this)) {
      const result = this._idlePhysics(deltaTime);
      maybeProfile(this, started);
      return result;
    }
    if (this.collider.start) {
      this.__lastSafeFeet = new THREE.Vector3(
        this.collider.start.x,
        this.collider.start.y - this.collider.radius,
        this.collider.start.z
      );
    }
    primeJump(this);
    this._clampToTerrainFloor();
    this._checkGround();
    this._solveDynamicBodies("pre-forces");
    this._applyPhysicsForces(deltaTime, isWorldBusy);
    this._calculateMovementVelocity(deltaTime);
    this._handleJump();
    this._executeMovement(deltaTime);
    this._resolveGroundCollision();
    this._clampToTerrainFloor();
    this._enforceTerrainSlopeLimit();
    this._solveDynamicBodies("post-motion");
    this._checkAbyss();
    const bubble = ensurePlayerCollisionBubble(this.olam);
    if (bubble && typeof bubble.frame === "function") {
      bubble.frame(this, { fallbackFn:(x, z, fallback) => terrainFallbackY(this, x, z, fallback) });
    }
    finishFrame(this, deltaTime);
    maybeProfile(this, started);
  },

  _idlePhysics(deltaTime) {
    if (this.moving && this.moving.jump) return this.heesHawvoos(deltaTime);
    this.velocity.set(0, 0, 0);
    clearAirTrajectory(this);
    this._clampIdleToTerrain(deltaTime);
    if (this.activeObject && typeof this.alignObject === "function") this.alignObject();
    Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
  }
};
