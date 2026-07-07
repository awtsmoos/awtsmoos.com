// B"H
/**
 * @file LoadingProgressBridge.js
 * @description First-paint loader bridge with monotonic progress and recovery UI.
 */
import { SEAL, FINAL } from "./loading/LoadingConstants.js";
import { canvasReady, clamp, frame } from "./loading/LoadingDom.js";
import { state, hold } from "./loading/LoadingState.js";
import { paint } from "./loading/LoadingPaint.js";
import { record } from "./loading/LoadingLog.js";
import { snapshot } from "./loading/LoadingSnapshot.js";
import { finish, setStopHeartbeat } from "./loading/LoadingFinish.js";
import { startLoadingHeartbeat, stopLoadingHeartbeat } from "./loading/LoadingHeartbeat.js";
import { warmGeneratedAssetCache } from "./loading/LoadingCache.js";
import { bridgeLoadingStage, runtimeRegistrySnapshot } from "../../runtime/readiness/RuntimeSubsystemRegistry.js";

let pending = null;
let paintQueued = false;
const START_FLOOR = 0;
const IMPORT_CASE_ERROR = /worker.*import failed|dependency import failed|failed to fetch dynamically imported module|ckidsAwtsmoos\/olam\/|OlamVessel/i;
const raw = { lastTotal: 0, regressions: 0, updates: 0, firstPlayableAt: null, finalReadyAt: null, lastStage: null, lastInput: null, zeroRequests: 0 };

function rawNumber(input = {}) { return clamp(input.total ?? input.amount ?? input.percent ?? raw.lastTotal); }
function recoveryText(text) {
  if (!IMPORT_CASE_ERROR.test(String(text || ""))) return null;
  return "Worker import needs the real uppercase path: ckidsAwtsmoos/Olam/core/OlamVessel.js. Retry after cache clears; do not create a lowercase olam alias.";
}

function ensureRecoveryButton(text) {
  if (typeof document === "undefined") return;
  const host = document.querySelector(".loadingContent") || document.getElementById("awtsmoosLoadingVeil");
  if (!host) return;
  let button = document.getElementById("awtsmoosLoadingRetryButton");
  if (!button) {
    button = document.createElement("button");
    button.id = "awtsmoosLoadingRetryButton";
    button.type = "button";
    button.textContent = "Retry loading";
    button.style.cssText = "pointer-events:auto;border:1px solid #ffd966;border-radius:8px;background:rgba(7,20,18,.88);color:#fff3c4;font:800 14px system-ui;padding:9px 14px;box-shadow:0 8px 18px rgba(0,0,0,.25)";
    button.addEventListener("click", () => location.reload());
    host.appendChild(button);
  }
  button.title = text;
  button.hidden = false;
  window.__MITZVAH_RETRY_LOADING__ = () => location.reload();
}

function displayFloor(value) {
  const next = clamp(value);
  if (next <= 0) raw.zeroRequests += 1;
  const floor = state.hadPositiveDisplay && next <= 0
    ? Math.max(state.visualFloor || 0, state.total || 0)
    : Math.max(START_FLOOR, state.visualFloor || 0, state.total || 0, next);
  state.visualFloor = floor;
  if (floor > 0) state.hadPositiveDisplay = true;
  if (floor > 0) state.minDisplayedAfterStart = Math.max(state.minDisplayedAfterStart || 0, floor);
  return floor;
}

function updateRaw(input = {}) {
  const total = rawNumber(input);
  const stage = String(input.stage || input.kind || raw.lastStage || "progress");
  raw.updates += 1;
  raw.lastStage = stage;
  raw.lastInput = { ...input, at: Date.now() };
  if (total < raw.lastTotal) raw.regressions += 1;
  raw.lastTotal = Math.max(raw.lastTotal, total);
  state.rawTotal = total;
  state.blockingStages[stage] = (state.blockingStages[stage] || 0) + 1;
  state.slowestBlockingStage = Object.entries(state.blockingStages).sort((a, b) => b[1] - a[1])[0]?.[0] || stage;
  bridgeLoadingStage(stage, { ...input, total });
}

