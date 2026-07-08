// B"H
/** @file LoadingProgressBridge.js @description Calm monotonic loader bridge with explicit errors. */
import { SEAL, FINAL } from "./loading/LoadingConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { canvasReady, clamp, frame } from "./loading/LoadingDom.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { state, hold } from "./loading/LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { paint } from "./loading/LoadingPaint.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { record } from "./loading/LoadingLog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { snapshot } from "./loading/LoadingSnapshot.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { finish, setStopHeartbeat } from "./loading/LoadingFinish.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { startLoadingHeartbeat, stopLoadingHeartbeat } from "./loading/LoadingHeartbeat.js?compact=true&v=loader-passive-heartbeat-20260708-bh1";
import { warmGeneratedAssetCache } from "./loading/LoadingCache.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { recordLoadingStage, finalizeLoadingProfiler, loadingProfilerSnapshot } from "./loading/LoadingProfiler.js?compact=true&v=load-profiler-20260708-bh1";
import { bridgeLoadingStage, runtimeRegistrySnapshot } from "../../runtime/readiness/RuntimeSubsystemRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

let pending = null;
let paintQueued = false;
const raw = { lastTotal:0, inputRegressions:0, updates:0, firstPlayableAt:null, finalReadyAt:null, lastStage:null, lastInput:null, zeroRequests:0, domSeed:0 };
const FATAL_IMPORT = /OYVED|Worker fatal|Module failed|SyntaxError|failed to fetch dynamically imported module|OlamVessel|missing \) after argument list/i;

function rawNumber(input = {}) { return clamp(input.total ?? input.amount ?? input.percent ?? raw.lastTotal); }
function short(value, max = 180) { return String(value || "").replace(/\s+/g, " ").slice(0, max); }
function visiblePercent() { const m = String(document.getElementById("genesisPercentText")?.textContent || "").match(/\d+(?:\.\d+)?/); return clamp(m ? Number(m[0]) : 0); }

function seedFromVisibleDom() {
  if (typeof document === "undefined") return;
  const v = visiblePercent();
  if (v <= 0) return;
  raw.domSeed = Math.max(raw.domSeed, v);
  raw.lastTotal = Math.max(raw.lastTotal, v);
  state.total = Math.max(state.total, v);
  state.visualFloor = Math.max(state.visualFloor || 0, v);
  state.rawTotal = Math.max(state.rawTotal || 0, v);
  state.hadPositiveDisplay = true;
}

function ensureErrorPanel(message) {
  if (typeof document === "undefined") return;
  const host = document.querySelector(".loadingContent") || document.getElementById("awtsmoosLoadingVeil");
  if (!host) return;
  let panel = document.getElementById("awtsmoosLoadingErrorPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "awtsmoosLoadingErrorPanel";
    panel.style.cssText = "pointer-events:auto;max-width:100%;box-sizing:border-box;border:1px solid rgba(255,110,110,.75);border-radius:12px;background:rgba(45,0,0,.78);color:#ffe9e9;font:800 11px/1.25 ui-monospace,Menlo,monospace;padding:8px 10px;white-space:pre-wrap;text-align:left";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Retry loading";
    button.style.cssText = "margin-top:7px;border:1px solid #ffd966;border-radius:8px;background:rgba(7,20,18,.92);color:#fff3c4;font:800 13px system-ui;padding:7px 12px";
    button.addEventListener("click", () => location.reload());
    panel.appendChild(document.createElement("div"));
    panel.appendChild(button);
    host.appendChild(panel);
  }
  panel.hidden = false;
  panel.firstChild.textContent = message;
  window.__MITZVAH_RETRY_LOADING__ = () => location.reload();
}

function classifyError(input = {}) {
  const text = [input.action, input.subAction, input.log, input.humanLabel, input.error, input.stack].map(short).join(" ");
  if (!FATAL_IMPORT.test(text)) return null;
  const path = text.match(/ckidsAwtsmoos\/Olam\/core\/OlamVessel\.js[^\s|]*/i)?.[0] || "worker module graph";
  const syntax = text.match(/SyntaxError:[^|]+|missing \) after argument list/i)?.[0] || "module import failed";
  return `LOAD ERROR\n${syntax}\n${path}\nLoading can continue only after this module parses. The page is not merely paused.`;
}

