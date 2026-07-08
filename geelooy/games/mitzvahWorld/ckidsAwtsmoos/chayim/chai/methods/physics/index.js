// B"H
/** @file index.js @purpose Player physics, now with corrected mobile screen-left/right. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensurePlayerCollisionBubble } from "../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?compact=true&v=perf-tight-collision-20260703-bh1";
import baseMethods from "./runtime/PhysicsBaseMethods.js?compact=true&v=perf-tight-collision-20260703-bh1";
import frameMethods from "./runtime/PhysicsFrameMethods.js?compact=true&v=perf-tight-collision-20260703-bh1";
import motionMethods from "./runtime/PhysicsMotionMethods.js?compact=true&v=perf-tight-collision-20260703-bh1";
import visualMethods from "./runtime/PhysicsVisualMethods.js?compact=true&v=solid-browser-verify-20260702-bh11";
import { applyLockedAirTrajectory } from "./runtime/PhysicsAirRuntime.js?compact=true&v=perf-tight-collision-20260703-bh1";
import { clampToTerrainFloor as clampCapsuleToTerrainFloor } from "./runtime/PhysicsGroundRuntime.js?compact=true&v=perf-tight-collision-20260703-bh1";
import { normAngle, numeric } from "./runtime/PhysicsNumbers.js?compact=true&v=perf-tight-collision-20260703-bh1";
const UP = new THREE.Vector3(0, 1, 0), TMP_F = new THREE.Vector3(), TMP_R = new THREE.Vector3();
export function clampToTerrainFloor(player) { return clampCapsuleToTerrainFloor(player); }
function mobileCameraDirection(player) {
  const joy = player.__mobileJoystick; if (!joy?.screenRelative) return null;
  const f = TMP_F.set(0, 0, 1); player.olam?.ayin?.camera?.getWorldDirection?.(f); f.y = 0;
  if (f.lengthSq() < .0001) f.set(Math.sin(player.rotation?.y || 0), 0, Math.cos(player.rotation?.y || 0)); f.normalize();
  const r = TMP_R.copy(UP).cross(f).normalize();
  const dir = new THREE.Vector3(); dir.addScaledVector(f, -numeric(joy.y, 0)); dir.addScaledVector(r, -numeric(joy.x, 0));
  if (dir.lengthSq() < .0001) return null; dir.normalize();
  player.targetRotateOffset = normAngle(Math.atan2(dir.x, dir.z) - (player.rotation?.y || 0));
  player.__lastMobileWorldDirection = { at: Date.now(), x: dir.x, z: dir.z, joy: { x: joy.x, y: joy.y }, leftRightFixed: true };
  player.isWalking = true; return dir;
}
export function movementDirection(player) {
  const mobile = mobileCameraDirection(player); if (mobile) return mobile;
  const d = new THREE.Vector3(), m = player.moving || {}, y = player.rotation?.y || 0;
  const fx = Math.sin(y), fz = Math.cos(y), sx = -Math.cos(y), sz = Math.sin(y);
  const forward = m.forward || player.movingAutomatically, back = m.backward; player.isWalking = false;
  if (forward) { player.isWalking = true; d.x += fx; d.z += fz; player.targetRotateOffset = 0; }
  else if (back) { player.isWalking = true; d.x -= fx; d.z -= fz; player.targetRotateOffset = -Math.PI; }
  if (m.stridingLeft) { player.isWalking = true; d.x += sx; d.z += sz; player.targetRotateOffset = Math.PI / 2; if (forward) player.targetRotateOffset -= Math.PI / 4; else if (back) player.targetRotateOffset += Math.PI / 4; }
  else if (m.stridingRight) { player.isWalking = true; d.x -= sx; d.z -= sz; player.targetRotateOffset = -Math.PI / 2; if (forward) player.targetRotateOffset += Math.PI / 4; else if (back) player.targetRotateOffset -= Math.PI / 4; }
  player.targetRotateOffset = normAngle(player.targetRotateOffset || 0); if (d.lengthSq() > 0) d.normalize(); return d;
}
export default { ...baseMethods, ...frameMethods, ...motionMethods, ...visualMethods,
  _ensurePlayerCollisionBubble() { return ensurePlayerCollisionBubble(this.olam); },
  _clampToTerrainFloor() { return clampToTerrainFloor(this); },
  _clampIdleToTerrain(deltaTime) { clampToTerrainFloor(this); this._syncMesh(deltaTime); },
  _calculateMovementVelocity(deltaTime = 1 / 60) {
    const dir = movementDirection(this); if (!this.onFloor && applyLockedAirTrajectory(this)) return;
    const moving = dir.lengthSq() > 0, gait = this.moving?.running ? numeric(this.runModeScale, 1) : numeric(this.walkModeScale, .58);
    const speed = numeric(this.speed, 6) * numeric(this.speedScale, 1) * gait;
    const tx = moving ? dir.x * speed : 0, tz = moving ? dir.z * speed : 0;
    const alpha = 1 - Math.exp(-(moving ? numeric(this.movementResponsiveness, 16) : numeric(this.stopResponsiveness, 30)) * Math.max(.001, deltaTime));
    this.velocity.x += (tx - this.velocity.x) * alpha; this.velocity.z += (tz - this.velocity.z) * alpha;
    if (!moving && Math.abs(this.velocity.x) + Math.abs(this.velocity.z) < .0004) { this.velocity.x *= .5; this.velocity.z *= .5; }
  }
};
