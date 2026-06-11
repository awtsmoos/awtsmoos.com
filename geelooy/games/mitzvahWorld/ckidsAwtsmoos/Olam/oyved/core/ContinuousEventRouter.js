// B"H
/**
 * @file ContinuousEventRouter.js
 * @description
 * Chapter 449: The continuous river becomes a small dispatcher.
 *
 * The Awtsmoos routes every after-genesis pulse here: canvas transfer, resize,
 * touch/mobile movement, camera drag, spike reset, world destruction, and the
 * hidden worker player probe. Heavy reset/disposal logic now lives in dedicated
 * vessels.
 */
import RenderTrace from "../../methods/canvas/RenderTrace.js";
import { rememberCanvasPayload } from "./CanvasMemory.js";
import { buildPlayerRuntimeProbe } from "./PlayerRuntimeProbe.js?v=visible-root-binding-20260610-bh710";
import { destroyWorld } from "./WorldDisposal.js?v=visible-root-binding-20260610-bh710";
import { resetAfterSpikeDeath, enableAfterSpikeReset } from "./SpikeResetActions.js?v=visible-root-binding-20260610-bh710";

const MOBILE_MOVE_FLAGS = Object.freeze(["FORWARD", "BACKWARD", "LEFT_STRIDE", "RIGHT_STRIDE"]);

function routerTrace(olam, stage, payload = {}) {
  const at = Date.now();
  const active = Array.isArray(payload.active) ? payload.active.length : 0;
  const cadence = active > 0 ? 900 : 2200;
  if (olam.__lastContinuousRouterTraceAt && at - olam.__lastContinuousRouterTraceAt < cadence) return;
  olam.__lastContinuousRouterTraceAt = at;
  olam.__movementTrace ||= [];
  olam.__movementTrace.push({ at, stage, ...payload });
  olam.__movementTrace = olam.__movementTrace.slice(-80);
}

async function takeInCanvas(olam, payload) {
  rememberCanvasPayload(payload);
  RenderTrace.speak("worker_route:takeInCanvas_received", {
    width: payload?.width,
    height: payload?.height,
    hasOlam: Boolean(olam),
    hasAyin: Boolean(olam?.ayin),
    hasCamera: Boolean(olam?.activeCamera || olam?.ayin?.camera)
  });
  olam.takeInCanvas(payload.canvas, payload.devicePixelRatio);
  if (typeof olam.setSize === "function") await olam.setSize(payload.width, payload.height);
  if (typeof olam.heesHawvoos === "function") olam.heesHawvoos();
  self.postMessage({ type: "canvas_transferred", payload: { width: payload.width, height: payload.height, devicePixelRatio: payload.devicePixelRatio, rendererReady: Boolean(olam.renderer), hasCamera: Boolean(olam.activeCamera || olam.ayin?.camera), sceneChildren: olam.scene?.children?.length || 0 } });
}

async function resize(olam, payload) {
  if (typeof olam.setSize === "function") await olam.setSize(payload.width, payload.height);
  olam.ayshPeula("resize", payload);
}

function applyMobileMove(olam, payload = {}) {
  olam.inputs ||= {};
  MOBILE_MOVE_FLAGS.forEach(flag => { olam.inputs[flag] = payload[flag] === true; });
  olam.__lastMobileMove = { at: Date.now(), ...payload };
  const active = MOBILE_MOVE_FLAGS.filter(flag => olam.inputs[flag]);
  routerTrace(olam, 'mobileMove-applied-active-router', { active, source: payload.source || 'unknown', seal: payload.seal || null });
}

function postPlayerProbe(olam, payload = {}) {
  const probe = buildPlayerRuntimeProbe(olam);
  self.postMessage({ type: "playerProbeResult", payload: { id: payload.id || null, ...probe } });
  routerTrace(olam, "playerProbe-result", { id: payload.id || null, modelParentIsRoot: probe.modelParentIsRoot, chossidCount: probe.chossidCount, activeInputs: probe.activeInputs });
}

function olamPeula(olam, payload) {
  for (const p in payload) olam.ayshPeula(p, payload[p]);
}

function awtsCode(olam, payload) {
  try { const me = { olam }; eval(payload); }
  catch (e) { console.error("B\"H - AWTS_CODE error:", e); }
}

const actionMap = Object.freeze({
  takeInCanvas,
  destroyWorld,
  resize,
  resetAfterSpikeDeath,
  enableAfterSpikeReset,
  mobileMove: applyMobileMove,
  playerProbe: postPlayerProbe,
  olamPeula,
  awtsCode,
  cameraDrag: (olam, payload) => { if (olam.ayin?.rotateAroundTarget) olam.ayin.rotateAroundTarget(payload.dx, payload.dy); },
  keydown: (olam, payload) => olam.ayshPeula("keydown", payload),
  keyup: (olam, payload) => olam.ayshPeula("keyup", payload),
  mousedown: (olam, payload) => { if (olam.yichud) olam.yichud.handleEvent(payload, true); olam.ayshPeula("mousedown", payload); },
  mouseup: (olam, payload) => olam.ayshPeula("mouseup", payload),
  mousemove: (olam, payload) => { if (olam.yichud) olam.yichud.handleEvent(payload, false); olam.ayshPeula("mousemove", payload); },
  wheel: (olam, payload) => olam.ayshPeula("wheel", payload)
});

function resolvePromiseEvent(key, payload, promiseMap) {
  const resolvingEvents = ["htmlCreated", "htmlActioned", "htmlDeleted", "htmlActionsed", "uiEvented", "htmlGot"];
  if (!resolvingEvents.includes(key) || !payload?.id || !promiseMap.has(payload.id)) return false;
  promiseMap.get(payload.id)(payload);
  promiseMap.delete(payload.id);
  return true;
}

export class ContinuousEventRouter {
  static actionMap = actionMap;

  static async route(olam, key, payload, promiseMap) {
    if (!olam && key !== "vessel_ready") return;
    const action = this.actionMap[key];
    if (typeof action === "function") return void await action(olam, payload);
    if (resolvePromiseEvent(key, payload, promiseMap)) return;
    if (olam?.ayshPeula) olam.ayshPeula(key, payload);
  }
}
