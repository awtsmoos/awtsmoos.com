// B"H
/**
 * @file WorkerMessageInterceptor.js
 * @purpose Worker bridge with quiet user-facing errors and strict first-playable loader gating.
 *
 * B"H — The Awtsmoos speaks the world into being every instant, but the loader
 * may not pretend that a canvas is a world. `loadedWorld` is only an artifact
 * crossing the river. `postbuild` is only a hammer falling silent. The curtain
 * lifts only when the worker declares the playable covenant: gameplay-ready,
 * first-playable-frame, or world_final_ready.
 */
import { oyvedManagerLog } from "../log/MainTextLogger.js";
import { workerMessageToText, isWorkerTextLog } from "./WorkerMessageText.js";
import { recordWorkerProgress } from "../progress/WorkerProgressStore.js";
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?v=loading-proof-mobile-20260706-bh3";

const SEAL = "final-proof-bridge-20260705-bh4";
const PLAYABLE_STAGE = /^(first-playable-frame|gameplay-ready|world_final_ready)$/i;
const PROBE_STAGE = /postbuild:ready-for-first-render|load-nivrayim:done|world_final_ready|first-playable-frame|gameplay-ready/i;
const trim = (a, n) => Array.isArray(a) ? a.slice(-n) : [];
const stamp = () => new Date().toISOString();

function suppress(text, label = "worker") {
  window.__AWTSMOOS_SUPPRESSED_ALERTS__ = trim([...(window.__AWTSMOOS_SUPPRESSED_ALERTS__ || []), {
    at:Date.now(), label, text:String(text).slice(0, 900), seal:SEAL
  }], 50);
}

function requestProbe() {
  const m = window.__AWTSMOOS_ACTIVE_WORKER_MANAGER__ || window.mana?.socket;
  const id = `groundDiag-${Date.now()}`;
  m?.postMessage?.({ playerProbe:{ id, seal:SEAL } });
  return id;
}

function proofBridgeManager() {
  return window.__AWTSMOOS_ACTIVE_WORKER_MANAGER__ || window.mana?.socket || null;
}

function mainThreadProofSnapshot() {
  const loading = window.__MITZVAH_LOADING_DIAG__?.() || window.__AWTSMOOS_LAST_LOAD_DIAG__ || null;
  const fps = window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || null;
  if (loading && fps && loading.firstPlayableMs == null) {
    const elapsed = Math.max(0, Date.now() - Number(loading.startedAt || Date.now()));
    loading.firstPlayableMs = elapsed;
    loading.finalReadyMs = elapsed;
    loading.finalReady = true;
    loading.hidden = true;
    loading.readyInferredFrom = "worker_gameplay_fps";
  }
  return {
    at:Date.now(),
    loading,
    fps,
    fpsHistory:(window.__AWTSMOOS_WORKER_GAMEPLAY_FPS_HISTORY__ || []).slice(-12),
    loadStages:(window.__AWTSMOOS_LOAD_STAGE_HISTORY__ || []).slice(-20)
  };
}

function publishMitzvahProofToDom(payload) {
  try {
    const doc = window.document;
    if (!doc?.body) return;
    let node = doc.getElementById("mitzvah-proof-output");
    if (!node) {
      node = doc.createElement("script");
      node.type = "application/json";
      node.id = "mitzvah-proof-output";
      node.setAttribute("data-awtsmoos-proof", "mitzvah-final");
      doc.body.appendChild(node);
    }
    node.textContent = JSON.stringify(payload || null, null, 2);
    doc.body.setAttribute("data-mitzvah-proof-ok", payload?.ok === true ? "true" : "false");
    doc.body.setAttribute("data-mitzvah-proof-at", String(Date.now()));
  } catch (error) {
    console.warn("B'H mitzvah proof DOM publish failed", error);
  }
}

