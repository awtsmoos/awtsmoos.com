// B"H
/**
 * @file ContinuousEventRouter.js
 * @description Chapter 37: Reset knows the one SpikeField kingdom.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import RenderTrace from "../../methods/canvas/RenderTrace.js";
const START = Object.freeze({ x: -8, y: 5, z: 0 });
const findPlayer = olam => olam?.chossid || olam?.nivrayim?.find?.(q => q.type === "chossid");
const rootVisible = (obj, visible) => { if (obj) obj.visible = visible; };
function clearInput(olam, player, run = true) {
  player.moving = {}; player.velocity?.set?.(0, 0, 0); player.acceleration?.set?.(0, 0, 0);
  if (olam?.keyStates) Object.keys(olam.keyStates).forEach(key => { olam.keyStates[key] = false; });
  if (olam?.inputs) { Object.keys(olam.inputs).forEach(key => { olam.inputs[key] = false; }); olam.inputs.RUNNING = run; }
}
function resetPlayerPhysics(player, pos) {
  const v = new THREE.Vector3(pos.x, pos.y, pos.z);
  if (typeof player.setPosition === "function") player.setPosition(v);
  if (player.collider?.start && player.collider?.end) {
    player.collider.start.set(pos.x, pos.y + player.height / 2, pos.z);
    player.collider.end.set(pos.x, pos.y + player.height, pos.z);
    player.collider.radius = player.radius;
  }
  player.isTeleporting = false;
  player.mesh?.position?.set?.(pos.x, pos.y, pos.z);
  player.guf?.position?.set?.(pos.x, pos.y, pos.z);
  player.visualObject?.position?.set?.(pos.x, pos.y, pos.z);
  if (player.modelMesh && player.mesh) {
    player.modelMesh.position.copy(player.mesh.position);
    player.modelMesh.position.y += Number(player.modelMesh.userData?.visualGroundOffsetY || 0);
    player.modelMesh.rotation.y = (player.rotation?.y || 0) + (player.rotateOffset || 0);
  }
}
function resetHazards(olam) {
  let resetSpikes = 0;
  olam?.nivrayim?.forEach?.(nivra => {
    if (nivra?.type === "spikeHazard") { nivra._triggered = false; nivra._debugNearLogged = false; resetSpikes += 1; }
    if (nivra?.type === "spikeField") { nivra.resetField?.(); resetSpikes += Number(nivra.spikes?.length || 1); }
    if (nivra?.type === "fallResetTrigger") nivra._triggered = false;
  });
  return resetSpikes;
}
function revealPlayerRoots(player) {
  rootVisible(player.mesh, true); rootVisible(player.modelMesh, true); rootVisible(player.guf, true); rootVisible(player.visualObject, true);
  player.updateAppearance?.(); player.playChaweeyoos?.(player.getChaweeyoos?.("idle"));
}
function resetAfterSpikeDeath(olam, payload = {}) {
  const player = findPlayer(olam); const pos = { ...START, ...(payload.position || {}) }; const forceRun = payload.forceRunMode !== false;
  console.info('B"H | SPIKE_RESET_TRACE', { stage: 'worker-reset-entered', hasPlayer: Boolean(player), pos, keepColliderDisabled: true, forceRun });
  if (!player) return void self.postMessage({ type: "spikeResetComplete", payload: { ok: false, reason: "missing-player" } });
  olam.__spikeDeathActive = true; olam.__spikeDeathToken = (olam.__spikeDeathToken || 0) + 1;
  Object.assign(player, { __spikeDefeated: true, __spikeDeathControlsFrozen: true, __spikeColliderDisabled: true, __spikeResetCountdown: true, __spikeDeathToken: olam.__spikeDeathToken, onFloor: false, jumped: false, didJump: false, fallingFrames: 0, startedWalking: false, isWalking: false, isTurning: false });
  clearInput(olam, player, forceRun); resetPlayerPhysics(player, pos); revealPlayerRoots(player); olam.chossid = player;
  const resetSpikes = resetHazards(olam);
  self.postMessage({ type: "spikeResetComplete", payload: { ok: true, pos, resetSpikes, colliderDisabled: true, running: olam.inputs?.RUNNING, token: olam.__spikeDeathToken } });
}
function enableAfterSpikeReset(olam, payload = {}) {
  const player = findPlayer(olam);
  if (!player) return void self.postMessage({ type: "spikeEnableComplete", payload: { ok: false, reason: "missing-player" } });
  olam.__spikeDeathActive = false;
  Object.assign(player, { __spikeDefeated: false, __spikeDeathControlsFrozen: false, __spikeColliderDisabled: false, __spikeResetCountdown: false, onFloor: false, jumped: false, didJump: false, startedWalking: false, isWalking: false });
  clearInput(olam, player, true); resetHazards(olam); revealPlayerRoots(player);
  self.postMessage({ type: "spikeEnableComplete", payload: { ok: true, colliderDisabled: false, running: olam.inputs?.RUNNING, token: olam.__spikeDeathToken } });
}
export class ContinuousEventRouter {
  static actionMap = {
    takeInCanvas: async (olam, payload) => {
      RenderTrace.speak("worker_route:takeInCanvas_received", { width: payload?.width, height: payload?.height, hasOlam: Boolean(olam), hasAyin: Boolean(olam?.ayin), hasCamera: Boolean(olam?.activeCamera || olam?.ayin?.camera) });
      olam.takeInCanvas(payload.canvas, payload.devicePixelRatio);
      RenderTrace.speak("worker_route:takeInCanvas_after_renderer", { hasRenderer: Boolean(olam.renderer), hasScene: Boolean(olam.scene), sceneChildren: olam.scene?.children?.length || 0 });
      if (typeof olam.setSize === 'function') await olam.setSize(payload.width, payload.height);
      if (typeof olam.heesHawvoos === 'function') olam.heesHawvoos();
      self.postMessage({ type: 'canvas_transferred', payload: { width: payload.width, height: payload.height, devicePixelRatio: payload.devicePixelRatio, rendererReady: Boolean(olam.renderer), hasCamera: Boolean(olam.activeCamera || olam.ayin?.camera), sceneChildren: olam.scene?.children?.length || 0 } });
    },
    resize: async (olam, payload) => { if (typeof olam.setSize === 'function') await olam.setSize(payload.width, payload.height); olam.ayshPeula('resize', payload); },
    cameraDrag: (olam, payload) => { if (olam.ayin?.rotateAroundTarget) olam.ayin.rotateAroundTarget(payload.dx, payload.dy); },
    resetAfterSpikeDeath, enableAfterSpikeReset,
    olamPeula: (olam, payload) => { for (const p in payload) olam.ayshPeula(p, payload[p]); },
    awtsCode: (olam, payload) => { try { const me = { olam }; eval(payload); } catch (e) { console.error('B"H - 🚨 [AWTS_CODE] Execution error:', e); } },
    keydown: (olam, payload) => olam.ayshPeula('keydown', payload), keyup: (olam, payload) => olam.ayshPeula('keyup', payload),
    mousedown: (olam, payload) => { if (olam.yichud) olam.yichud.handleEvent(payload, true); olam.ayshPeula('mousedown', payload); },
    mouseup: (olam, payload) => olam.ayshPeula('mouseup', payload), mousemove: (olam, payload) => { if (olam.yichud) olam.yichud.handleEvent(payload, false); olam.ayshPeula('mousemove', payload); }, wheel: (olam, payload) => olam.ayshPeula('wheel', payload)
  };
  static async route(olam, key, payload, promiseMap) {
    if (!olam && key !== 'vessel_ready') return;
    const action = this.actionMap[key]; if (typeof action === 'function') return void await action(olam, payload);
    const resolvingEvents = ['htmlCreated', 'htmlActioned', 'htmlDeleted', 'htmlActionsed', 'uiEvented', 'htmlGot'];
    if (resolvingEvents.includes(key) && payload?.id && promiseMap.has(payload.id)) { promiseMap.get(payload.id)(payload); promiseMap.delete(payload.id); return; }
    if (olam?.ayshPeula) olam.ayshPeula(key, payload);
  }
}
