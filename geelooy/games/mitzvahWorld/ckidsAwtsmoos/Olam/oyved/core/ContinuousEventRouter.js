// B"H
/**
 * @file ContinuousEventRouter.js
 * @description
 * Chapter 89: The Real Worker Router Receives The Wall.
 *
 * The Awtsmoos revealed the true river: the live worker never used the old
 * `worker/handlers/input.js`. It routes through this ContinuousEventRouter.
 * Therefore `mobileMove` was arriving as an unknown key and only fell through to
 * `olam.ayshPeula("mobileMove")`, which no movement listener consumed. This
 * file now writes joystick state into `olam.inputs` in the active worker path.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import RenderTrace from "../../methods/canvas/RenderTrace.js";
import { resolveSpikeResetFeet } from "../../shared/SpikeResetPosition.js";
import { rememberCanvasPayload } from "./CanvasMemory.js";

const MOVE_FLAGS = Object.freeze(["FORWARD", "BACKWARD", "LEFT_ROTATE", "RIGHT_ROTATE", "LEFT_STRIDE", "RIGHT_STRIDE", "JUMP", "DOWN", "UP"]);
const MOBILE_MOVE_FLAGS = Object.freeze(["FORWARD", "BACKWARD", "LEFT_STRIDE", "RIGHT_STRIDE"]);
const findPlayer = olam => olam?.chossid || olam?.nivrayim?.find?.(q => q.type === "chossid");

function routerTrace(olam, stage, payload = {}) {
  olam.__movementTrace ||= [];
  olam.__movementTrace.push({ at: Date.now(), stage, ...payload });
  olam.__movementTrace = olam.__movementTrace.slice(-160);
  if (!payload.quiet) console.info('B"H | CONTINUOUS_INPUT_TRACE', { stage, ...payload });
}

function setTreeVisible(root, visible) {
  if (!root) return;
  root.visible = visible;
  root.traverse?.(child => { child.visible = visible; });
}

function currentRunMode(olam) {
  if (olam?.runMode === "walk") return false;
  if (olam?.runMode === "run") return true;
  if (olam?.inputs && Object.prototype.hasOwnProperty.call(olam.inputs, "RUNNING")) return olam.inputs.RUNNING === true;
  return true;
}

function clearInput(olam, player) {
  const running = currentRunMode(olam);
  player.moving = { stridingLeft: false, stridingRight: false, forward: false, backward: false, turningLeft: false, turningRight: false, running, jump: false };
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
  if (olam?.keyStates) Object.keys(olam.keyStates).forEach(key => { olam.keyStates[key] = false; });
  olam.inputs = { ...(olam.inputs || {}) };
  MOVE_FLAGS.forEach(key => { olam.inputs[key] = false; });
  olam.inputs.RUNNING = running;
  olam.runMode = running ? "run" : "walk";
}

function stablePlayerFlags(player, frozen) {
  Object.assign(player, {
    __spikeDefeated: frozen, __spikeDeathControlsFrozen: frozen, __spikeColliderDisabled: frozen, __spikeResetCountdown: frozen,
    onFloor: !frozen, isOnGround: !frozen, onGround: !frozen, grounded: !frozen,
    jumped: false, didJump: false, fallingFrames: 0, startedWalking: false, isWalking: false, isTurning: false, movingAutomatically: false
  });
}

function resetPlayerPhysics(player, pos) {
  const feet = new THREE.Vector3(pos.x, pos.y, pos.z);
  if (typeof player.setPosition === "function") player.setPosition(feet);
  else if (player.collider?.start && player.collider?.end) {
    const radius = Number(player.radius || player.collider.radius || 0.45);
    const height = Number(player.height || 1.5);
    player.collider.radius = radius;
    player.collider.start.set(pos.x, pos.y + radius, pos.z);
    player.collider.end.set(pos.x, pos.y + height - radius, pos.z);
  }
  player.isTeleporting = false;
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
  player.mesh?.position?.set?.(pos.x, pos.y, pos.z);
  player.guf?.position?.set?.(pos.x, pos.y, pos.z);
  player.visualObject?.position?.set?.(pos.x, pos.y, pos.z);
  if (player.modelMesh && player.mesh) {
    player.modelMesh.position.copy(player.mesh.position);
    player.modelMesh.position.y += Number(player.modelMesh.userData?.visualGroundOffsetY || 0);
    player.modelMesh.rotation.y = (player.rotation?.y || 0) + (player.rotateOffset || 0);
  }
  player.emptyCopy?.position?.copy?.(player.mesh?.position || feet);
  player.nonRotatingEmptyForMovement?.position?.copy?.(player.mesh?.position || feet);
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

function resetLevelCollectibles(olam) {
  olam.__perutahResetLock = true;
  olam.__perutahResetEpoch = Number(olam.__perutahResetEpoch || 0) + 1;
  olam.__levelPerutosCollected = 0;
  olam.__tzedakahBlessed = false;
  let restoredPerutos = 0;
  olam?.nivrayim?.forEach?.(nivra => {
    if (nivra?.type !== "coin") return;
    nivra.resetForLevelRestart?.();
    restoredPerutos += 1;
  });
  const payload = { collected: 0, requiredPerutos: olam.requiredPerutos || 0, reset: true, restoredPerutos, silent: true, perutahEpoch: olam.__perutahResetEpoch };
  olam?.ayshPeula?.("ui event", "perutahProgress", payload);
  olam?.ayshPeula?.("ui event", "gameHUD", { perutahProgress: payload });
  setTimeout(() => { olam.__perutahResetLock = false; }, 220);
  return restoredPerutos;
}

function revealPlayerRoots(player) {
  [player.mesh, player.modelMesh, player.guf, player.visualObject, player.emptyCopy, player.nonRotatingEmptyForMovement].forEach(root => setTreeVisible(root, true));
  player.updateAppearance?.();
  player.playChaweeyoos?.(player.getChaweeyoos?.("idle"));
}

function disposeThreeObject(root) {
  root?.traverse?.(child => {
    child.geometry?.dispose?.();
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach(mat => { Object.values(mat || {}).forEach(v => v?.isTexture && v.dispose?.()); mat?.dispose?.(); });
  });
}

function destroyWorld(olam) {
  let disposed = 0;
  try {
    olam?.ayshPeula?.("destroy");
    olam?.nivrayim?.forEach?.(nivra => { disposeThreeObject(nivra?.mesh || nivra?.model || nivra?.object3D); nivra?.mixer?.stopAllAction?.(); disposed += 1; });
    disposeThreeObject(olam?.scene);
    olam?.renderer?.renderLists?.dispose?.();
    olam?.worldOctree?.clear?.();
    if (Array.isArray(olam?.nivrayim)) olam.nivrayim.length = 0;
  } finally { self.postMessage({ destroyed: true, disposed }); }
}

function resetAfterSpikeDeath(olam, payload = {}) {
  const player = findPlayer(olam);
  const pos = resolveSpikeResetFeet(payload, olam);
  if (!player) return void self.postMessage({ type: "spikeResetComplete", payload: { ok: false, reason: "missing-player" } });
  olam.__spikeDeathActive = false;
  olam.__spikeDeathToken = (olam.__spikeDeathToken || 0) + 1;
  player.__spikeDeathToken = olam.__spikeDeathToken;
  stablePlayerFlags(player, false);
  clearInput(olam, player);
  resetPlayerPhysics(player, pos);
  const restoredPerutos = resetLevelCollectibles(olam);
  revealPlayerRoots(player);
  olam.chossid = player;
  olam.player = player;
  const resetSpikes = resetHazards(olam);
  self.postMessage({ type: "spikeResetComplete", payload: { ok: true, pos, resetSpikes, restoredPerutos, perutahEpoch: olam.__perutahResetEpoch, colliderDisabled: false, running: olam.inputs?.RUNNING, runMode: olam.runMode, token: olam.__spikeDeathToken } });
}

function enableAfterSpikeReset(olam) {
  const player = findPlayer(olam);
  if (!player) return void self.postMessage({ type: "spikeEnableComplete", payload: { ok: false, reason: "missing-player" } });
  olam.__spikeDeathActive = false;
  stablePlayerFlags(player, false);
  clearInput(olam, player);
  resetLevelCollectibles(olam);
  resetHazards(olam);
  revealPlayerRoots(player);
  self.postMessage({ type: "spikeEnableComplete", payload: { ok: true, colliderDisabled: false, perutahEpoch: olam.__perutahResetEpoch, running: olam.inputs?.RUNNING, runMode: olam.runMode, token: olam.__spikeDeathToken } });
}

function applyMobileMove(olam, payload = {}) {
  olam.inputs ||= {};
  MOBILE_MOVE_FLAGS.forEach(flag => { olam.inputs[flag] = payload[flag] === true; });
  olam.__lastMobileMove = { at: Date.now(), ...payload };
  const active = MOBILE_MOVE_FLAGS.filter(flag => olam.inputs[flag]);
  routerTrace(olam, 'mobileMove-applied-active-router', { active, source: payload.source || 'unknown', seal: payload.seal || null });
}

export class ContinuousEventRouter {
  static actionMap = {
    takeInCanvas: async (olam, payload) => {
      rememberCanvasPayload(payload);
      RenderTrace.speak("worker_route:takeInCanvas_received", { width: payload?.width, height: payload?.height, hasOlam: Boolean(olam), hasAyin: Boolean(olam?.ayin), hasCamera: Boolean(olam?.activeCamera || olam?.ayin?.camera) });
      olam.takeInCanvas(payload.canvas, payload.devicePixelRatio);
      if (typeof olam.setSize === "function") await olam.setSize(payload.width, payload.height);
      if (typeof olam.heesHawvoos === "function") olam.heesHawvoos();
      self.postMessage({ type: "canvas_transferred", payload: { width: payload.width, height: payload.height, devicePixelRatio: payload.devicePixelRatio, rendererReady: Boolean(olam.renderer), hasCamera: Boolean(olam.activeCamera || olam.ayin?.camera), sceneChildren: olam.scene?.children?.length || 0 } });
    },
    destroyWorld,
    resize: async (olam, payload) => { if (typeof olam.setSize === "function") await olam.setSize(payload.width, payload.height); olam.ayshPeula("resize", payload); },
    cameraDrag: (olam, payload) => { if (olam.ayin?.rotateAroundTarget) olam.ayin.rotateAroundTarget(payload.dx, payload.dy); },
    resetAfterSpikeDeath,
    enableAfterSpikeReset,
    mobileMove: applyMobileMove,
    olamPeula: (olam, payload) => { for (const p in payload) olam.ayshPeula(p, payload[p]); },
    awtsCode: (olam, payload) => { try { const me = { olam }; eval(payload); } catch (e) { console.error("B\"H - AWTS_CODE error:", e); } },
    keydown: (olam, payload) => olam.ayshPeula("keydown", payload),
    keyup: (olam, payload) => olam.ayshPeula("keyup", payload),
    mousedown: (olam, payload) => { if (olam.yichud) olam.yichud.handleEvent(payload, true); olam.ayshPeula("mousedown", payload); },
    mouseup: (olam, payload) => olam.ayshPeula("mouseup", payload),
    mousemove: (olam, payload) => { if (olam.yichud) olam.yichud.handleEvent(payload, false); olam.ayshPeula("mousemove", payload); },
    wheel: (olam, payload) => olam.ayshPeula("wheel", payload)
  };

  static async route(olam, key, payload, promiseMap) {
    if (!olam && key !== "vessel_ready") return;
    const action = this.actionMap[key];
    if (typeof action === "function") return void await action(olam, payload);
    const resolvingEvents = ["htmlCreated", "htmlActioned", "htmlDeleted", "htmlActionsed", "uiEvented", "htmlGot"];
    if (resolvingEvents.includes(key) && payload?.id && promiseMap.has(payload.id)) { promiseMap.get(payload.id)(payload); promiseMap.delete(payload.id); return; }
    if (olam?.ayshPeula) olam.ayshPeula(key, payload);
  }
}
