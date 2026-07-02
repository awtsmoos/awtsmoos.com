// B"H
/** @file PhysicsFrameMethods.js @purpose Fast grounded frame loop with jump proof. */
import * as THREE from "/games/scripts/build/three.module.js";
import Tzomayach from "../../../../tzomayach.js";
import { ensurePlayerCollisionBubble } from "../../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?v=ground-cache-diag-20260701-bh1";
import { clearAirTrajectory, needsOctreePhysics } from "./PhysicsAirRuntime.js";
import { terrainFallbackY, clampToTerrainFloor } from "./PhysicsGroundRuntime.js";
function finishFrame(player, deltaTime) { player._updateAnimationState(deltaTime); player._syncMesh(deltaTime); if (player.activeObject && typeof player.alignObject === "function") player.alignObject(); Tzomayach.prototype.heesHawvoos.call(player, deltaTime); }
function primeJump(player) { if (!player?.moving?.jump || player.didJump) return; player._clampToTerrainFloor?.(); if (!player.onFloor) clampToTerrainFloor(player, .02); }
export default {
  heesHawvoos(dt) { if (!this.mesh || !this.collider || !this.velocity) return; const deltaTime = Math.min(dt, .1); if (this.isTeleporting) { this.isTeleporting = false; this._syncMesh(deltaTime); return; } if (this._checkNaNAndReset()) return; this._updateSubSystems(deltaTime); const isWorldBusy = this.olam?.worldOctree ? this.olam.worldOctree.isProcessing : true; if (!needsOctreePhysics(this)) return this._idlePhysics(deltaTime); if (this.collider?.start) this.__lastSafeFeet = new THREE.Vector3(this.collider.start.x, this.collider.start.y - this.collider.radius, this.collider.start.z); primeJump(this); this._clampToTerrainFloor(); this._checkGround(); this._solveDynamicBodies("pre-forces"); this._applyPhysicsForces(deltaTime, isWorldBusy); this._calculateMovementVelocity(deltaTime); this._handleJump(); this._executeMovement(deltaTime); this._resolveGroundCollision(); this._clampToTerrainFloor(); this._enforceTerrainSlopeLimit(); this._solveDynamicBodies("post-motion"); this._checkAbyss(); ensurePlayerCollisionBubble(this.olam)?.frame?.(this, { fallbackFn:(x, z, fallback) => terrainFallbackY(this, x, z, fallback) }); finishFrame(this, deltaTime); },
  _idlePhysics(deltaTime) { if (this.moving?.jump) return this.heesHawvoos(deltaTime); this.velocity.set(0, 0, 0); clearAirTrajectory(this); this._clampIdleToTerrain(deltaTime); if (this.activeObject && typeof this.alignObject === "function") this.alignObject(); Tzomayach.prototype.heesHawvoos.call(this, deltaTime); }
};
