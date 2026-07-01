// B"H
/**
 * @file LoadingProgressBridge.js
 * @purpose Bind the visible loading veil to real worker/world readiness only.
 * @owner mitzvahWorld runtime loading authority.
 * @inputs worker progress, texture progress, UI progress, final-ready proof.
 * @outputs DOM progress bars, loading state snapshot, awtsmoos-game-ready event.
 * @runtimeAuthority The veil may hide only after world_final_ready is proven.
 * @updateOrder imports -> stage progress -> final proof -> hide.
 * @callers WorkerProgressStore, WorkerMessageInterceptor, worker UI handlers.
 * @invariants totals never hit 100 before final proof; errors keep veil visible.
 * @failureModes missing DOM becomes a no-op; premature hide requests are held.
 */
const READY_SEAL = "real-final-ready-20260701-bh2";
const IDS = Object.freeze({ total:"genesisProgressBar", world:"genesisWorldBar", worker:"genesisWorkerBar", texture:"genesisTextureBar", action:"genesisActionText", sub:"genesisSubActionText", percent:"genesisPercentText", workerText:"genesisWorkerText", textureText:"genesisTextureText", log:"genesisProgressLog" });
const STAGES = Object.freeze([["entrypoint",5],["boot-runner",10],["angelic-invoker",16],["vessel_ready",20],["message:pawsawch",24],["soul-loader",28],["load-nivrayim:parse",32],["load-nivrayim:heescheel",48],["load-nivrayim:madeAll",52],["load-nivrayim:ready",64],["postbuild:regionStack",74],["postbuild:battleLayer",80],["postbuild:visualReality",83],["postbuild:npcLife",93],["postbuild:ready-for-first-render",99],["canvas_transferred",99],["loadedWorld",99],["world_final_ready",100]]);
const state = { total:0, world:0, worker:0, texture:0, hidden:false, finalReady:false, log:[], lastStyle:new Map(), startedAt:Date.now(), readyEventSent:false, readyReason:"", heldHideReason:"" };
let hideTimer = null, paintQueued = false, pending = null, heartbeat = null;
const doc = () => typeof document === "undefined" ? null : document;
const byId = id => doc()?.getElementById(id) || null;
const clamp = value => Math.max(0, Math.min(100, Number(value) || 0));
function stagePercent(stage = "") { for (const [prefix, percent] of STAGES) if (String(stage).startsWith(prefix)) return percent; return state.total; }
function writeText(id, value) { const node = byId(id), next = value == null ? "" : String(value); if (node && node.textContent !== next) node.textContent = next; }
function writeWidth(id, percent) { const node = byId(id), next = `${Math.round(clamp(percent))}%`; if (!node || state.lastStyle.get(id) === next) return; state.lastStyle.set(id, next); node.style.width = next; }
function bar(key, value) { const next = Math.max(state[key], clamp(value)); if (state[key] === next) return; state[key] = next; writeWidth(IDS[key], next); }
function visibleCanvasReady() { const c = doc()?.querySelector?.("canvas"); return Boolean(c && c.clientWidth > 0 && c.clientHeight > 0); }
function snapshot() { return { total:state.total, world:state.world, worker:state.worker, texture:state.texture, hidden:state.hidden, finalReady:state.finalReady, readyEventSent:state.readyEventSent, readyReason:state.readyReason, heldHideReason:state.heldHideReason, startedAt:state.startedAt, canvasReady:visibleCanvasReady(), log:[...state.log] }; }
function readyPhase(reason = "") { return /world_final_ready|worker final|final ready/i.test(String(reason)) ? "world_final_ready" : "held"; }
function title(stage) { if (stage === "world_final_ready") return "World ready"; if (stage.includes("error")) return "Worker error"; if (stage.includes("texture")) return "Preparing textures..."; if (stage.includes("postbuild")) return "Building the finished zone..."; if (stage.includes("load-nivrayim")) return "Creating the world..."; return "Opening the world..."; }
function record(message) { if (!message || state.log.at(-1) === message) return; state.log.push(String(message).slice(0, 160)); state.log = state.log.slice(-3); writeText(IDS.log, state.log.join("\n")); }
function setRadialLoad() { const node = doc()?.querySelector?.(".loading-radial-core"), next = `${Math.round(state.total)}%`; if (node && state.lastStyle.get("radial") !== next) { state.lastStyle.set("radial", next); node.style.setProperty("--load", next); } }
function dispatchReadyEvent(reason = "world_final_ready") {
  if (state.readyEventSent || typeof window === "undefined") return;
  state.readyEventSent = true; state.readyReason = reason; window.__AWTSMOOS_BOOT_LOADED__ = true;
  const proof = { at:Date.now(), phase:readyPhase(reason), reason, source:"loading-progress-bridge", canvasReady:visibleCanvasReady(), seal:READY_SEAL, snapshot:snapshot() };
  window.__AWTSMOOS_LOADING_FINAL_READY__ = proof;
  window.dispatchEvent?.(new CustomEvent("awtsmoos-game-ready", { detail:{ phase:proof.phase, source:proof.source, reason, seal:READY_SEAL, payload:proof } }));
}
function finalReason(reason) { return /world_final_ready|worker final|final ready/i.test(String(reason)); }
function paint(input = {}) {
  if (!doc() || state.hidden) return;
  const stage = String(input.stage || input.kind || "progress");
  if (stage === "world_final_ready") return markFinalReady("world_final_ready");
  const total = input.total ?? input.amount ?? stagePercent(stage);
  bar("total", Math.min(99, total));
  if (input.world != null || stage.includes("load") || stage.includes("postbuild")) bar("world", Math.min(99, input.world ?? stagePercent(stage)));
  if (input.worker != null || stage) bar("worker", Math.min(99, input.worker ?? stagePercent(stage)));
  if (input.texture != null) bar("texture", Math.min(99, input.texture));
  writeText(IDS.percent, `${Math.round(state.total)}%`); writeText(IDS.action, input.action || title(stage));
  writeText(IDS.sub, input.subAction || input.label || stage.replace(/:/g, " "));
  writeText(IDS.workerText, stage.replace(/[-:]/g, " ").slice(0, 72));
  if (input.textureLabel) writeText(IDS.textureText, input.textureLabel);
  setRadialLoad(); record(input.log || input.subAction || stage);
}
export function update(input = {}) { if (state.hidden) return; pending = { ...(pending || {}), ...input }; if (paintQueued) return; paintQueued = true; const flush = () => { paintQueued = false; const next = pending; pending = null; paint(next || {}); }; (typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout)(flush, 16); }
export function workerProgress(data = {}) { update({ stage:String(data.stage || data.text || "worker"), action:title(String(data.stage || "worker")), subAction:data.label || data.stage, log:data.log || data.stage }); }
export function textureProgress(data = {}) { update({ stage:`texture:${data.stage || "progress"}`, texture:clamp(data.percent), textureLabel:`${data.type || data.kind || "texture"} ${clamp(data.percent)}%` }); }
export function showError(error, label = "worker error") { update({ stage:"worker:error", action:"Worker error", subAction:String(label).slice(0, 120), log:String(error || label).slice(0, 160) }); }
export function isFinalReady() { return Boolean(state.finalReady); }
export function markFinalReady(reason = "world_final_ready") {
  if (!finalReason(reason)) { state.heldHideReason = String(reason); record(`waiting for world_final_ready: ${reason}`); return false; }
  state.finalReady = true; state.total = state.world = state.worker = state.texture = 100;
  writeWidth(IDS.total, 100); writeWidth(IDS.world, 100); writeWidth(IDS.worker, 100); writeWidth(IDS.texture, 100);
  writeText(IDS.percent, "100%"); writeText(IDS.action, "World ready"); writeText(IDS.sub, reason);
  setRadialLoad(); dispatchReadyEvent(reason); if (!state.hidden) scheduleHide(40); return true;
}
export function hideLoading(reason = "hide requested") { return markFinalReady(reason); }
export function scheduleHide(ms = 40) { if (hideTimer || state.hidden || !state.finalReady) return false; hideTimer = setTimeout(reallyHide, ms); return true; }
function removeAll(selector) { doc()?.querySelectorAll?.(selector)?.forEach(node => node.remove()); }
function reallyHide() { if (state.hidden || !state.finalReady) return; state.hidden = true; pending = null; stopLoadingHeartbeat(); doc()?.querySelectorAll?.(".loading").forEach(node => node.classList.add("awtsmoos-loading-out")); setTimeout(() => removeAll(".loading,.loadingContent,.menu .rectangle"), 90); doc()?.querySelectorAll?.(".menu.hidden.offscreen").forEach(node => node.remove()); doc()?.documentElement?.classList?.add?.("awtsmoos-gameplay-dom-quiet"); }
function heartbeatTick() { if (!state.hidden && !state.finalReady) record("waiting for world_final_ready"); }
export function startLoadingHeartbeat() { if (heartbeat || !doc() || state.hidden) return; heartbeat = setInterval(heartbeatTick, 1500); }
export function stopLoadingHeartbeat() { if (heartbeat) clearInterval(heartbeat); heartbeat = null; }
if (typeof window !== "undefined") { const earlyQueue = Array.isArray(window.__AWTSMOOS_EARLY_LOADING_QUEUE__) ? window.__AWTSMOOS_EARLY_LOADING_QUEUE__.slice(-24) : []; window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading, markFinalReady, scheduleHide, snapshot, isFinalReady, showError, seal:READY_SEAL }; window.__AWTSMOOS_LOADING_BRIDGE_READY__ = true; earlyQueue.forEach(item => update(item)); window.addEventListener("awtsmoos-texture-progress", event => textureProgress(event.detail || {})); startLoadingHeartbeat(); }
export default { update, workerProgress, textureProgress, hideLoading, markFinalReady, scheduleHide, startLoadingHeartbeat, stopLoadingHeartbeat, snapshot, isFinalReady, showError };
