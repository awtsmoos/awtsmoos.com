// B"H
/** @file PhysicsFrameMethods.js @purpose Fast grounded frame loop with timed player stages. */
import * as THREE from "/games/scripts/build/three.module.js";
import Tzomayach from "../../../../tzomayach.js";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?v=perf-tight-collision-20260703-bh2";
import { clearAirTrajectory, needsOctreePhysics } from "./PhysicsAirRuntime.js";
import { terrainFallbackY, clampToTerrainFloor } from "./PhysicsGroundRuntime.js";

const now = () => performance.now();

function beginFrameStats(player) {
  player.__awtsmoosPlayerPhysicsStages = {};
  player.__awtsmoosPlayerPhysicsStarted = now();
}

function timed(player, key, fn) {
  const started = now();
  const result = fn();
  const ms = now() - started;
  const stages = player.__awtsmoosPlayerPhysicsStages || (player.__awtsmoosPlayerPhysicsStages = {});
  stages[key] = Math.round(ms * 10) / 10;
  return result;
}

function finishStats(player) {
  const total = now() - Number(player.__awtsmoosPlayerPhysicsStarted || now());
  const payload = {
    at:Date.now(),
    total:Math.round(total * 10) / 10,
    stages:player.__awtsmoosPlayerPhysicsStages || {},
    animation:player.__awtsmoosPlayerAnimationStats || null
  };
  player.__awtsmoosPlayerPhysicsLast = payload;
  if (player.olam) player.olam.__lastPlayerPhysicsStats = payload;
  return payload;
}

function finishFrame(player, deltaTime) {
  timed(player, "animationState", () => player._updateAnimationState(deltaTime));
  timed(player, "syncMesh", () => player._syncMesh(deltaTime));
  timed(player, "alignObject", () => { if (player.activeObject && typeof player.alignObject === "function") player.alignObject(); });
  timed(player, "tzomayach", () => Tzomayach.prototype.heesHawvoos.call(player, deltaTime));
}

function primeJump(player) {
  if (!player?.moving?.jump || player.didJump) return;
  player._clampToTerrainFloor?.();
  if (!player.onFloor) clampToTerrainFloor(player, .02);
}

export default {
  heesHawvoos(dt) {
    if (!this.mesh || !this.collider || !this.velocity) return;
    beginFrameStats(this);
    const deltaTime = Math.min(dt, .1);
    if (this.isTeleporting) {
      this.isTeleporting = false;
      timed(this, "teleportSync", () => this._syncMesh(deltaTime));
      finishStats(this);
      return;
    }
    if (timed(this, "nanCheck", () => this._checkNaNAndReset())) {
      finishStats(this);
      return;
    }
    timed(this, "subSystems", () => this._updateSubSystems(deltaTime));
    const isWorldBusy = this.olam?.worldOctree ? this.olam.worldOctree.isProcessing : true;
    if (!needsOctreePhysics(this)) {
      const result = timed(this, "idlePhysics", () => this._idlePhysics(deltaTime));
      finishStats(this);
      return result;
    }
    if (this.collider?.start) this.__lastSafeFeet = new THREE.Vector3(this.collider.start.x, this.collider.start.y - this.collider.radius, this.collider.start.z);
    timed(this, "primeJump", () => primeJump(this));
    timed(this, "clampA", () => this._clampToTerrainFloor());
    timed(this, "checkGround", () => this._checkGround());
    timed(this, "dynamicPre", () => this._solveDynamicBodies("pre-forces"));
    timed(this, "forces", () => this._applyPhysicsForces(deltaTime, isWorldBusy));
    timed(this, "movementVelocity", () => this._calculateMovementVelocity(deltaTime));
    timed(this, "jump", () => this._handleJump());
    timed(this, "executeMovement", () => this._executeMovement(deltaTime));
    timed(this, "resolveGround", () => this._resolveGroundCollision());
    timed(this, "clampB", () => this._clampToTerrainFloor());
    timed(this, "slopeLimit", () => this._enforceTerrainSlopeLimit());
    timed(this, "dynamicPost", () => this._solveDynamicBodies("post-motion"));
    timed(this, "abyss", () => this._checkAbyss());
    timed(this, "bubbleFrame", () => ensurePlayerCollisionBubble(this.olam)?.frame?.(this, { fallbackFn:(x, z, fallback) => terrainFallbackY(this, x, z, fallback) }));
    timed(this, "finishFrame", () => finishFrame(this, deltaTime));
    finishStats(this);
  },
  _idlePhysics(deltaTime) {
    if (this.moving?.jump) return this.heesHawvoos(deltaTime);
    this.velocity.set(0, 0, 0);
    clearAirTrajectory(this);
    timed(this, "idleClamp", () => this._clampIdleToTerrain(deltaTime));
    timed(this, "idleAlign", () => { if (this.activeObject && typeof this.alignObject === "function") this.alignObject(); });
    timed(this, "idleTzomayach", () => Tzomayach.prototype.heesHawvoos.call(this, deltaTime));
  }
};
