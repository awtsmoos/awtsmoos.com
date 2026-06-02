// B"H
/**
 * @file ContinuousEventRouter.js
 * @description
 * Chapter 29: The Respawn Learned Feet, Not Centers.
 *
 * The Awtsmoos resets the Chossid to authored feet-on-ground coordinates after
 * the lava countdown. It uses the player's own `setPosition`, restores the
 * visual robe, clears input, resets hazards, and immediately returns control.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import RenderTrace from "../../methods/canvas/RenderTrace.js";
import { rememberCanvasPayload } from "./CanvasMemory.js";

const START_FEET = Object.freeze({ x: -10.5, y: 0.425, z: 0 });
const findPlayer = olam => olam?.chossid || olam?.nivrayim?.find?.(q => q.type === "chossid");

/** @param {object} root Object3D root. @param {boolean} visible Visibility. */
function setTreeVisible(root, visible) {
  if (!root) return;
  root.visible = visible;
  root.traverse?.(child => { child.visible = visible; });
}

/** @param {object} olam World. @param {object} player Player. */
function clearInput(olam, player) {
  player.moving = { stridingLeft: false, stridingRight: false, forward: false, backward: false, turningLeft: false, turningRight: false, running: false, jump: false };
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
  if (olam?.keyStates) Object.keys(olam.keyStates).forEach(key => { olam.keyStates[key] = false; });
  if (olam?.inputs) Object.keys(olam.inputs).forEach(key => { olam.inputs[key] = false; });
}

/** @param {object} player Player. @param {boolean} frozen Frozen state. */
function stablePlayerFlags(player, frozen) {
  Object.assign(player, {
    __spikeDefeated: frozen,
    __spikeDeathControlsFrozen: frozen,
    __spikeColliderDisabled: frozen,
    __spikeResetCountdown: frozen,
    onFloor: !frozen,
    isOnGround: !frozen,
    onGround: !frozen,
    grounded: !frozen,
    jumped: false,
    didJump: false,
    fallingFrames: 0,
    startedWalking: false,
    isWalking: false,
    isTurning: false,
    movingAutomatically: false
  });
}

/** @param {object} player Player. @param {{x:number,y:number,z:number}} pos Feet position. */
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

/** @param {object} olam World. @returns {number} Reset count. */
function resetHazards(olam) {
  let resetSpikes = 0;
  olam?.nivrayim?.forEach?.(nivra => {
    if (nivra?.type === "spikeHazard") { nivra._triggered = false; nivra._debugNearLogged = false; resetSpikes += 1; }
    if (nivra?.type === "spikeField") { nivra.resetField?.(); resetSpikes += Number(nivra.spikes?.length || 1); }
    if (nivra?.type === "fallResetTrigger") nivra._triggered = false;
  });
  return resetSpikes;
}

/** @param {object} player Player. */
function revealPlayerRoots(player) {
  [player.mesh, player.modelMesh, player.guf, player.visualObject, player.emptyCopy, player.nonRotatingEmptyForMovement].forEach(root => setTreeVisible(root, true));
  player.updateAppearance?.();
  player.playChaweeyoos?.(player.getChaweeyoos?.("idle"));
}

/** @param {object} root Object3D. */
function disposeThreeObject(root) {
  root?.traverse?.(child => {
    child.geometry?.dispose?.();
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach(mat => { Object.values(mat || {}).forEach(v => v?.isTexture && v.dispose?.()); mat?.dispose?.(); });
  });
}

/** @param {object} olam World. */
function destroyWorld(olam) {
  let disposed = 0;
  try {
    olam?.ayshPeula?.("destroy");
    olam?.nivrayim?.forEach?.(nivra => { disposeThreeObject(nivra?.mesh || nivra?.model || nivra?.object3D); nivra?.mixer?.stopAllAction?.(); disposed += 1; });
    disposeThreeObject(olam?.scene);
    olam?.renderer?.renderLists?.dispose?.();
    olam?.worldOctree?.clear?.();
    if (Array.isArray(olam?.nivrayim)) olam.nivrayim.length = 0;
  } finally {
    self.postMessage({ destroyed: true, disposed });
  }
}

/** @param {object} olam World. @param {object} payload Reset payload. */
function resetAfterSpikeDeath(olam, payload = {}) {
  const player = findPlayer(olam);
  const pos = { ...START_FEET, ...(payload.position || {}) };
  if (!player) return void self.postMessage({ type: "spikeResetComplete", payload: { ok: false, reason: "missing-player" } });
  olam.__spikeDeathActive = false;
  olam.__spikeDeathToken = (olam.__spikeDeathToken || 0) + 1;
  player.__spikeDeathToken = olam.__spikeDeathToken;
  stablePlayerFlags(player, false);
  clearInput(olam, player);
  resetPlayerPhysics(player, pos);
  revealPlayerRoots(player);
  olam.chossid = player;
  olam.player = player;
  const resetSpikes = resetHazards(olam);
  self.postMessage({ type: "spikeResetComplete", payload: { ok: true, pos, resetSpikes, colliderDisabled: false, running: false, token: olam.__spikeDeathToken } });
}

/** @param {object} olam World. */
function enableAfterSpikeReset(olam) {
  const player = findPlayer(olam);
  if (!player) return void self.postMessage({ type: "spikeEnableComplete", payload: { ok: false, reason: "missing-player" } });
  olam.__spikeDeathActive = false;
  stablePlayerFlags(player, false);
  clearInput(olam, player);
  resetHazards(olam);
  revealPlayerRoots(player);
  self.postMessage({ type: "spikeEnableComplete", payload: { ok: true, colliderDisabled: false, running: false, token: olam.__spikeDeathToken } });
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
    olamPeula: (olam, payload) => { for (const p in payload) olam.ayshPeula(p, payload[p]); },
    awtsCode: (olam, payload) => { try { const me = { olam }; eval(payload); } catch (e) { console.error("B\"H - AWTS_CODE error:", e); } },
    keydown: (olam, payload) => olam.ayshPeula("keydown", payload),
    keyup: (olam, payload) => olam.ayshPeula("keyup", payload),
    mousedown: (olam, payload) => { if (olam.yichud) olam.yichud.handleEvent(payload, true); olam.ayshPeula("mousedown", payload); },
    mouseup: (olam, payload) => olam.ayshPeula("mouseup", payload),
    mousemove: (olam, payload) => { if (olam.yichud) olam.yichud.handleEvent(payload, false); olam.ayshPeula("mousemove", payload); },
    wheel: (olam, payload) => olam.ayshPeula("wheel", payload)
  };

  /** @param {object} olam World. @param {string} key Event key. @param {object} payload Payload. @param {Map} promiseMap Promises. */
  static async route(olam, key, payload, promiseMap) {
    if (!olam && key !== "vessel_ready") return;
    const action = this.actionMap[key];
    if (typeof action === "function") return void await action(olam, payload);
    const resolvingEvents = ["htmlCreated", "htmlActioned", "htmlDeleted", "htmlActionsed", "uiEvented", "htmlGot"];
    if (resolvingEvents.includes(key) && payload?.id && promiseMap.has(payload.id)) { promiseMap.get(payload.id)(payload); promiseMap.delete(payload.id); return; }
    if (olam?.ayshPeula) olam.ayshPeula(key, payload);
  }
}
