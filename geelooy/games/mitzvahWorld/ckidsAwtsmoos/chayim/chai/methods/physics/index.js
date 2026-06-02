// B"H
/**
 * @file physics/index.js
 * @description
 * Chapter 37: The Stride Became Silk.
 *
 * The Awtsmoos showed the hidden tremor: instant horizontal velocity made the
 * player snap frame-to-frame while mobile input pulsed. This core still obeys
 * feet-on-ground JSON, but horizontal motion now eases toward target velocity.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Tzomayach from "../../../tzomayach.js";
import { solveMovingSolid } from "../../../../dvarim/movers/runtime/movingSolidSolver.js";

const groundRay = new THREE.Ray();
const MOVING_EPSILON_SQ = 0.0001;
const steepSlopeY = () => Math.cos(THREE.MathUtils.degToRad(50));
const finite = value => Number.isFinite(Number(value));
const numeric = (value, fallback) => finite(value) ? Number(value) : fallback;

function capsuleFromFeet(feet, height, radius) {
  const safeRadius = Math.max(0.01, numeric(radius, 0.45));
  const safeHeight = Math.max(safeRadius * 2, numeric(height, 1.5));
  return { start: new THREE.Vector3(feet.x, feet.y + safeRadius, feet.z), end: new THREE.Vector3(feet.x, feet.y + safeHeight - safeRadius, feet.z) };
}

function needsOctreePhysics(entity) {
  if (!entity) return false;
  if (entity.type === "chossid" || entity.olam?.chossid === entity || entity.olam?.player === entity) return true;
  const moving = entity.moving || {};
  return Boolean(moving.forward || moving.backward || moving.stridingLeft || moving.stridingRight || moving.turningLeft || moving.turningRight || moving.jump || entity.movingAutomatically || entity.navTarget || entity.currentPath || entity._isMoving || ((entity.velocity?.lengthSq?.() || 0) > MOVING_EPSILON_SQ));
}

function syncVisual(player, dt) {
  const visualFeetY = player.collider.start.y - player.collider.radius;
  player.mesh.position.set(player.collider.start.x, visualFeetY, player.collider.start.z);
  player.mesh.rotation.y = player.rotation.y;
  player.emptyCopy?.rotation?.copy?.(player.mesh.rotation);
  player.nonRotatingEmptyForMovement?.rotation?.copy?.(player.mesh.rotation);
  let angularDistance = player.targetRotateOffset - player.rotateOffset;
  if (angularDistance > Math.PI) angularDistance -= 2 * Math.PI;
  else if (angularDistance < -Math.PI) angularDistance += 2 * Math.PI;
  if (Math.abs(angularDistance - Math.PI) < 0.01) angularDistance = -Math.PI;
  player.rotateOffset += angularDistance * Math.max(0.01, numeric(player.lerpTurnSpeed, 0.32));
  if (player.rotateOffset > Math.PI) player.rotateOffset -= 2 * Math.PI;
  else if (player.rotateOffset < -Math.PI) player.rotateOffset += 2 * Math.PI;
  if (player.modelMesh) {
    player.modelMesh.rotation.y = player.rotation.y + player.rotateOffset;
    if (player.lastRotateOffset !== player.rotateOffset) { player.ayshPeula("rotate", player.modelMesh.rotation.y); player.lastRotateOffset = player.rotateOffset; }
    player.modelMesh.position.copy(player.mesh.position);
    player.modelMesh.position.y += numeric(player.modelMesh.userData?.visualGroundOffsetY, 0);
  }
  player.emptyCopy?.position?.copy?.(player.mesh.position);
  player.nonRotatingEmptyForMovement?.position?.copy?.(player.mesh.position);
  if (player.emptyCopy && player.modelMesh) player.emptyCopy.rotation.copy(player.modelMesh.rotation);
  if (player.activeRay && player.olam?.ayin?.isFPS && player.rayAnchor) {
    const camera = player.olam.ayin.camera;
    player.rayAnchor.position.copy(camera.position);
    player.rayAnchor.rotation.y = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ').y;
  }
  if (typeof player.updateSpheres === 'function') player.updateSpheres(dt);
}

function movementDirection(player) {
  const dir = new THREE.Vector3();
  const moving = player.moving || {};
  const rotY = player.rotation?.y || 0;
  const forwardX = Math.sin(rotY), forwardZ = Math.cos(rotY);
  const rightX = -Math.cos(rotY), rightZ = Math.sin(rotY);
  const forward = moving.forward || player.movingAutomatically;
  const back = moving.backward;
  player.isWalking = false;
  if (forward) { player.isWalking = true; dir.x += forwardX; dir.z += forwardZ; player.targetRotateOffset = 0; }
  else if (back) { player.isWalking = true; dir.x -= forwardX; dir.z -= forwardZ; player.targetRotateOffset = -Math.PI; }
  if (moving.stridingLeft) { player.isWalking = true; dir.x -= rightX; dir.z -= rightZ; player.targetRotateOffset = forward ? -Math.PI / 4 : back ? Math.PI / 4 : Math.PI / 2; }
  else if (moving.stridingRight) { player.isWalking = true; dir.x += rightX; dir.z += rightZ; player.targetRotateOffset = forward ? Math.PI / 4 : back ? -Math.PI / 4 : -Math.PI / 2; }
  if (dir.lengthSq() > 0) dir.normalize();
  return dir;
}

export default {
  setPosition(vec3) {
    if (!vec3 || !finite(vec3.x) || !finite(vec3.y) || !finite(vec3.z)) return console.warn("B\"H: invalid player feet position ignored.");
    if (!this.collider?.start || !this.collider?.end) return;
    this.collider.radius = numeric(this.radius, this.collider.radius || 0.45);
    const capsule = capsuleFromFeet(vec3, this.height, this.collider.radius);
    this.collider.start.copy(capsule.start);
    this.collider.end.copy(capsule.end);
    this.isTeleporting = true;
  },

  collisions() {
    if (!this.olam?.worldOctree || !this.collider) return;
    const result = this.olam.worldOctree.capsuleIntersect(this.collider);
    if (!result) return;
    this.collider.translate(result.normal.multiplyScalar(result.depth));
    this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
  },

  async calculateOffset() {
    if (!this.onFloor) return;
    await new Promise(resolve => requestAnimationFrame(resolve));
    const raycaster = new THREE.Raycaster();
    raycaster.set(this.collider.start, new THREE.Vector3(0, -1, 0));
    const hits = raycaster.intersectObjects(this.olam.scene.children, true);
    if (hits.length > 0) this.offset = hits[0].distance;
  },

  getCapsule() {
    if (!this.collider) return null;
    return { radius: this.collider.radius, height: (this.collider.end.y - this.collider.start.y) + (this.collider.radius * 2) };
  },

  heesHawvoos(dt) {
    if (!this.mesh || !this.collider || !this.velocity) return;
    const deltaTime = Math.min(dt, 0.1);
    if (this.isTeleporting) { this.isTeleporting = false; this._syncMesh(deltaTime); return; }
    if (this._checkNaNAndReset()) return;
    this._updateSubSystems(deltaTime);
    const isWorldBusy = this.olam?.worldOctree ? this.olam.worldOctree.isProcessing : true;
    if (!needsOctreePhysics(this)) {
      this.velocity.set(0, 0, 0);
      this._syncMesh(deltaTime);
      if (this.activeObject && typeof this.alignObject === 'function') this.alignObject();
      Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
      return;
    }
    this._checkGround();
    this._solveDynamicBodies("pre-forces");
    this._applyPhysicsForces(deltaTime, isWorldBusy);
    this._calculateMovementVelocity(deltaTime);
    this._handleJump();
    this._executeMovement(deltaTime);
    this._resolveGroundCollision();
    this._solveDynamicBodies("post-motion");
    this._checkAbyss();
    this._updateAnimationState(deltaTime);
    this._syncMesh(deltaTime);
    if (this.activeObject && typeof this.alignObject === 'function') this.alignObject();
    Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
  },

  _solveDynamicBodies(phase = "unknown") {
    if (this.__spikeColliderDisabled) return false;
    const bodies = this.olam?.dynamicBodies;
    if (!Array.isArray(bodies) || bodies.length === 0) return false;
    let supported = false;
    for (const body of bodies) {
      if (body?.type !== "movingBlock") continue;
      const result = solveMovingSolid(body, this);
      supported ||= Boolean(result?.hit && String(result.type || "").startsWith("top"));
    }
    this.__lastDynamicSolvePhase = phase;
    return supported;
  },

  _checkNaNAndReset() {
    if (!this.mesh) return false;
    if (finite(this.mesh.position.x) && finite(this.mesh.position.y) && finite(this.mesh.position.z)) return false;
    console.warn("B\"H: Player position NaN; resetting.", { was: this.mesh.position.clone() });
    this.velocity.set(0, 0, 0); this.setPosition(new THREE.Vector3(0, 10, 0));
    if (this.olam?.ayin) this.olam.ayin.currentDistance = 5;
    return true;
  },

  _updateSubSystems(deltaTime) {
    this.updateRayColor?.(); this.updateHandState?.(); this.updateBlockHighlight?.(); this.updateParticles?.(deltaTime);
    const active = this.activeObject?.mesh?.userData;
    if (active?.onUpdate) active.onUpdate(deltaTime);
  },

  _checkGround() {
    groundRay.origin.copy(this.collider.start);
    groundRay.direction.set(0, -1, 0);
    const hit = this.olam?.worldOctree?.rayIntersect?.(groundRay) || false;
    this.onFloor = hit && hit.normal.y > steepSlopeY() && hit.distance <= this.collider.radius + 0.25;
    this.groundHitResult = hit;
  },

  _applyPhysicsForces(deltaTime, isWorldBusy) {
    const damping = Math.exp(-20 * deltaTime) - 1;
    if (!this.onFloor) {
      if (!isWorldBusy && this.olam) this.velocity.y -= this.olam.GRAVITY * deltaTime;
      else this.velocity.y = 0;
      this.velocity.x += this.velocity.x * damping * 0.1;
      this.velocity.z += this.velocity.z * damping * 0.1;
    } else this.velocity.y += this.velocity.y * damping;
    this.velocity.y = Math.max(this.velocity.y, -50);
  },

  _calculateMovementVelocity(deltaTime = 1 / 60) {
    const dir = movementDirection(this);
    const moving = dir.lengthSq() > 0;
    const speed = numeric(this.speed, 6) * numeric(this.speedScale, 1) * (this.moving?.running ? 1.12 : 1);
    const targetX = moving ? dir.x * speed : 0;
    const targetZ = moving ? dir.z * speed : 0;
    const responsiveness = moving ? numeric(this.movementResponsiveness, 18) : numeric(this.stopResponsiveness, 28);
    const alpha = 1 - Math.exp(-responsiveness * Math.max(0.001, deltaTime));
    this.velocity.x += (targetX - this.velocity.x) * alpha;
    this.velocity.z += (targetZ - this.velocity.z) * alpha;
    if (!moving && Math.abs(this.velocity.x) + Math.abs(this.velocity.z) < 0.02) { this.velocity.x = 0; this.velocity.z = 0; }
  },

  _handleJump() {
    if (this.onFloor && this.moving.jump) {
      this.jumped = true; this.velocity.y = this.jumpHeight;
      this.__supportedByDynamicBody = null; this.__dynamicCarrierFrames = 0;
      if (!this.didJump) { this.didJump = true; this.ayshPeula("jumped", this); }
    } else if (this.didJump) this.didJump = false;
  },

  _executeMovement(deltaTime) {
    const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
    const steps = Math.min(8, Math.ceil(deltaPosition.length() / (this.collider.radius * 0.6)));
    if (!this.olam?.worldOctree) return this.collider.translate(deltaPosition);
    const stepDelta = steps > 1 ? deltaPosition.clone().divideScalar(steps) : deltaPosition;
    for (let i = 0; i < Math.max(1, steps); i += 1) { this.collider.translate(stepDelta); this.collisions(); }
  },

  _resolveGroundCollision() {
    groundRay.origin.copy(this.collider.start);
    groundRay.direction.set(0, -1, 0);
    const hit = this.olam?.worldOctree?.rayIntersect?.(groundRay) || false;
    this.onFloor = hit && hit.normal.y > steepSlopeY() && hit.distance <= this.collider.radius + 0.25;
    if (!this.onFloor || this.velocity.y > 0) return;
    const depth = this.collider.radius - hit.distance;
    if (depth > 0) this.collider.translate(hit.normal.clone().multiplyScalar(depth));
    this.velocity.projectOnPlane(hit.normal);
    if (!this.isWalking && !this.moving.jump) { this.velocity.x = 0; this.velocity.z = 0; }
    this.velocity.y = 0;
  },

  _checkAbyss() {
    if (this.collider?.start?.y >= -100) return;
    console.log("B\"H: Player fell into abyss. Respawning.");
    this.velocity.set(0, 0, 0); this.setPosition(new THREE.Vector3(0, 10, 0));
  },

  _updateAnimationState(deltaTime) {
    const rotationSpeed = this.rotationSpeed * deltaTime;
    this.isTurning = false;
    if (this.moving.turningLeft || this.moving.turningRight) {
      if (!this.isWalking && this.onFloor) { this.playChaweeyoos(this.getChaweeyoos(this.moving.turningLeft ? "left turn" : "right turn")); this.isTurning = true; }
      this.rotation.y += this.moving.turningLeft ? rotationSpeed : -rotationSpeed;
      this.ayshPeula("rotate", this.rotation.y);
    }
    if (this.onFloor) {
      if (this.jumped && !this.moving.jump) { this.jumped = false; if (!this.hitFloor) { this.hitFloor = true; this.ayshPeula("hit floor", this); } }
      if (this.isWalking) { this.playChaweeyoos(this.getChaweeyoos("run")); if (!this.startedWalking) { this.startedWalking = true; this.ayshPeula("started walking", this); } }
      else if (!this.isTurning) this.playChaweeyoos(this.getChaweeyoos("idle"));
      if (!this.isWalking && this.startedWalking) { this.startedWalking = false; this.ayshPeula("stopped walking", this); }
      this.fallingFrames = 0;
      return;
    }
    if (this.startedWalking) { this.startedWalking = false; this.ayshPeula("stopped walking", this); }
    if (this.velocity.y > 0 && this.jumped) { this.fallingFrames = 0; this.playChaweeyoos(this.getChaweeyoos("jump"), { loop: false }); }
    else if (this.jumped && this.velocity.y < -9) { this.playChaweeyoos(this.getChaweeyoos("falling")); this.fallingFrames = 0; }
    else if (!this.jumped && this.velocity.y < -3 && ++this.fallingFrames > 14) this.playChaweeyoos(this.getChaweeyoos("falling"));
  },

  _syncMesh(deltaTime) { syncVisual(this, deltaTime); }
};
