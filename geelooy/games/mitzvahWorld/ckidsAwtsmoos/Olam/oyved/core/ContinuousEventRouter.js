// B"H
/**
 * @file ContinuousEventRouter.js
 * @module ContinuousEventRouter
 * @description
 * Chapter 23: Reset moves the collider before the visible body.
 *
 * The Awtsmoos revealed the false reset: the mesh was moved, but the living
 * capsule stayed below. Physics then dragged the player back into the fall.
 * This route now calls `player.setPosition()` first, resets the collider, clears
 * the death gate, and only then mirrors the visual vessels. No per-frame route
 * spam remains; only reset-specific traces survive.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import RenderTrace from "../../methods/canvas/RenderTrace.js";

const START = Object.freeze({ x: -8, y: 5, z: 0 });

function treeVisible(obj, visible) {
  if (!obj) return;
  obj.visible = visible;
  if (obj.scale?.setScalar && visible) obj.scale.setScalar(1);
  if (obj.traverse) obj.traverse(child => {
    child.visible = visible;
    if (child.scale?.setScalar && visible) child.scale.setScalar(1);
  });
}

function setPositionObject(obj, pos) {
  if (obj?.position?.set) obj.position.set(pos.x, pos.y, pos.z);
  else if (obj?.position) Object.assign(obj.position, pos);
}

function removeSpikeBursts(scene) {
  if (!scene?.children) return 0;
  const doomed = scene.children.filter(child => String(child.name || "").startsWith("Spike_"));
  doomed.forEach(child => {
    scene.remove(child);
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  });
  return doomed.length;
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
  setPositionObject(player.mesh, pos);
  setPositionObject(player.modelMesh, pos);
  setPositionObject(player.guf, pos);
  setPositionObject(player.visualObject, pos);
}

function resetAfterSpikeDeath(olam, payload = {}) {
  const player = olam?.chossid || olam?.nivrayim?.find?.(q => q.type === "chossid");
  const pos = { ...START, ...(payload.position || {}) };
  console.info('B"H | SPIKE_RESET_TRACE', { stage: 'worker-reset-entered', hasOlam: Boolean(olam), hasPlayer: Boolean(player), pos });
  if (!player) {
    self.postMessage({ type: "spikeResetComplete", payload: { ok: false, reason: "missing-player" } });
    return;
  }

  olam.__spikeDeathActive = false;
  olam.__spikeDeathToken = (olam.__spikeDeathToken || 0) + 1;
  player.__spikeDefeated = false;
  player.__spikeDeathControlsFrozen = false;
  player.__spikeDeathToken = olam.__spikeDeathToken;
  player.moving = {};
  player.onFloor = false;
  player.jumped = false;
  player.didJump = false;
  player.fallingFrames = 0;
  if (player.velocity?.set) player.velocity.set(0, 0, 0);
  if (player.acceleration?.set) player.acceleration.set(0, 0, 0);

  resetPlayerPhysics(player, pos);
  treeVisible(player.mesh, true);
  treeVisible(player.modelMesh, true);
  treeVisible(player.guf, true);
  treeVisible(player.visualObject, true);
  olam.chossid = player;

  if (olam.keyStates) Object.keys(olam.keyStates).forEach(key => { olam.keyStates[key] = false; });
  if (olam.inputs) Object.keys(olam.inputs).forEach(key => { olam.inputs[key] = false; });
  let resetSpikes = 0;
  olam.nivrayim?.forEach?.(nivra => {
    if (nivra?.type === "spikeHazard") {
      nivra._triggered = false;
      resetSpikes += 1;
    }
    if (nivra?.type === "fallResetTrigger") nivra._triggered = false;
  });
  const removedBursts = removeSpikeBursts(olam.scene);

  console.info('B"H | SPIKE_RESET_TRACE', {
    stage: 'worker-local-reset-complete',
    pos,
    colliderStart: player.collider?.start ? { x: player.collider.start.x, y: player.collider.start.y, z: player.collider.start.z } : null,
    mesh: player.mesh?.position ? { x: player.mesh.position.x, y: player.mesh.position.y, z: player.mesh.position.z } : null,
    removedBursts,
    resetSpikes,
    token: olam.__spikeDeathToken
  });
  self.postMessage({ type: "spikeResetComplete", payload: { ok: true, pos, removedBursts, resetSpikes, token: olam.__spikeDeathToken } });
}

export class ContinuousEventRouter {
  static actionMap = {
    takeInCanvas: async (olam, payload) => {
      RenderTrace.speak("worker_route:takeInCanvas_received", {
        width: payload?.width,
        height: payload?.height,
        devicePixelRatio: payload?.devicePixelRatio,
        hasOlam: Boolean(olam),
        hasAyin: Boolean(olam?.ayin),
        hasCamera: Boolean(olam?.activeCamera || olam?.ayin?.camera)
      });
      olam.takeInCanvas(payload.canvas, payload.devicePixelRatio);
      RenderTrace.speak("worker_route:takeInCanvas_after_renderer", {
        hasRenderer: Boolean(olam.renderer),
        hasScene: Boolean(olam.scene),
        sceneChildren: olam.scene?.children?.length || 0
      });
      if (typeof olam.setSize === 'function') await olam.setSize(payload.width, payload.height);
      RenderTrace.speak("worker_route:takeInCanvas_after_size", {
        width: olam.width,
        height: olam.height,
        hasRenderer: Boolean(olam.renderer)
      });
      if (typeof olam.heesHawvoos === 'function') olam.heesHawvoos();
      self.postMessage({ type: 'canvas_transferred', payload: { width: payload.width, height: payload.height, devicePixelRatio: payload.devicePixelRatio, rendererReady: Boolean(olam.renderer), hasCamera: Boolean(olam.activeCamera || olam.ayin?.camera), sceneChildren: olam.scene?.children?.length || 0 } });
    },

    resize: async (olam, payload) => {
      if (typeof olam.setSize === 'function') await olam.setSize(payload.width, payload.height);
      olam.ayshPeula('resize', payload);
    },

    cameraDrag: (olam, payload) => {
      if (olam.ayin && typeof olam.ayin.rotateAroundTarget === 'function') olam.ayin.rotateAroundTarget(payload.dx, payload.dy);
    },

    resetAfterSpikeDeath,
    olamPeula: (olam, payload) => { for (const p in payload) olam.ayshPeula(p, payload[p]); },
    awtsCode: (olam, payload) => {
      try { const me = { olam }; eval(payload); }
      catch (e) { console.error('B"H - 🚨 [AWTS_CODE] Execution error:', e); }
    },
    keydown: (olam, payload) => olam.ayshPeula('keydown', payload),
    keyup: (olam, payload) => olam.ayshPeula('keyup', payload),
    mousedown: (olam, payload) => {
      if (olam.yichud) olam.yichud.handleEvent(payload, true);
      olam.ayshPeula('mousedown', payload);
    },
    mouseup: (olam, payload) => olam.ayshPeula('mouseup', payload),
    mousemove: (olam, payload) => {
      if (olam.yichud) olam.yichud.handleEvent(payload, false);
      olam.ayshPeula('mousemove', payload);
    },
    wheel: (olam, payload) => olam.ayshPeula('wheel', payload)
  };

  static async route(olam, key, payload, promiseMap) {
    if (!olam && key !== 'vessel_ready') return;
    const action = this.actionMap[key];
    if (typeof action === 'function') {
      await action(olam, payload);
      return;
    }
    const resolvingEvents = ['htmlCreated', 'htmlActioned', 'htmlDeleted', 'htmlActionsed', 'uiEvented', 'htmlGot'];
    if (resolvingEvents.includes(key) && payload?.id && promiseMap.has(payload.id)) {
      promiseMap.get(payload.id)(payload);
      promiseMap.delete(payload.id);
      return;
    }
    if (olam && typeof olam.ayshPeula === 'function') olam.ayshPeula(key, payload);
  }
}
