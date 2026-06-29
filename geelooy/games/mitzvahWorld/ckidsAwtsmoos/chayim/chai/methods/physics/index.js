// B"H
/**
 * @file physics/index.js
 * @description
 * Chapter 321: The player stands on the terrain law even when the octree blinks.
 *
 * The Awtsmoos taught the harsh lesson: an octree can be busy, subdividing, or
 * missing a mobile frame, but the earth already published its height function.
 * Physics now asks both witnesses: first collision geometry, then terrain law.
 * A failed ray no longer means abyss.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Tzomayach from "../../../tzomayach.js";
import TerrainMath from "../../../../dvarim/terrain/core/TerrainMath.js";
import { solveMovingSolid } from "../../../../dvarim/movers/runtime/movingSolidSolver.js";
import { clampVisibleBodyAboveFeet } from "./VisualGroundClamp.js?v=visual-ground-clamp-20260629-bh1";

const groundRay = new THREE.Ray();
const MOVING_EPSILON_SQ = 0.0001;
const steepSlopeY = () => Math.cos(THREE.MathUtils.degToRad(50));
const finite = value => Number.isFinite(Number(value));
const numeric = (value, fallback) => finite(value) ? Number(value) : fallback;
const normAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

function capsuleFromFeet(feet, height, radius) {
  const r = Math.max(0.01, numeric(radius, 0.45));
  const h = Math.max(r * 2, numeric(height, 1.5));
  return { start: new THREE.Vector3(feet.x, feet.y + r, feet.z), end: new THREE.Vector3(feet.x, feet.y + h - r, feet.z) };
}
function needsOctreePhysics(entity) {
  if (!entity) return false;
  if (entity.type === "chossid" || entity.olam?.chossid === entity || entity.olam?.player === entity) return true;
  const m = entity.moving || {};
  return Boolean(m.forward || m.backward || m.stridingLeft || m.stridingRight || m.turningLeft || m.turningRight || m.jump || entity.movingAutomatically || entity.navTarget || entity.currentPath || entity._isMoving || ((entity.velocity?.lengthSq?.() || 0) > MOVING_EPSILON_SQ));
}
function terrainLawHit(player) {
  const law = player?.olam?.awtsmoosTerrainLaw;
  const start = player?.collider?.start;
  if (!law?.data || !start) return false;
  const lx = start.x - numeric(law.position?.x, 0);
  const lz = start.z - numeric(law.position?.z, 0);
  const y = numeric(law.position?.y, 0) + TerrainMath.calculateHeightAt(lx, lz, law.data);
  if (!finite(y)) return false;
  const e = 1.25, hx1 = TerrainMath.calculateHeightAt(lx + e, lz, law.data), hx0 = TerrainMath.calculateHeightAt(lx - e, lz, law.data), hz1 = TerrainMath.calculateHeightAt(lx, lz + e, law.data), hz0 = TerrainMath.calculateHeightAt(lx, lz - e, law.data);
  const normal = new THREE.Vector3(-(hx1 - hx0) / (e * 2), 1, -(hz1 - hz0) / (e * 2)).normalize();
  return { distance: start.y - y, position: new THREE.Vector3(start.x, y, start.z), normal, object: { name: "awtsmoosTerrainLawFallback" }, lawFallback: true };
}
function bestGroundHit(player) {
  groundRay.origin.copy(player.collider.start);
  groundRay.direction.set(0, -1, 0);
  const oct = player.olam?.worldOctree?.rayIntersect?.(groundRay) || false;
  const law = terrainLawHit(player);
  if (!law) return oct;
  if (!oct) return law;
  if (!oct.normal || oct.normal.y <= steepSlopeY()) return law;
  if (law.distance >= -0.5 && law.distance < oct.distance + 0.35) return law;
  return oct;
}
function clampToTerrainFloor(player, slack = 0.015) {
  const law = terrainLawHit(player);
  if (!law || !player?.collider?.start || !player?.collider?.end) return false;
  const radius = numeric(player.collider.radius, numeric(player.radius, 0.45));
  const minStartY = law.position.y + radius + slack;
  if (player.collider.start.y >= minStartY) return false;
  const lift = minStartY - player.collider.start.y;
  player.collider.start.y += lift;
  player.collider.end.y += lift;
  if (player.velocity) player.velocity.y = Math.max(0, numeric(player.velocity.y, 0));
  player.onFloor = true;
  player.groundHitResult = law;
  clearAirTrajectory(player);
  return true;
}
function setAnim(player, key, options) {
  const resolved = player.getChaweeyoos(key);
  if (!resolved) return;
  const guard = `${key}:${resolved}`;
  if (player.__lastAnimKey === guard && !options?.force) return;
  player.__lastAnimKey = guard;
  player.playChaweeyoos(resolved, options);
}
function movementDirection(player) {
  const direction = new THREE.Vector3();
  const moving = player.moving || {}, rotY = player.rotation?.y || 0;
  const forwardX = Math.sin(rotY), forwardZ = Math.cos(rotY), sideX = Math.cos(rotY), sideZ = -Math.sin(rotY);
  const forward = moving.forward || player.movingAutomatically, back = moving.backward;
  player.isWalking = false;
  if (forward) { player.isWalking = true; direction.x += forwardX; direction.z += forwardZ; player.targetRotateOffset = 0; }
  else if (back) { player.isWalking = true; direction.x -= forwardX; direction.z -= forwardZ; player.targetRotateOffset = -Math.PI; }
  if (moving.stridingLeft) {
    player.isWalking = true; direction.x -= sideX; direction.z -= sideZ; player.targetRotateOffset = Math.PI / 2;
    if (forward) player.targetRotateOffset -= Math.PI / 4; else if (back) player.targetRotateOffset += Math.PI / 4;
  } else if (moving.stridingRight) {
    player.isWalking = true; direction.x += sideX; direction.z += sideZ; player.targetRotateOffset = -Math.PI / 2;
    if (forward) player.targetRotateOffset += Math.PI / 4; else if (back) player.targetRotateOffset -= Math.PI / 4;
  }
  player.targetRotateOffset = normAngle(player.targetRotateOffset || 0);
  if (direction.lengthSq() > 0) direction.normalize();
  return direction;
}
function syncVisual(player, dt) {
  const visualFeetY = player.collider.start.y - player.collider.radius;
  player.mesh.position.set(player.collider.start.x, visualFeetY, player.collider.start.z);
  player.mesh.rotation.y = player.rotation.y;
  player.emptyCopy?.rotation?.copy?.(player.mesh.rotation);
  player.nonRotatingEmptyForMovement?.rotation?.copy?.(player.mesh.rotation);
  player.targetRotateOffset = normAngle(player.targetRotateOffset || 0);
  player.rotateOffset = normAngle(player.rotateOffset || 0);
  const angularDistance = normAngle(player.targetRotateOffset - player.rotateOffset);
  player.rotateOffset = normAngle(player.rotateOffset + angularDistance * Math.max(0.01, numeric(player.lerpTurnSpeed, 0.32)));
  if (player.modelMesh) {
    const parentedToRoot = player.modelMesh.parent === player.mesh;
    player.modelMesh.rotation.y = normAngle((parentedToRoot ? 0 : player.rotation.y) + player.rotateOffset);
    if (player.lastRotateOffset !== player.rotateOffset) { player.ayshPeula("rotate", player.modelMesh.rotation.y); player.lastRotateOffset = player.rotateOffset; }
    if (parentedToRoot) player.modelMesh.position.set(0, numeric(player.modelMesh.userData?.visualGroundOffsetY, 0), 0);
    else { player.modelMesh.position.copy(player.mesh.position); player.modelMesh.position.y += numeric(player.modelMesh.userData?.visualGroundOffsetY, 0); }
  }
  clampVisibleBodyAboveFeet(player);
  player.emptyCopy?.position?.copy?.(player.mesh.position);
  player.nonRotatingEmptyForMovement?.position?.copy?.(player.mesh.position);
  if (player.emptyCopy && player.modelMesh) player.emptyCopy.rotation.copy(player.modelMesh.rotation);
  if (player.activeRay && player.olam?.ayin?.isFPS && player.rayAnchor) {
    const camera = player.olam.ayin.camera;
    player.rayAnchor.position.copy(camera.position);
    player.rayAnchor.rotation.y = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ').y;
  }
  player.updateSpheres?.(dt);
}
function captureAirTrajectory(player) { player.__airTrajectoryLocked = true; player.__airVelocityX = numeric(player.velocity?.x, 0); player.__airVelocityZ = numeric(player.velocity?.z, 0); }
function clearAirTrajectory(player) { player.__airTrajectoryLocked = false; player.__airVelocityX = 0; player.__airVelocityZ = 0; }
function applyLockedAirTrajectory(player) { if (!player.__airTrajectoryLocked) return false; player.velocity.x = numeric(player.__airVelocityX, 0); player.velocity.z = numeric(player.__airVelocityZ, 0); return true; }

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
    const result = this.olam?.worldOctree?.capsuleIntersect?.(this.collider);
    if (!result) return;
    this.collider.translate(result.normal.multiplyScalar(result.depth));
    this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
    if (this.__airTrajectoryLocked) { this.__airVelocityX = this.velocity.x; this.__airVelocityZ = this.velocity.z; }
  },
  async calculateOffset() {
    if (!this.onFloor) return;
    await new Promise(resolve => requestAnimationFrame(resolve));
    const raycaster = new THREE.Raycaster();
    raycaster.set(this.collider.start, new THREE.Vector3(0, -1, 0));
    const hits = raycaster.intersectObjects(this.olam.scene.children, true);
    if (hits.length > 0) this.offset = hits[0].distance;
  },
  getCapsule() { if (!this.collider) return null; return { radius: this.collider.radius, height: (this.collider.end.y - this.collider.start.y) + (this.collider.radius * 2) }; },
  heesHawvoos(dt) {
    if (!this.mesh || !this.collider || !this.velocity) return;
    const deltaTime = Math.min(dt, 0.1);
    if (this.isTeleporting) { this.isTeleporting = false; this._syncMesh(deltaTime); return; }
    if (this._checkNaNAndReset()) return;
    this._updateSubSystems(deltaTime);
    const isWorldBusy = this.olam?.worldOctree ? this.olam.worldOctree.isProcessing : true;
    if (!needsOctreePhysics(this)) return this._idlePhysics(deltaTime);
    if (this.collider?.start) this.__lastSafeFeet = new THREE.Vector3(this.collider.start.x, this.collider.start.y - this.collider.radius, this.collider.start.z);
    clampToTerrainFloor(this);
    this._checkGround(); this._solveDynamicBodies("pre-forces"); this._applyPhysicsForces(deltaTime, isWorldBusy);
    this._calculateMovementVelocity(deltaTime); this._handleJump(); this._executeMovement(deltaTime);
    this._resolveGroundCollision(); clampToTerrainFloor(this); this._enforceTerrainSlopeLimit(); this._solveDynamicBodies("post-motion"); this._checkAbyss(); this._updateAnimationState(deltaTime); this._syncMesh(deltaTime);
    if (this.activeObject && typeof this.alignObject === 'function') this.alignObject();
    Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
  },
  _idlePhysics(deltaTime) { this.velocity.set(0, 0, 0); clearAirTrajectory(this); clampToTerrainFloor(this); this._syncMesh(deltaTime); if (this.activeObject && typeof this.alignObject === 'function') this.alignObject(); Tzomayach.prototype.heesHawvoos.call(this, deltaTime); },
  _solveDynamicBodies(phase = "unknown") {
    if (this.__spikeColliderDisabled) return false;
    const bodies = this.olam?.dynamicBodies; if (!Array.isArray(bodies) || bodies.length === 0) return false;
    let supported = false;
    for (const body of bodies) { if (body?.type !== "movingBlock") continue; const result = solveMovingSolid(body, this); supported ||= Boolean(result?.hit && String(result.type || "").startsWith("top")); }
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
  _updateSubSystems(deltaTime) { this.updateRayColor?.(); this.updateHandState?.(); this.updateBlockHighlight?.(); this.updateParticles?.(deltaTime); this.activeObject?.mesh?.userData?.onUpdate?.(deltaTime); },
  _checkGround() {
    const hit = bestGroundHit(this);
    this.onFloor = Boolean(hit && hit.normal.y > steepSlopeY() && hit.distance <= this.collider.radius + 0.35 && hit.distance >= -1.0);
    this.groundHitResult = hit;
    if (this.onFloor) clearAirTrajectory(this);
  },
  _applyPhysicsForces(deltaTime, isWorldBusy) {
    const damping = Math.exp(-20 * deltaTime) - 1;
    if (!this.onFloor) {
      if (!isWorldBusy && this.olam) this.velocity.y -= this.olam.GRAVITY * deltaTime; else this.velocity.y = Math.min(0, this.velocity.y);
      if (!this.__airTrajectoryLocked) { this.velocity.x += this.velocity.x * damping * 0.1; this.velocity.z += this.velocity.z * damping * 0.1; }
    } else this.velocity.y += this.velocity.y * damping;
    this.velocity.y = Math.max(this.velocity.y, -50);
  },
  _calculateMovementVelocity(deltaTime = 1 / 60) {
    const dir = movementDirection(this);
    if (!this.onFloor && applyLockedAirTrajectory(this)) return;
    const moving = dir.lengthSq() > 0, gaitScale = this.moving?.running ? numeric(this.runModeScale, 1) : numeric(this.walkModeScale, 0.58);
    const speed = numeric(this.speed, 6) * numeric(this.speedScale, 1) * gaitScale;
    const targetX = moving ? dir.x * speed : 0, targetZ = moving ? dir.z * speed : 0;
    const responsiveness = moving ? numeric(this.movementResponsiveness, 16) : numeric(this.stopResponsiveness, 30);
    const alpha = 1 - Math.exp(-responsiveness * Math.max(0.001, deltaTime));
    this.velocity.x += (targetX - this.velocity.x) * alpha; this.velocity.z += (targetZ - this.velocity.z) * alpha;
    if (!moving && Math.abs(this.velocity.x) + Math.abs(this.velocity.z) < 0.0004) { this.velocity.x *= 0.5; this.velocity.z *= 0.5; }
  },
  _handleJump() {
    if (this.onFloor && this.moving.jump) { this.jumped = true; this.onFloor = false; captureAirTrajectory(this); this.velocity.y = this.jumpHeight; this.__supportedByDynamicBody = null; this.__dynamicCarrierFrames = 0; if (!this.didJump) { this.didJump = true; this.__lastAnimKey = null; this.ayshPeula("jumped", this); } }
    else if (this.didJump && !this.moving.jump) this.didJump = false;
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
    const hit = terrainLawHit(this);
    if (!hit || hit.normal.y >= steepSlopeY()) return false;
    const safe = this.__lastSafeFeet;
    if (!safe) return false;
    this.velocity.x = 0; this.velocity.z = 0; clearAirTrajectory(this);
    this.setPosition(new THREE.Vector3(safe.x, Math.max(safe.y, hit.position.y), safe.z));
    this.__lastSlopeBlock = { at:Date.now(), normalY:hit.normal.y, x:hit.position.x, z:hit.position.z };
    return true;
  },
  _checkAbyss() {
    const law = terrainLawHit(this);
    if (law && this.collider.start.y < law.position.y + this.collider.radius - 2) {
      console.warn("B\"H | PLAYER_TERRAIN_LAW_RECOVERY", { fromY: this.collider.start.y, groundY: law.position.y });
      this.velocity.set(0, 0, 0); clearAirTrajectory(this); this.setPosition(new THREE.Vector3(this.collider.start.x, law.position.y, this.collider.start.z)); return;
    }
    if (this.collider?.start?.y >= -100) return;
    console.log("B\"H: Player fell into abyss. Respawning."); this.velocity.set(0, 0, 0); clearAirTrajectory(this); this.setPosition(new THREE.Vector3(0, 10, 0));
  },
  _updateAnimationState(deltaTime) {
    const rotationSpeed = this.rotationSpeed * deltaTime; this.isTurning = false;
    if (this.moving.turningLeft || this.moving.turningRight) { if (!this.isWalking && this.onFloor) { setAnim(this, this.moving.turningLeft ? "left turn" : "right turn"); this.isTurning = true; } this.rotation.y = normAngle(this.rotation.y + (this.moving.turningLeft ? rotationSpeed : -rotationSpeed)); this.ayshPeula("rotate", this.rotation.y); }
    if (this.onFloor) {
      if (this.jumped && !this.moving.jump) { this.jumped = false; if (!this.hitFloor) { this.hitFloor = true; this.__lastAnimKey = null; this.ayshPeula("hit floor", this); } }
      if (this.isWalking) { setAnim(this, "run"); if (!this.startedWalking) { this.startedWalking = true; this.ayshPeula("started walking", this); } } else if (!this.isTurning) setAnim(this, "idle");
      if (!this.isWalking && this.startedWalking) { this.startedWalking = false; this.ayshPeula("stopped walking", this); }
      this.fallingFrames = 0; return;
    }
    if (this.startedWalking) { this.startedWalking = false; this.ayshPeula("stopped walking", this); }
    if (this.velocity.y > 0 && this.jumped) { this.fallingFrames = 0; setAnim(this, "jump", { loop: false }); }
    else if (this.velocity.y < -9) { this.fallingFrames = 0; setAnim(this, "falling"); }
    else if (!this.jumped && this.velocity.y < -3 && ++this.fallingFrames > 14) setAnim(this, "falling");
  },
  _syncMesh(deltaTime) { syncVisual(this, deltaTime); }
};