function displayInput(input = {}) {
  const out = { ...input };
  const fatal = classifyError(out);
  if (fatal) {
    state.lastImportRecoveryText = fatal;
    out.stage = "worker:fatal-error";
    out.action = "Load error detected";
    out.subAction = fatal.split("\n").slice(1).join(" | ");
    out.log = fatal;
    out.total = Math.max(state.total, 58);
    out.worker = Math.max(state.worker, 50);
    ensureErrorPanel(fatal);
  }
  const requested = rawNumber(out);
  if (requested <= 0) raw.zeroRequests += 1;
  const floor = state.hadPositiveDisplay && requested <= 0 ? Math.max(state.visualFloor || 0, state.total || 0, raw.domSeed || 0) : Math.max(state.visualFloor || 0, state.total || 0, raw.domSeed || 0, requested);
  state.visualFloor = floor;
  if (floor > 0) state.hadPositiveDisplay = true;
  if (out.total != null || out.amount != null || out.percent != null || out.stage) out.total = Math.min(98, Math.max(0, floor));
  return out;
}

function updateRaw(input = {}) {
  seedFromVisibleDom();
  const requested = rawNumber(input);
  const stage = String(input.stage || input.kind || raw.lastStage || "progress");
  const normalized = Math.max(raw.lastTotal, requested, raw.domSeed || 0);
  raw.updates += 1;
  raw.lastStage = stage;
  raw.lastInput = { ...input, requestedTotal:requested, total:normalized, domSeed:raw.domSeed, at:Date.now() };
  if (requested < raw.lastTotal) raw.inputRegressions += 1;
  raw.lastTotal = normalized;
  state.rawTotal = normalized;
  state.lastRealAt = input.synthetic ? state.lastRealAt : Date.now();
  state.blockingStages[stage] = (state.blockingStages[stage] || 0) + 1;
  state.slowestBlockingStage = Object.entries(state.blockingStages).sort((a, b) => b[1] - a[1])[0]?.[0] || stage;
  bridgeLoadingStage(stage, { ...input, requestedTotal:requested, total:normalized, domSeed:raw.domSeed });
  recordLoadingStage({ ...input, stage, requestedTotal:requested, total:normalized, domSeed:raw.domSeed });
}

function loadingProofFields() {
  const firstPlayableAt = raw.firstPlayableAt || state.firstPlayableAt;
  return {
    ok:true,
    visualNeverResetToZero:state.displayRegressionCount === 0,
    rawInputProgressRegressions:raw.inputRegressions,
    rawZeroRequests:raw.zeroRequests,
    domSeed:raw.domSeed,
    firstCanvasMs:state.firstCanvasAt ? state.firstCanvasAt - state.startedAt : null,
    firstPlayableMs:firstPlayableAt ? firstPlayableAt - state.startedAt : null,
    loadingHiddenMs:state.loadingHiddenAt ? state.loadingHiddenAt - state.startedAt : null,
    loaderAnimationFramesDuringStall:state.loaderAnimationFramesDuringStall,
    slowestBlockingStage:state.slowestBlockingStage,
    fatalConsoleErrors:state.fatalConsoleErrors || 0,
    lastLoadError:state.lastImportRecoveryText || null
  };
}

function diag() { return { ...snapshot(), raw:{ ...raw }, loading:loadingProofFields(), loadProfiler:loadingProfilerSnapshot(), runtimeRegistry:runtimeRegistrySnapshot(), seal:SEAL }; }
function publishDiag() { if (canvasReady()) state.firstCanvasAt ||= Date.now(); window.__MITZVAH_LOADING_DIAG__ = diag; window.__AWTSMOOS_LAST_LOAD_DIAG__ = diag; }

