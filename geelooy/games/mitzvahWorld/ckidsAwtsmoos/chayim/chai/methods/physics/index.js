// B"H
/**
 * @file physics/index.js
 * @description Chapter 85: moving platforms enter the law before jumping.
 * The Awtsmoos revealed the bug: static octree ground is checked before jump,
 * but moving platforms were solved only after movement, too late for `jump` and
 * too late for ordinary grounded acceleration. Now dynamic floors answer right
 * after static ground detection, then again after motion for final correction.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Utils from "../../../../utils.js";
import Tzomayach from "../../../tzomayach.js";
import { solveMovingSolid } from "../../../../dvarim/movers/runtime/movingSolidSolver.js";

const groundRay = new THREE.Ray();
const MOVING_EPSILON_SQ = 0.0001;
const steepSlopeY = () => Math.cos(THREE.MathUtils.degToRad(50));

function needsOctreePhysics(entity) {
  if (!entity) return false;
  if (entity.type === "chossid" || entity.olam?.chossid === entity || entity.olam?.player === entity) return true;
  const moving = entity.moving || {};
  return Boolean(moving.forward || moving.backward || moving.stridingLeft || moving.stridingRight || moving.turningLeft || moving.turningRight || moving.jump || entity.movingAutomatically || entity.navTarget || entity.currentPath || entity._isMoving || ((entity.velocity?.lengthSq?.() || 0) > MOVING_EPSILON_SQ));
}

function syncVisual(player, dt) {
  player.mesh.position.copy(player.collider.start);
  player.mesh.position.y -= player.radius;
  player.mesh.rotation.y = player.rotation.y;
  player.emptyCopy?.rotation?.copy?.(player.mesh.rotation);
  player.nonRotatingEmptyForMovement?.rotation?.copy?.(player.mesh.rotation);
  let angularDistance = player.targetRotateOffset - player.rotateOffset;
  if (angularDistance > Math.PI) angularDistance -= 2 * Math.PI;
  else if (angularDistance < -Math.PI) angularDistance += 2 * Math.PI;
  if (Math.abs(angularDistance - Math.PI) < 0.01) angularDistance = -Math.PI;
  player.rotateOffset += angularDistance * player.lerpTurnSpeed;
  if (player.rotateOffset > Math.PI) player.rotateOffset -= 2 * Math.PI;
  else if (player.rotateOffset < -Math.PI) player.rotateOffset += 2 * Math.PI;
  if (player.modelMesh) {
    player.modelMesh.rotation.y = player.rotation.y + player.rotateOffset;
    if (player.lastRotateOffset !== player.rotateOffset) {
      player.ayshPeula("rotate", player.modelMesh.rotation.y);
      player.lastRotateOffset = player.rotateOffset;
    }
    player.modelMesh.position.copy(player.mesh.position);
    const offset = player.modelMesh.userData?.visualGroundOffsetY;
    if (Number.isFinite(offset)) player.modelMesh.position.y += offset;
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

export default {
  setPosition(vec3) {
    if (!vec3 || isNaN(vec3.x) || isNaN(vec3.y) || isNaN(vec3.z)) return console.warn("B\"H: invalid player position ignored.");
    if (!this.collider?.start || !this.collider?.end) return;
    this.collider.start.set(vec3.x, vec3.y + this.height / 2, vec3.z);
    this.collider.end.set(vec3.x, vec3.y + this.height, vec3.z);
    this.collider.radius = this.radius;
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
    return { radius: this.collider.radius, height: this.collider.end.y - this.collider.start.y };
  },

  heesHawvoos(dt) {
    if (!this.mesh || !this.collider || !this.velocity) return;
    const deltaTime = Math.min(dt, 0.1);
    if (this.isTeleporting) { this.isTeleporting = false; return; }
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
    if (!isNaN(this.mesh.position.x) && !isNaN(this.mesh.position.y) && !isNaN(this.mesh.position.z)) return false;
    console.warn("B\"H: Player position NaN; resetting.", { was: this.mesh.position.clone() });
    this.velocity.set(0, 0, 0);
    this.setPosition(new THREE.Vector3(0, 15, 0));
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
    this.onFloor = hit && hit.normal.y > steepSlopeY() && hit.distance <= this.radius + 0.25;
    this.groundHitResult = hit;
  },

  _applyPhysicsForces(deltaTime, isWorldBusy) {
    const damping = Math.exp(-20 * deltaTime) - 1;
    if (!this.onFloor) {
      if (!isWorldBusy && this.olam) this.velocity.y -= this.olam.GRAVITY * deltaTime;
      else this.velocity.y = 0;
      this.velocity.x += this.velocity.x * damping * 0.1;
      this.velocity.z += this.velocity.z * damping * 0.1;
    } else this.velocity.addScaledVector(this.velocity, damping);
    this.velocity.y = Math.max(this.velocity.y, -50);
  },

  _calculateMovementVelocity(deltaTime) {
    let speedDelta = deltaTime * (this.onFloor ? this.speed * this.speedScale : 8);
    if (!this.moving.running) speedDelta *= 0.5;
    const combined = new THREE.Vector3();
    this.isWalking = false;
    const forward = this.moving.forward || this.movingAutomatically;
    const back = this.moving.backward;
    if (forward) { this.isWalking = true; combined.add(this.getForwardVector().multiplyScalar(speedDelta)); this.targetRotateOffset = 0; }
    else if (back) { this.isWalking = true; combined.add(this.getForwardVector().multiplyScalar(-speedDelta)); this.targetRotateOffset = -Math.PI; }
    if (this.moving.stridingLeft || this.moving.stridingRight) {
      this.isWalking = true;
      const side = Utils.getSideVector(this.nonRotatingEmptyForMovement || this.mesh, this.worldSideDirectionVector).multiplyScalar(this.moving.stridingLeft ? -speedDelta : speedDelta);
      combined.add(side);
      this.targetRotateOffset = this.moving.stridingLeft ? Math.PI / 2 : -Math.PI / 2;
      if (forward) this.targetRotateOffset += this.moving.stridingLeft ? -Math.PI / 4 : Math.PI / 4;
      else if (back) this.targetRotateOffset += this.moving.stridingLeft ? Math.PI / 4 : -Math.PI / 4;
    }
    const total = combined.length(), max = Math.abs(speedDelta);
    if (total > max) combined.multiplyScalar(max / total);
    this.velocity.x += combined.x; this.velocity.z += combined.z;
  },

  _handleJump() {
    if (this.onFloor && this.moving.jump) {
      this.jumped = true; this.velocity.y = this.jumpHeight;
      this.__supportedByDynamicBody = null;
      this.__dynamicCarrierFrames = 0;
      if (!this.didJump) { this.didJump = true; this.ayshPeula("jumped", this); }
    } else if (this.didJump) this.didJump = false;
  },

  _executeMovement(deltaTime) {
    const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
    const steps = Math.min(10, Math.ceil(deltaPosition.length() / (this.collider.radius * 0.5)));
    if (!this.olam?.worldOctree) return this.collider.translate(deltaPosition);
    const stepDelta = steps > 1 ? deltaPosition.clone().divideScalar(steps) : deltaPosition;
    for (let i = 0; i < Math.max(1, steps); i += 1) { this.collider.translate(stepDelta); this.collisions(); }
  },

  _resolveGroundCollision() {
    const hit = this.olam?.worldOctree?.rayIntersect?.(groundRay) || false;
    this.onFloor = hit && hit.normal.y > steepSlopeY() && hit.distance <= this.radius + 0.25;
    if (!this.onFloor || this.velocity.y > 0) return;
    const depth = this.radius - hit.distance;
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