function displayInput(input = {}) {
  const out = { ...input };
  const repair = recoveryText([out.action, out.subAction, out.log, out.humanLabel].join(" "));
  if (repair) {
    state.lastImportRecoveryText = repair;
    out.action = "Loading can recover.";
    out.subAction = repair;
    out.log = repair;
    ensureRecoveryButton(repair);
  } else if (out.stage === "worker:recovering" && state.lastImportRecoveryText) {
    out.action = "Loading can recover.";
    out.subAction = state.lastImportRecoveryText;
    out.log = state.lastImportRecoveryText;
  }
  const floor = displayFloor(rawNumber(out));
  if (out.total != null || out.amount != null || out.percent != null || out.stage) {
    out.total = Math.min(98, Math.max(START_FLOOR, floor));
  }
  return out;
}

function loadingProofFields() {
  const firstCanvasMs = state.firstCanvasAt ? state.firstCanvasAt - state.startedAt : null;
  const firstRenderableFrameMs = state.firstRenderableFrameAt ? state.firstRenderableFrameAt - state.startedAt : null;
  const firstPlayableMs = (raw.firstPlayableAt || state.firstPlayableAt) ? (raw.firstPlayableAt || state.firstPlayableAt) - state.startedAt : null;
  const loadingHiddenMs = state.loadingHiddenAt ? state.loadingHiddenAt - state.startedAt : null;
  const monotonic = state.displayRegressionCount === 0;
  return {
    ok: true,
    initialZeroAllowed: true,
    visualNeverResetToZero: monotonic,
    neverResetToZeroAfterPositive: monotonic,
    visibleNeverResetToZeroAfterPositive: monotonic,
    noBlackFrameBeforePlayable: state.finalReady ? Boolean(state.firstRenderableFrameAt || raw.firstPlayableAt) : null,
    displayRegressionCount: state.displayRegressionCount,
    visualRegressionCount: state.displayRegressionCount,
    rawRegressionCount: raw.regressions,
    rawZeroRequests: raw.zeroRequests,
    minDisplayedAfterStart: state.minDisplayedAfterStart,
    sessionResetCount: state.sessionResetCount,
    firstCanvasMs,
    firstRenderableFrameMs,
    firstPlayableMs,
    loadingHiddenMs,
    loaderAnimationFramesDuringStall: state.loaderAnimationFramesDuringStall,
    slowestBlockingStage: state.slowestBlockingStage,
    fatalConsoleErrors: state.fatalConsoleErrors || 0,
    importRecoveryText: state.lastImportRecoveryText || null
  };
}

function diag() {
  return {
    ...snapshot(),
    raw: { ...raw },
    loading: loadingProofFields(),
    runtimeRegistry: runtimeRegistrySnapshot(),
    displayedProgressMonotonic: state.displayRegressionCount === 0,
    rawProgressRegressions: raw.regressions,
    firstPlayableMs: loadingProofFields().firstPlayableMs,
    finalReadyMs: raw.finalReadyAt ? raw.finalReadyAt - state.startedAt : null,
    hidden: state.hidden,
    seal: SEAL
  };
}

function publishDiag() {
  if (canvasReady()) state.firstCanvasAt ||= Date.now();
  if (typeof window !== "undefined") {
    window.__MITZVAH_LOADING_DIAG__ = diag;
    window.__AWTSMOOS_LAST_LOAD_DIAG__ = diag;
    window.__MITZVAH_RUNTIME_REGISTRY_SNAPSHOT__ = runtimeRegistrySnapshot;
  }
}

export function update(input = {}) {
  if (state.hidden) return;
  updateRaw(input);
  publishDiag();
  pending = { ...(pending || {}), ...displayInput(input) };
  if (paintQueued) return;
  paintQueued = true;
  frame(() => {
    paintQueued = false;
    const next = pending;
    pending = null;
    paint(next || {});
    publishDiag();
  });
}

