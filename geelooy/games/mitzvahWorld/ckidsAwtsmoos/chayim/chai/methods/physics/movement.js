// B"H
/**
 * @file movement.js
 * @purpose Provides legacy direct movement velocity for non-split callers.
 * @owner Chai physics compatibility layer.
 * @inputs Player movement flags, rotation.y, velocity, speed, and running state.
 * @outputs X/Z velocity in the same local +Z basis as physics/index.js.
 * @runtimeAuthority Legacy velocity only; ground/collision stays in canonical physics.
 * @updateOrder Loaded by old Chai method composition before split index methods.
 * @callers Legacy physics assemblers and source audits.
 * @invariants Forward is +Z at rotation zero; left uses sideX=-cos and sideZ=sin.
 * @failureModes Missing velocity or movement state makes the method a no-op.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { PHYSICS_CONSTANTS } from "./physicsConstants.js";

export default {
  _calculateMovementVelocity(deltaTime) {
    if (!this.velocity || !this.moving) return;
    const baseSpeed = (this.speed || PHYSICS_CONSTANTS.DEFAULT_SPEED) * (this.speedScale || 1);
    const speed = this.moving.running ? baseSpeed * PHYSICS_CONSTANTS.RUN_MULTIPLIER : baseSpeed;
    const dir = new THREE.Vector3();
    this.isWalking = false;
    let isWalkingForward = false, isWalkingBack = false;
    const rotY = this.rotation ? this.rotation.y : 0;
    const forwardX = Math.sin(rotY), forwardZ = Math.cos(rotY);
    const sideX = -Math.cos(rotY), sideZ = Math.sin(rotY);
    if (this.moving.forward || this.movingAutomatically) {
      this.isWalking = true; isWalkingForward = true; dir.x += forwardX; dir.z += forwardZ; this.targetRotateOffset = 0;
    } else if (this.moving.backward) {
      this.isWalking = true; isWalkingBack = true; dir.x -= forwardX; dir.z -= forwardZ; this.targetRotateOffset = -Math.PI;
    }
    if (this.moving.stridingLeft) {
      this.isWalking = true; dir.x += sideX; dir.z += sideZ; this.targetRotateOffset = Math.PI / 2;
      if (isWalkingForward) this.targetRotateOffset -= Math.PI / 4; else if (isWalkingBack) this.targetRotateOffset += Math.PI / 4;
    } else if (this.moving.stridingRight) {
      this.isWalking = true; dir.x -= sideX; dir.z -= sideZ; this.targetRotateOffset = -Math.PI / 2;
      if (isWalkingForward) this.targetRotateOffset += Math.PI / 4; else if (isWalkingBack) this.targetRotateOffset -= Math.PI / 4;
    }
    if (this.isWalking && dir.length() > 0) { dir.normalize().multiplyScalar(speed); this.velocity.x = dir.x; this.velocity.z = dir.z; }
    else { this.velocity.x = 0; this.velocity.z = 0; }
  },
  _handleJump() {
    if (!this.velocity || !this.moving) return;
    if (this.onFloor && this.moving.jump && !this.didJump) {
      this.jumped = true; this.velocity.y = this.jumpHeight || 12; this.didJump = true; this.onFloor = false;
      if (typeof this.ayshPeula === "function") this.ayshPeula("jumped", this);
    }
    if (!this.moving.jump) this.didJump = false;
  }
};
