// B"H
/** @file index.js @purpose Compose jump-safe above-ground player physics modules.
 * Mobile joystick vectors are camera/screen-relative: thumb up goes into the
 * visible world, not sideways through an old player-facing mirror.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { ensurePlayerCollisionBubble } from "../../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?v=ground-cache-diag-20260701-bh1";
import baseMethods from "./runtime/PhysicsBaseMethods.js?v=no-alert-perf-jump-20260701-bh9";
import frameMethods from "./runtime/PhysicsFrameMethods.js?v=player-stage-timing-20260702-bh1";
import motionMethods from "./runtime/PhysicsMotionMethods.js?v=no-alert-perf-jump-20260701-bh9";
import visualMethods from "./runtime/PhysicsVisualMethods.js?v=no-alert-perf-jump-20260701-bh9";
import { applyLockedAirTrajectory } from "./runtime/PhysicsAirRuntime.js?v=no-alert-perf-jump-20260701-bh9";
import { clampToTerrainFloor as clampCapsuleToTerrainFloor } from "./runtime/PhysicsGroundRuntime.js?v=no-alert-perf-jump-20260701-bh9";
import { normAngle, numeric } from "./runtime/PhysicsNumbers.js?v=no-alert-perf-jump-20260701-bh9";
const UP = new THREE.Vector3(0,1,0);
const TMP_F = new THREE.Vector3();
const TMP_R = new THREE.Vector3();
export function clampToTerrainFloor(player) { return clampCapsuleToTerrainFloor(player); }
function mobileCameraDirection(player) {
  const joy = player.__mobileJoystick;
  if (!joy?.screenRelative) return null;
  const f = TMP_F.set(0,0,1);
  player.olam?.ayin?.camera?.getWorldDirection?.(f);
  f.y = 0;
  if (f.lengthSq() < .0001) f.set(Math.sin(player.rotation?.y || 0),0,Math.cos(player.rotation?.y || 0));
  f.normalize();
  const r = TMP_R.copy(UP).cross(f).normalize();
  const dir = new THREE.Vector3();
  dir.addScaledVector(f, -numeric(joy.y,0));
  dir.addScaledVector(r, numeric(joy.x,0));
  if (dir.lengthSq() < .0001) return null;
  dir.normalize();
  player.targetRotateOffset = normAngle(Math.atan2(dir.x, dir.z) - (player.rotation?.y || 0));
  player.__lastMobileWorldDirection = { at:Date.now(), x:dir.x, z:dir.z, joy:{ x:joy.x, y:joy.y } };
  player.isWalking = true;
  return dir;
}
export function movementDirection(player) {
  const mobile = mobileCameraDirection(player);
  if (mobile) return mobile;
  const direction = new THREE.Vector3(), moving = player.moving || {}, rotY = player.rotation?.y || 0;
  const forwardX = Math.sin(rotY), forwardZ = Math.cos(rotY), sideX = -Math.cos(rotY), sideZ = Math.sin(rotY);
  const forward = moving.forward || player.movingAutomatically, back = moving.backward; player.isWalking = false;
  if (forward) { player.isWalking = true; direction.x += forwardX; direction.z += forwardZ; player.targetRotateOffset = 0; }
  else if (back) { player.isWalking = true; direction.x -= forwardX; direction.z -= forwardZ; player.targetRotateOffset = -Math.PI; }
  if (moving.stridingLeft) { player.isWalking = true; direction.x += sideX; direction.z += sideZ; player.targetRotateOffset = Math.PI / 2; if (forward) player.targetRotateOffset -= Math.PI / 4; else if (back) player.targetRotateOffset += Math.PI / 4; }
  else if (moving.stridingRight) { player.isWalking = true; direction.x -= sideX; direction.z -= sideZ; player.targetRotateOffset = -Math.PI / 2; if (forward) player.targetRotateOffset += Math.PI / 4; else if (back) player.targetRotateOffset -= Math.PI / 4; }
  player.targetRotateOffset = normAngle(player.targetRotateOffset || 0); if (direction.lengthSq() > 0) direction.normalize(); return direction;
}
export default { ...baseMethods, ...frameMethods, ...motionMethods, ...visualMethods, _ensurePlayerCollisionBubble() { return ensurePlayerCollisionBubble(this.olam); }, _clampToTerrainFloor() { return clampToTerrainFloor(this); }, _clampIdleToTerrain(deltaTime) { clampToTerrainFloor(this); this._syncMesh(deltaTime); }, _calculateMovementVelocity(deltaTime = 1 / 60) { const dir = movementDirection(this); if (!this.onFloor && applyLockedAirTrajectory(this)) return; const moving = dir.lengthSq() > 0, gaitScale = this.moving?.running ? numeric(this.runModeScale, 1) : numeric(this.walkModeScale, 0.58); const speed = numeric(this.speed, 6) * numeric(this.speedScale, 1) * gaitScale; const targetX = moving ? dir.x * speed : 0, targetZ = moving ? dir.z * speed : 0; const responsiveness = moving ? numeric(this.movementResponsiveness, 16) : numeric(this.stopResponsiveness, 30); const alpha = 1 - Math.exp(-responsiveness * Math.max(0.001, deltaTime)); this.velocity.x += (targetX - this.velocity.x) * alpha; this.velocity.z += (targetZ - this.velocity.z) * alpha; if (!moving && Math.abs(this.velocity.x) + Math.abs(this.velocity.z) < 0.0004) { this.velocity.x *= 0.5; this.velocity.z *= 0.5; } } };