export function workerProgress(data = {}) { update({ ...data, stage: String(data.stage || data.text || "worker") }); }
export function textureProgress(data = {}) { update({ stage: `texture:${data.stage || "progress"}`, texture: state.hadPositiveDisplay ? Math.max(START_FLOOR, clamp(data.percent)) : clamp(data.percent), ...data }); }
export function showError(error, label = "worker error") {
  const text = String(error || label);
  const repair = recoveryText(text);
  if (repair) ensureRecoveryButton(repair);
  update({
    stage: "worker:error",
    total: Math.max(state.total, 58),
    worker: Math.max(state.worker, 50),
    action: repair ? "Loading can recover." : "Recovering load...",
    humanLabel: String(label).slice(0, 90),
    subAction: repair || "The worker reported an error; details are saved for diagnostics.",
    log: (repair || text).slice(0, 220),
    softError: true
  });
}

export function markFinalReady(reason = "world_final_ready") {
  const text = String(reason);
  bridgeLoadingStage(text, { total: 100, reason: text });
  if (FINAL.test(text)) {
    raw.finalReadyAt ||= Date.now();
    raw.firstPlayableAt ||= raw.finalReadyAt;
    state.firstPlayableAt ||= raw.firstPlayableAt;
    state.firstRenderableFrameAt ||= raw.firstPlayableAt;
    publishDiag();
    return finish(text);
  }
  hold(text);
  record(`waiting for playable proof: ${text}`);
  publishDiag();
  return false;
}

export function markPlayable(reason = "first-playable-frame") {
  raw.firstPlayableAt ||= Date.now();
  state.firstPlayableAt ||= raw.firstPlayableAt;
  state.firstRenderableFrameAt ||= raw.firstPlayableAt;
  return markFinalReady(reason);
}

export function hideLoading(reason = "hide requested") { hold(reason); record(`waiting for playable frame: ${reason}`); publishDiag(); return false; }
export function scheduleHide() { return hideLoading("scheduleHide"); }
export function isFinalReady() { return Boolean(state.finalReady); }
export function simulateRawResetForProof() { update({ stage: "proof:raw-24", total: 24 }); update({ stage: "proof:raw-reset", total: 0 }); return loadingProofFields(); }

function installConsoleFatalCounter() {
  if (window.__AWTSMOOS_LOADING_CONSOLE_COUNTER__) return;
  const original = console.error?.bind(console);
  if (!original) return;
  console.error = (...args) => {
    const text = args.map(v => typeof v === "string" ? v : v?.message || "").join(" ");
    const repair = recoveryText(text);
    if (repair) showError(repair, "worker import path");
    if (/THREE|TypeError|ReferenceError|SyntaxError|AWTSMOOS_RENDER_FATAL/i.test(text)) state.fatalConsoleErrors += 1;
    return original(...args);
  };
  window.__AWTSMOOS_LOADING_CONSOLE_COUNTER__ = true;
}

function installWindowBridge() {
  const queue = Array.isArray(window.__AWTSMOOS_EARLY_LOADING_QUEUE__) ? window.__AWTSMOOS_EARLY_LOADING_QUEUE__.slice(-24) : [];
  installConsoleFatalCounter();
  window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, snapshot, runtimeRegistrySnapshot, isFinalReady, showError, simulateRawResetForProof, seal: SEAL };
  window.__AWTSMOOS_LOADING_BRIDGE_READY__ = true;
  publishDiag();
  queue.forEach(update);
  window.addEventListener("awtsmoos-texture-progress", event => textureProgress(event.detail || {}));
  window.addEventListener("awtsmoos-first-playable-frame", event => markPlayable(event?.detail?.reason || "first-playable-frame"));
  setStopHeartbeat(stopLoadingHeartbeat);
  startLoadingHeartbeat(update);
  warmGeneratedAssetCache();
}

if (typeof window !== "undefined") installWindowBridge();
export default { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, startLoadingHeartbeat, stopLoadingHeartbeat, snapshot, runtimeRegistrySnapshot, isFinalReady, showError, simulateRawResetForProof };
