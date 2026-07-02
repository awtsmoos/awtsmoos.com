// B"H
/**
 * @file PhysicsVisualMethods.js
 * @purpose Syncs capsule feet to visible body and updates movement animations.
 * @owner Live Chossid visible body and animation state.
 * @inputs Player collider, rotation, model mesh, camera ray anchor, and velocity.
 * @outputs Mesh transforms, animation events, and visible body ground clamp.
 * @runtimeAuthority Visual synchronization only; ground truth stays in physics ground modules.
 * @updateOrder Runs after collision/motion resolution each frame.
 * @callers physics/index.js default method table.
 * @invariants Visual Y follows capsule feet plus authored visual offset only.
 * @failureModes Missing model/camera auxiliaries are ignored.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { clampVisibleBodyAboveFeet } from "../VisualGroundClamp.js?v=solid-browser-verify-20260702-bh11";
import { clearAirTrajectory, setAnim } from "./PhysicsAirRuntime.js";
import { normAngle, numeric } from "./PhysicsNumbers.js";

function syncVisual(player, dt) {
  const visualFeetY = player.collider.start.y - player.collider.radius;
  player.mesh.position.set(player.collider.start.x, visualFeetY, player.collider.start.z); player.mesh.rotation.y = player.rotation.y;
  player.emptyCopy?.rotation?.copy?.(player.mesh.rotation); player.nonRotatingEmptyForMovement?.rotation?.copy?.(player.mesh.rotation);
  player.targetRotateOffset = normAngle(player.targetRotateOffset || 0); player.rotateOffset = normAngle(player.rotateOffset || 0);
  const angularDistance = normAngle(player.targetRotateOffset - player.rotateOffset);
  player.rotateOffset = normAngle(player.rotateOffset + angularDistance * Math.max(0.01, numeric(player.lerpTurnSpeed, 0.32)));
  if (player.modelMesh) {
    const parentedToRoot = player.modelMesh.parent === player.mesh;
    player.modelMesh.rotation.y = normAngle((parentedToRoot ? 0 : player.rotation.y) + player.rotateOffset);
    if (player.lastRotateOffset !== player.rotateOffset) { player.ayshPeula("rotate", player.modelMesh.rotation.y); player.lastRotateOffset = player.rotateOffset; }
    if (parentedToRoot) player.modelMesh.position.set(0, numeric(player.modelMesh.userData?.visualGroundOffsetY, 0), 0);
    else { player.modelMesh.position.copy(player.mesh.position); player.modelMesh.position.y += numeric(player.modelMesh.userData?.visualGroundOffsetY, 0); }
  }
  clampVisibleBodyAboveFeet(player); player.emptyCopy?.position?.copy?.(player.mesh.position);
  player.nonRotatingEmptyForMovement?.position?.copy?.(player.mesh.position);
  if (player.emptyCopy && player.modelMesh) player.emptyCopy.rotation.copy(player.modelMesh.rotation);
  if (player.activeRay && player.olam?.ayin?.isFPS && player.rayAnchor) {
    const camera = player.olam.ayin.camera; player.rayAnchor.position.copy(camera.position);
    player.rayAnchor.rotation.y = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ").y;
  }
  player.updateSpheres?.(dt);
}

export default {
  _updateAnimationState(deltaTime) {
    const rotationSpeed = this.rotationSpeed * deltaTime; this.isTurning = false;
    if (this.moving.turningLeft || this.moving.turningRight) {
      if (!this.isWalking && this.onFloor) { setAnim(this, this.moving.turningLeft ? "left turn" : "right turn"); this.isTurning = true; }
      this.rotation.y = normAngle(this.rotation.y + (this.moving.turningLeft ? rotationSpeed : -rotationSpeed)); this.ayshPeula("rotate", this.rotation.y);
    }
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
  _syncMesh(deltaTime) { syncVisual(this, deltaTime); },
};