export function update(input = {}) {
  if (state.hidden) return;
  updateRaw(input);
  publishDiag();
  pending = { ...(pending || {}), ...displayInput(input) };
  if (paintQueued) return;
  paintQueued = true;
  frame(() => { paintQueued = false; const next = pending; pending = null; paint(next || {}); publishDiag(); });
}
export function workerProgress(data = {}) { update({ ...data, stage:String(data.stage || data.text || "worker") }); }
export function textureProgress(data = {}) { update({ stage:`texture:${data.stage || "progress"}`, texture:clamp(data.percent), ...data }); }
export function showError(error, label = "worker error") { update({ stage:"worker:error", total:Math.max(state.total, 58), action:String(label), subAction:short(error, 220), log:short(error, 260), error }); }
export function markFinalReady(reason = "world_final_ready") { const text = String(reason); bridgeLoadingStage(text, { total:100, reason:text }); recordLoadingStage({ stage:text, total:100, reason:text }); if (FINAL.test(text)) { raw.finalReadyAt ||= Date.now(); raw.firstPlayableAt ||= raw.finalReadyAt; state.firstPlayableAt ||= raw.firstPlayableAt; state.firstRenderableFrameAt ||= raw.firstPlayableAt; finalizeLoadingProfiler(text); publishDiag(); return finish(text); } hold(text); record(`waiting for playable proof: ${text}`); publishDiag(); return false; }
export function markPlayable(reason = "first-playable-frame") { raw.firstPlayableAt ||= Date.now(); state.firstPlayableAt ||= raw.firstPlayableAt; state.firstRenderableFrameAt ||= raw.firstPlayableAt; return markFinalReady(reason); }
export function hideLoading(reason = "hide requested") { hold(reason); record(`still loading in background: ${reason}`); publishDiag(); return false; }
export function scheduleHide() { return hideLoading("scheduleHide"); }
export function isFinalReady() { return Boolean(state.finalReady); }
export function simulateRawResetForProof() { update({ stage:"proof:raw-24", total:24 }); update({ stage:"proof:raw-reset", total:0 }); return loadingProofFields(); }

function installConsoleFatalCounter() {
  if (window.__AWTSMOOS_LOADING_CONSOLE_COUNTER__) return;
  const original = console.error?.bind(console);
  if (!original) return;
  console.error = (...args) => { const text = args.map(v => typeof v === "string" ? v : v?.message || v?.stack || "").join(" "); if (FATAL_IMPORT.test(text)) showError(text, "Worker/module error"); if (/THREE|TypeError|ReferenceError|SyntaxError|AWTSMOOS_RENDER_FATAL/i.test(text)) state.fatalConsoleErrors += 1; return original(...args); };
  window.__AWTSMOOS_LOADING_CONSOLE_COUNTER__ = true;
}
function installWindowBridge() {
  seedFromVisibleDom();
  const queue = Array.isArray(window.__AWTSMOOS_EARLY_LOADING_QUEUE__) ? window.__AWTSMOOS_EARLY_LOADING_QUEUE__.slice(-48) : [];
  installConsoleFatalCounter();
  window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, snapshot, runtimeRegistrySnapshot, isFinalReady, showError, simulateRawResetForProof, seal:SEAL };
  window.__AWTSMOOS_LOADING_BRIDGE_READY__ = true;
  publishDiag();
  queue.forEach(update);
  window.addEventListener("awtsmoos-texture-progress", event => textureProgress(event.detail || {}));
  window.addEventListener("awtsmoos-first-playable-frame", event => markPlayable(event?.detail?.reason || "first-playable-frame"));
  document.addEventListener("visibilitychange", () => { if (document.hidden && !state.hidden) record("Still loading in the background; no retry needed."); });
  setStopHeartbeat(stopLoadingHeartbeat);
  startLoadingHeartbeat(update);
  const idleWarm = () => warmGeneratedAssetCache();
  if (window.requestIdleCallback) window.requestIdleCallback(idleWarm, { timeout:2500 }); else setTimeout(idleWarm, 900);
}
if (typeof window !== "undefined") installWindowBridge();
export default { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, startLoadingHeartbeat, stopLoadingHeartbeat, snapshot, runtimeRegistrySnapshot, isFinalReady, showError, simulateRawResetForProof, loadingProfilerSnapshot };
