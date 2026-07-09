// B"H
/** @file PhysicsVisualMethods.js @description Visual sync plus state-gated GLB locomotion clips. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { clampVisibleBodyAboveFeet } from "../VisualGroundClamp.js?compact=true&v=solid-browser-verify-20260702-bh11";
import { setAnim } from "./PhysicsAirRuntime.js?compact=true&v=stable-collision-animation-20260708-bh3";
import { normAngle, numeric } from "./PhysicsNumbers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function syncVisual(p, dt) {
  const y = p.collider.start.y - p.collider.radius;
  p.mesh.position.set(p.collider.start.x, y, p.collider.start.z);
  p.mesh.rotation.y = p.rotation.y;
  p.emptyCopy?.rotation?.copy?.(p.mesh.rotation);
  p.nonRotatingEmptyForMovement?.rotation?.copy?.(p.mesh.rotation);
  p.targetRotateOffset = normAngle(p.targetRotateOffset || 0);
  p.rotateOffset = normAngle(p.rotateOffset || 0);
  const a = normAngle(p.targetRotateOffset - p.rotateOffset);
  p.rotateOffset = normAngle(p.rotateOffset + a * Math.max(0.01, numeric(p.lerpTurnSpeed, 0.32)));
  if (p.modelMesh) {
    const parented = p.modelMesh.parent === p.mesh;
    p.modelMesh.rotation.y = normAngle((parented ? 0 : p.rotation.y) + p.rotateOffset);
    if (p.lastRotateOffset !== p.rotateOffset) {
      p.ayshPeula("rotate", p.modelMesh.rotation.y);
      p.lastRotateOffset = p.rotateOffset;
    }
    if (parented) p.modelMesh.position.set(0, numeric(p.modelMesh.userData?.visualGroundOffsetY, 0), 0);
    else {
      p.modelMesh.position.copy(p.mesh.position);
      p.modelMesh.position.y += numeric(p.modelMesh.userData?.visualGroundOffsetY, 0);
    }
  }
  clampVisibleBodyAboveFeet(p);
  p.emptyCopy?.position?.copy?.(p.mesh.position);
  p.nonRotatingEmptyForMovement?.position?.copy?.(p.mesh.position);
  if (p.emptyCopy && p.modelMesh) p.emptyCopy.rotation.copy(p.modelMesh.rotation);
  if (p.activeRay && p.olam?.ayin?.isFPS && p.rayAnchor) {
    const camera = p.olam.ayin.camera;
    p.rayAnchor.position.copy(camera.position);
    p.rayAnchor.rotation.y = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ").y;
  }
  p.updateSpheres?.(dt);
}

function gait(p) {
  return p.moving?.running || p.olam?.runMode === "run" || p.olam?.inputs?.RUNNING ? "run" : "walk";
}

function airborneAnim(p) {
  const vy = numeric(p.velocity?.y, 0);
  const sinceJump = Date.now() - Number(p.__jumpStartedAt || 0);
  if (p.jumped && vy > -1.2 && sinceJump < 650) return setAnim(p, "jump", { loop:false, timeScale:1, duration:0.1 });
  if (vy < -1.4 || sinceJump > 520) return setAnim(p, "falling", { timeScale:1, duration:0.16 });
}

export default {
  _updateAnimationState(dt) {
    const rs = this.rotationSpeed * dt;
    this.isTurning = false;
    if (this.moving.turningLeft || this.moving.turningRight) {
      if (!this.isWalking && this.onFloor) {
        setAnim(this, this.moving.turningLeft ? "left turn" : "right turn", { timeScale:1, duration:0.16 });
        this.isTurning = true;
      }
      this.rotation.y = normAngle(this.rotation.y + (this.moving.turningLeft ? rs : -rs));
      this.ayshPeula("rotate", this.rotation.y);
    }
    if (!this.onFloor) {
      if (this.startedWalking) {
        this.startedWalking = false;
        this.ayshPeula("stopped walking", this);
      }
      airborneAnim(this);
      return;
    }
    if (this.jumped && !this.moving.jump) this.jumped = false;
    if (this.isWalking) {
      const g = gait(this);
      setAnim(this, g, { timeScale:1, duration:0.18 });
      if (!this.startedWalking) {
        this.startedWalking = true;
        this.ayshPeula("started walking", this);
      }
    } else if (!this.isTurning) setAnim(this, "idle", { timeScale:1, duration:0.2 });
    if (!this.isWalking && this.startedWalking) {
      this.startedWalking = false;
      this.ayshPeula("stopped walking", this);
    }
    this.fallingFrames = 0;
  },

  _syncMesh(dt) { syncVisual(this, dt); }
};