function handleMitzvahProofResult(data) {
  const payload = data.payload || data;
  const merged = {
    ...payload,
    mainThread:mainThreadProofSnapshot()
  };
  if (merged.loading?.diag == null && merged.mainThread.loading) {
    merged.loading = {
      ok:merged.mainThread.loading.displayedProgressMonotonic !== false,
      diag:merged.mainThread.loading,
      source:"main-thread-loading-bridge"
    };
  }
  window.__MITZVAH_FINAL_PROOF__ = merged;
  window.__MITZVAH_FINAL_PROOF_HISTORY__ = trim([...(window.__MITZVAH_FINAL_PROOF_HISTORY__ || []), merged], 12);
  publishMitzvahProofToDom(merged);
  window.dispatchEvent?.(new CustomEvent("mitzvah-proof-result", { detail:merged }));
  return merged;
}

function runMitzvahProofFromWindow(which = "all", options = {}) {
  const manager = proofBridgeManager();
  if (!manager?.postMessage) return Promise.resolve({
    ok:false,
    reason:"worker-manager-not-ready",
    mainThread:mainThreadProofSnapshot(),
    seal:SEAL
  });
  const id = options.id || `mitzvah-proof-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const timeoutMs = Number(options.timeoutMs || 45000);
  return new Promise(resolve => {
    let done = false;
    const finish = value => {
      if (done) return;
      done = true;
      window.removeEventListener?.("mitzvah-proof-result", onResult);
      resolve(value);
    };
    const onResult = event => {
      const detail = event.detail || {};
      if (detail.id && detail.id !== id) return;
      finish(detail);
    };
    window.addEventListener?.("mitzvah-proof-result", onResult);
    window.setTimeout?.(() => finish({
      ok:false,
      id,
      reason:"mitzvah-proof-timeout",
      latest:window.__MITZVAH_FINAL_PROOF__ || null,
      mainThread:mainThreadProofSnapshot(),
      seal:SEAL
    }), timeoutMs);
    manager.postMessage({ mitzvahProof:{ id, which, seal:SEAL } });
  });
}

function maybeAutoRunMitzvahProof() {
  try {
    const params = new URLSearchParams(window.location.search || "");
    if (!params.has("awtsProof") || window.__MITZVAH_AUTO_PROOF_STARTED__) return;
    const playable = Boolean(window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__) || LoadingProgress.isFinalReady?.();
    if (!playable) return;
    window.__MITZVAH_AUTO_PROOF_STARTED__ = true;
    runMitzvahProofFromWindow(params.get("awtsProof") || "all", { timeoutMs:60000 })
      .then(report => publishMitzvahProofToDom(report))
      .catch(error => publishMitzvahProofToDom({
        ok:false,
        reason:"auto-proof-error",
        error:String(error?.message || error),
        mainThread:mainThreadProofSnapshot(),
        seal:SEAL
      }));
  } catch (error) {
    publishMitzvahProofToDom({
      ok:false,
      reason:"auto-proof-setup-error",
      error:String(error?.message || error),
      mainThread:mainThreadProofSnapshot(),
      seal:SEAL
    });
  }
}

function latestGroundingDiag() {
  const p = window.__AWTSMOOS_LAST_PLAYER_PROBE__;
  return p?.visualClamp || {
    warnings:["player grounding diagnostic not ready"],
    requestedWorkerProbe:true,
    requestId:requestProbe(),
    seal:SEAL
  };
}

function installGlobals() {
  if (window.__AWTSMOOS_WINDOW_COLLISION_DIAG_INSTALLED__ === SEAL) return;
  window.__AWTSMOOS_WINDOW_COLLISION_DIAG_INSTALLED__ = SEAL;
  window.__AWTSMOOS_REQUEST_PLAYER_PROBE_FROM_MANAGER__ = requestProbe;
  window.__MITZVAH_PLAYER_GROUNDING_DIAG__ = latestGroundingDiag;
  window.__AWTS_COLLISION_DIAG__ = () => window.__AWTSMOOS_LAST_PLAYER_PROBE__?.collisionDiag || { windowBridge:true, seal:SEAL };
  window.__AWTS_BUBBLE_DIAG__ = () => window.__AWTSMOOS_LAST_PLAYER_PROBE__?.bubbleDiag || { windowBridge:true, seal:SEAL };
  window.__AWTS_GROUNDING_DIAG__ = latestGroundingDiag;
  window.__MITZVAH_RUN_PROOF__ = runMitzvahProofFromWindow;
  window.__MITZVAH_PROOF_BRIDGE_DIAG__ = () => ({
    seal:SEAL,
    hasManager:Boolean(proofBridgeManager()),
    hasPostMessage:Boolean(proofBridgeManager()?.postMessage),
    lastProof:window.__MITZVAH_FINAL_PROOF__ || null,
    mainThread:mainThreadProofSnapshot()
  });
  window.__AWTS_PER_FRAME_REPORT__ = () => ({
    last:window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__,
    history:window.__AWTSMOOS_WORKER_GAMEPLAY_FPS_HISTORY__ || [],
    stages:window.__AWTSMOOS_LOAD_STAGE_HISTORY__ || []
  });
}

function rememberStage(stage, data) {
  window.__AWTSMOOS_LOAD_STAGE_HISTORY__ = trim([...(window.__AWTSMOOS_LOAD_STAGE_HISTORY__ || []), {
    at:Date.now(), iso:stamp(), stage, data
  }], 160);
  window.__AWTSMOOS_LAST_LOAD_STAGE__ = { stage, data, at:Date.now() };
}

function holdUntilPlayable(stage) {
  LoadingProgress.update?.({
    stage:`held:${stage}`,
    total:Math.min(98, Math.max(LoadingProgress.snapshot?.().total || 0, 88)),
    humanLabel:`${stage} received; waiting for first playable frame`,
    subAction:"loader remains visible until gameplay-ready / first-playable-frame / world_final_ready"
  });
}

function dispatchGameReadyPhase(stage, data) {
  window.dispatchEvent?.(new CustomEvent("awtsmoos:game-ready-phase", {
    detail:{ stage, data:data || null, at:Date.now(), seal:SEAL }
  }));
}

function mark(manager, stage, data = null) {
  dispatchGameReadyPhase(stage, data);
  if (stage === "vessel_ready") {
    if (manager.runtime) manager.runtime.vesselIsReady = true;
    manager._vesselIsReady = true;
    manager._dispatchPawsawch?.();
  }

  if (stage === "loadedWorld") {
    if (manager.runtime) manager.runtime.worldLoaded = true;
    manager._worldLoaded = true;
    holdUntilPlayable(stage);
  }

  if (stage === "canvas_transferred") {
    if (manager.runtime) manager.runtime.canvasTransferred = true;
    manager._canvasTransferred = true;
    LoadingProgress.update?.({
      stage:"canvas_transferred",
      total:96,
      humanLabel:"Canvas connected; waiting for first playable frame"
    });
  }

  if (PROBE_STAGE.test(stage)) setTimeout(requestProbe, 250);
  if (PLAYABLE_STAGE.test(stage)) LoadingProgress.markPlayable?.(stage);
  else if (/postbuild:ready-for-first-render|load-nivrayim:done/i.test(stage)) holdUntilPlayable(stage);
  maybeAutoRunMitzvahProof();
}

function handleProgress(manager, data) {
  const stage = String(data.stage || data.text || "unknown");
  rememberStage(stage, data);
  recordWorkerProgress(stage, data);
  LoadingProgress.workerProgress?.(data);
  mark(manager, stage, data);
}

function handlePlayerProbeResult(data) {
  const probe = data.payload || data;
  window.__AWTSMOOS_PLAYER_PROBES__ = trim([...(window.__AWTSMOOS_PLAYER_PROBES__ || []), probe], 40);
  window.__AWTSMOOS_LAST_PLAYER_PROBE__ = probe;
  window.__AWTSMOOS_LAST_GROUNDING_DIAG__ = probe.visualClamp || null;
  window.dispatchEvent?.(new CustomEvent("awtsmoos:player-probe-result", { detail:probe }));
  if (window.__AWTSMOOS_VERBOSE_PROBES__ === true) {
    console.info('B"H | PLAYER_PROBE_RESULT_JSON', { id:probe?.id, pass:probe?.visualClamp?.contract?.pass });
  }
}

function handleFps(data) {
  const payload = data.payload || data;
  window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ = payload;
  window.__AWTSMOOS_WORKER_GAMEPLAY_FPS_HISTORY__ = trim([...(window.__AWTSMOOS_WORKER_GAMEPLAY_FPS_HISTORY__ || []), {
    at:Date.now(), ...payload
  }], 120);
  window.AWTSMOOS_GAMEPLAY_FPS = payload;
  window.dispatchEvent?.(new CustomEvent("awtsmoos:worker-gameplay-fps", { detail:payload }));
  if (!LoadingProgress.isFinalReady?.()) LoadingProgress.markFinalReady?.("world_final_ready");
  maybeAutoRunMitzvahProof();
}

function handleLiving(type, payload) {
  window.__AWTSMOOS_LIVING_REGION_MAIN__ ||= { version:"main-proof", bootedAt:stamp(), received:[] };
  const main = window.__AWTSMOOS_LIVING_REGION_MAIN__;
  const entry = { at:stamp(), type, payload:payload || null };
  main.received = trim([...(main.received || []), entry], 24);
  main.last = entry;
  if (type === "runtime") window.AWTSMOOS_LIVING_REGION_STATS = payload?.stats || payload || null;
  if (type === "director") window.AWTSMOOS_LIVING_REGION_REPORT = payload?.report || payload || null;
  recordWorkerProgress(`living-region:${type}`, { type:`living-region:${type}`, payload });
}

function handleTestFeatureFlags(data) {
  const payload = data.payload || data;
  window.__AWTSMOOS_TEST_FEATURE_WORKER_REPORT__ = payload;
  window.dispatchEvent?.(new CustomEvent("awtsmoos:test-feature-worker-report", { detail:payload }));
}

function niceError(text) {
  const s = String(text || "");
  if (/TerrainOctreeWorld is not defined/.test(s)) return "Updating terrain collision worker… reload once.";
  if (/import failed|dependency import failed/i.test(s)) return "Worker module update in progress…";
  return "Worker is recovering…";
}

function quietError(data, label) {
  const text = workerMessageToText(data);
  oyvedManagerLog.error(text);
  suppress(text, label || data?.type || "worker-error");
  LoadingProgress.update?.({
    stage:"worker:recovering",
    action:niceError(text),
    subAction:"details saved in console",
    worker:42
  });
}

function handleText(data) {
  if (data.type === "worker_import_error_text" || data.type === "ERROR_TEXT") quietError(data, data.type);
}

export function interceptWorkerMessage(manager, event) {
  installGlobals();
  maybeAutoRunMitzvahProof();
  const data = event.data;
  if (data?.type === "worker_progress") return handleProgress(manager, data);
  if (data?.type === "worker_gameplay_fps") return handleFps(data);
  if (data?.type === "mitzvahProofResult") return handleMitzvahProofResult(data);
  if (data?.type === "test_feature_flags_result") return handleTestFeatureFlags(data);
  if (data?.type === "livingRegionRuntimeStats") return handleLiving("runtime", data.payload || data);
  if (data?.type === "livingRegionDirectorReport") return handleLiving("director", data.payload || data);
  if (data?.type === "render_trace") return;
  if (data?.type === "playerProbeResult") return handlePlayerProbeResult(data);
  if (isWorkerTextLog(data)) return handleText(data);
  if (!data || typeof data !== "object") return;
  if (data.type === "ERROR" || data.type === "ERROR_TEXT") return quietError(data, data.type);
  if (["vessel_ready", "loadedWorld", "canvas_transferred", "world_final_ready", "first-playable-frame", "gameplay-ready"].includes(data.type)) {
    handleProgress(manager, { ...data, type:"worker_progress", stage:data.type });
  }
}
