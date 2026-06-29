// B"H
/**
 * @file LoadingProgressBridge.js
 * @description
 * Chapter 919: The veil now leaves as soon as the canvas is alive. Chrome
 * proved genesis progress nodes were mutating deep into playable gameplay.
 * This bridge paints boot progress only before play; visible canvas or first
 * gameplay input starts a short grace window, then all loading DOM is removed.
 */
const IDS = Object.freeze({
  total:"genesisProgressBar", world:"genesisWorldBar", worker:"genesisWorkerBar", texture:"genesisTextureBar",
  action:"genesisActionText", sub:"genesisSubActionText", percent:"genesisPercentText",
  workerText:"genesisWorkerText", textureText:"genesisTextureText", log:"genesisProgressLog"
});
const STAGES = Object.freeze([
  ["entrypoint",5],["boot-runner",10],["angelic-invoker",16],["vessel_ready",20],["message:pawsawch",24],
  ["soul-loader",28],["load-nivrayim:parse",32],["load-nivrayim:heescheel",48],["load-nivrayim:madeAll",52],
  ["load-nivrayim:ready",64],["postbuild:regionStack",74],["postbuild:battleLayer",80],["postbuild:visualReality",83],
  ["postbuild:npcLife",93],["postbuild:ready-for-first-render",99],["canvas_transferred",99],["loadedWorld",99],["world_final_ready",100]
]);
const state = { total:0, world:0, worker:0, texture:0, hidden:false, finalReady:false, log:[], lastStyle:new Map(), firstCanvasAt:0, firstInputAt:0, startedAt:Date.now() };
let heartbeat = null, hideTimer = null, paintQueued = false, pending = null;
const doc = () => typeof document === "undefined" ? null : document;
const byId = id => doc()?.getElementById(id) || null;
const clamp = value => Math.max(0, Math.min(100, Number(value) || 0));
function stagePercent(stage = "") { for (const [prefix, percent] of STAGES) if (String(stage).startsWith(prefix)) return percent; return state.total; }
function visibleCanvasReady() { const c = doc()?.querySelector?.("canvas"); return Boolean(c && c.clientWidth > 0 && c.clientHeight > 0); }
function gameplayStarted() { return visibleCanvasReady() || state.firstInputAt > 0 || Boolean(window.__AWTSMOOS_BOOT_LOADED__); }
function noteCanvas() { if (visibleCanvasReady() && !state.firstCanvasAt) state.firstCanvasAt = Date.now(); }
function shouldQuiesceNow() {
  noteCanvas();
  const now = Date.now();
  if (state.finalReady) return true;
  if (state.firstInputAt && now - state.firstInputAt > 250) return true;
  if (state.firstCanvasAt && now - state.firstCanvasAt > 1450) return true;
  if (visibleCanvasReady() && now - state.startedAt > 2600) return true;
  return false;
}
function writeText(id, value) { const node = byId(id), next = value == null ? "" : String(value); if (node && node.textContent !== next) node.textContent = next; }
function writeWidth(id, percent) { const node = byId(id), next = `${Math.round(clamp(percent))}%`; if (!node || state.lastStyle.get(id) === next) return; state.lastStyle.set(id, next); node.style.width = next; }
function bar(key, value) { const next = Math.max(state[key], clamp(value)); if (state[key] === next) return; state[key] = next; writeWidth(IDS[key], next); }
function title(stage) { if (stage === "world_final_ready") return "World ready"; if (stage.includes("texture")) return "Preparing textures..."; if (stage.includes("postbuild")) return "Building the finished zone..."; if (stage.includes("load-nivrayim")) return "Creating the world..."; return "Opening the world..."; }
function record(message) { if (!message || state.log.at(-1) === message) return; state.log.push(message); state.log = state.log.slice(-3); writeText(IDS.log, state.log.join("\n")); }
function setRadialLoad() { const node = doc()?.querySelector?.(".loading-radial-core"), next = `${Math.round(state.total)}%`; if (node && state.lastStyle.get("radial") !== next) { state.lastStyle.set("radial", next); node.style.setProperty("--load", next); } }
function paint(input = {}) {
  if (!doc() || state.hidden) return;
  if (shouldQuiesceNow()) return markFinalReady("canvas playable");
  const stage = String(input.stage || input.kind || "progress"), total = input.total ?? input.amount ?? stagePercent(stage);
  state.finalReady ||= stage === "world_final_ready";
  bar("total", state.finalReady ? total : Math.min(99, total));
  if (input.world != null || stage.includes("load") || stage.includes("postbuild")) bar("world", input.world ?? stagePercent(stage));
  if (input.worker != null || stage) bar("worker", input.worker ?? stagePercent(stage));
  if (input.texture != null) bar("texture", input.texture);
  writeText(IDS.percent, `${Math.round(state.total)}%`); writeText(IDS.action, input.action || title(stage));
  writeText(IDS.sub, input.subAction || input.label || stage.replace(/:/g, " ")); writeText(IDS.workerText, stage.replace(/[-:]/g, " ").slice(0, 72));
  if (input.textureLabel) writeText(IDS.textureText, input.textureLabel);
  setRadialLoad(); record(input.log || input.subAction || stage);
  if (state.finalReady || stage === "world_final_ready") scheduleHide(60);
}
export function update(input = {}) { if (state.hidden) return; if (shouldQuiesceNow()) return markFinalReady("playable update gate"); pending = { ...(pending || {}), ...input }; if (paintQueued) return; paintQueued = true; const flush = () => { paintQueued = false; const next = pending; pending = null; paint(next || {}); }; (typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout)(flush, 16); }
export function workerProgress(data = {}) { update({ stage:String(data.stage || data.text || "worker"), action:title(String(data.stage || "worker")), subAction:data.label || data.stage }); }
export function textureProgress(data = {}) { update({ stage:`texture:${data.stage || "progress"}`, texture:clamp(data.percent), textureLabel:`${data.type || data.kind || "texture"} ${clamp(data.percent)}%` }); }
export function markFinalReady(reason = "first rendered frame confirmed") { if (state.hidden) return; state.finalReady = true; state.total = state.world = state.worker = state.texture = 100; scheduleHide(reason === "instant" ? 0 : 40); }
export function hideLoading() { markFinalReady("hide requested"); }
export function scheduleHide(ms = 40) { if (hideTimer || state.hidden) return; hideTimer = setTimeout(reallyHide, ms); }
function removeAll(selector) { doc()?.querySelectorAll?.(selector)?.forEach(node => node.remove()); }
function reallyHide() {
  if (state.hidden) return;
  state.hidden = true; pending = null; stopLoadingHeartbeat();
  removeAll(".loading,.loadingContent,.menu .rectangle");
  doc()?.querySelectorAll?.(".menu.hidden.offscreen").forEach(node => node.remove());
  doc()?.documentElement?.classList?.add?.("awtsmoos-gameplay-dom-quiet");
}
function heartbeatTick() { if (state.hidden) return; if (shouldQuiesceNow()) markFinalReady("heartbeat playable gate"); }
export function startLoadingHeartbeat() { if (heartbeat || !doc() || state.hidden) return; heartbeat = setInterval(heartbeatTick, 250); }
export function stopLoadingHeartbeat() { if (heartbeat) clearInterval(heartbeat); heartbeat = null; }
function noteInput() { if (!state.firstInputAt) state.firstInputAt = Date.now(); }
if (typeof window !== "undefined") {
  window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading, markFinalReady, seal:"early-gameplay-dom-quiet-20260624-bh2" };
  window.addEventListener("awtsmoos-texture-progress", event => textureProgress(event.detail || {}));
  window.addEventListener("keydown", noteInput, { capture:true, passive:true });
  window.addEventListener("pointerdown", noteInput, { capture:true, passive:true });
  startLoadingHeartbeat();
}
export default { update, workerProgress, textureProgress, hideLoading, markFinalReady, scheduleHide, startLoadingHeartbeat, stopLoadingHeartbeat };
