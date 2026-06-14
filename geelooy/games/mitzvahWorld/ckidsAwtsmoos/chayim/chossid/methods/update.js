// B"H
/**
 * @file update.js
 * @description
 * Chapter 418: the garment faces actual displacement, not imagined input.
 * The Awtsmoos reads where the root truly moved after physics, subtracts parent
 * rotation, and turns the visible model toward that world vector. Attacks may
 * force a short facing lock toward the selected fox before motion resumes.
 */
import Chai from "../../chai/index.js?v=village-polish-20260612-bh810";
import * as THREE from "/games/scripts/build/three.module.js";
const INPUTS = ["FORWARD", "BACKWARD", "LEFT_STRIDE", "RIGHT_STRIDE", "JUMP", "DOWN", "UP"];
const last = new THREE.Vector3();
function activeInputs(c) { return Object.keys(c?.olam?.inputs || {}).filter(k => c.olam.inputs[k]); }
function shouldRunControls(c) { const cut = c?.olam?.isPlayingCutscene === true, has = INPUTS.some(k => c?.olam?.inputs?.[k] === true); return !cut || has; }
function traceFrame(c, stage, extra = {}) { const now = Date.now(), inputs = activeInputs(c), cadence = inputs.length ? 1000 : 2200; if (c.__lastFrameTraceAt && now - c.__lastFrameTraceAt < cadence) return; c.__lastFrameTraceAt = now; c.olam.__movementTrace ||= []; c.olam.__movementTrace.push({ at: now, kind: "CHOSSID_FRAME_TRACE", stage, inputs, yaw: c.__awtsmoosUnifiedFacingYaw, ...extra }); c.olam.__movementTrace = c.olam.__movementTrace.slice(-80); }
function targetYawFromDelta(c) {
  if (!c.mesh?.position) return null;
  if (!c.__lastFacingWorldPos) { c.__lastFacingWorldPos = c.mesh.position.clone(); return null; }
  last.copy(c.mesh.position).sub(c.__lastFacingWorldPos); c.__lastFacingWorldPos.copy(c.mesh.position); last.y = 0;
  if (last.lengthSq() < 0.000006) return null;
  return Math.atan2(last.x, last.z) + Math.PI;
}
function forcedYaw(c) { return Date.now() < Number(c.__awtsmoosForcedFacingUntil || 0) && Number.isFinite(c.__awtsmoosForcedFacingYaw) ? c.__awtsmoosForcedFacingYaw : null; }
function alignModelFacing(c) {
  const root = c.modelMesh || c.guf || c.mesh; if (!root) return;
  const worldYaw = forcedYaw(c) ?? targetYawFromDelta(c); if (!Number.isFinite(worldYaw)) return;
  const parentYaw = c.mesh?.rotation?.y || 0, offset = Number.isFinite(Number(c.options?.visualFacingOffsetY)) ? Number(c.options.visualFacingOffsetY) : Math.PI;
  const localYaw = worldYaw - parentYaw + offset, turn = Number.isFinite(c.options?.lerpTurnSpeed) ? c.options.lerpTurnSpeed : .48;
  root.rotation.y = lerpAngle(root.rotation.y, localYaw, turn); c.__awtsmoosUnifiedFacingYaw = worldYaw;
}
function lerpAngle(a, b, t) { const d = Math.atan2(Math.sin(b - a), Math.cos(b - a)); return a + d * Math.max(0, Math.min(1, t)); }
export default {
  heesHawvoos(deltaTime) {
    if (!this.startedAll) { this.olam.ayshPeula("ready from chossid"); this.startedAll = true; }
    traceFrame(this, "frame-enter", { deltaTime });
    if (shouldRunControls(this)) this.controls(deltaTime); else traceFrame(this, "controls-skipped-cutscene", { deltaTime });
    if (this.olam?.isLookingForSomething) this.checkHover(this.olam, false);
    if (this.koach !== undefined && this.maxKoach !== undefined && this.koach < this.maxKoach) { this.koach = Math.min(this.maxKoach, this.koach + deltaTime * 2); if (!this.lastKoachUpdate || Date.now() - this.lastKoachUpdate > 1000) { this.updateStatsUI?.(); this.lastKoachUpdate = Date.now(); } }
    this.adjustDOF?.(); this.postProcessing?.(); Chai.prototype.heesHawvoos.call(this, deltaTime); alignModelFacing(this);
  }
};
