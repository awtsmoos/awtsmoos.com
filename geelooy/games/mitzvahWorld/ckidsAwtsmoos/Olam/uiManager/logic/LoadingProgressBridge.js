// B"H
/**
 * @file LoadingProgressBridge.js
 * @description
 * Chapter 439: faster loading feedback, less DOM weight.
 * The Awtsmoos keeps the radial/multi-bar covenant, but throttles logs and text
 * writes so mobile paints faster while still never appearing silent.
 */
const BAR_IDS = { total: "genesisProgressBar", world: "genesisWorldBar", worker: "genesisWorkerBar", texture: "genesisTextureBar" };
const LABEL_IDS = { action: "genesisActionText", sub: "genesisSubActionText", percent: "genesisPercentText", worker: "genesisWorkerText", texture: "genesisTextureText", log: "genesisProgressLog" };
const STAGE_BASE = { entrypoint: 8, "boot-runner": 15, "angelic-invoker": 24, message: 34, pawsawch: 45, "soul-loader": 58, "load-nivrayim": 68, lifecycle: 78, postbuild: 88, loadedWorld: 94, canvas_transferred: 98, texture: 12 };
let state = { total: 0, world: 0, worker: 0, texture: 0, lastAt: 0, log: [], lastDomAt: 0, lastLogAt: 0 };
let heartbeat = null;
const doc = () => (typeof document === "undefined" ? null : document);
const el = id => doc()?.getElementById(id) || null;
function clamp(n) { return Math.max(0, Math.min(100, Number.isFinite(Number(n)) ? Number(n) : 0)); }
function setText(id, text) { const node = el(id); if (node && node.textContent !== String(text || "")) node.textContent = String(text || ""); }
function setBar(key, value) { state[key] = Math.max(state[key] || 0, clamp(value)); const node = el(BAR_IDS[key]); if (node) node.style.width = `${state[key].toFixed(0)}%`; }
function radial() { const node = doc()?.querySelector?.(".loading-radial-core"); if (node) node.style.setProperty("--load", `${Math.round(state.total)}%`); }
function addLog(text, force = false) { const now = Date.now(); if (!force && now - state.lastLogAt < 850) return; state.lastLogAt = now; state.log.push(`${new Date().toLocaleTimeString()}  ${text}`); state.log = state.log.slice(-4); const host = el(LABEL_IDS.log); if (host) host.textContent = state.log.join("\n"); }
function stageBase(stage = "") { const key = String(stage).split(":")[0]; return STAGE_BASE[key] ?? (stage.includes("texture") ? 12 : 6); }
function heartbeatTick() { const age = Date.now() - (state.lastAt || 0); if (age > 4200) update({ kind: "heartbeat", action: "Still loading...", subAction: `working ${Math.round(age / 1000)}s`, total: Math.min(99, (state.total || 0) + .6), forceLog: true }); }
export function startLoadingHeartbeat() { if (heartbeat || !doc()) return; heartbeat = setInterval(heartbeatTick, 2300); update({ kind: "boot", action: "Opening gates...", subAction: "preparing world", total: 5, forceLog: true }); }
export function stopLoadingHeartbeat() { if (heartbeat) clearInterval(heartbeat); heartbeat = null; }
export function update(input = {}) {
  if (!doc()) return; if (!heartbeat) startLoadingHeartbeat(); state.lastAt = Date.now();
  const stage = String(input.stage || input.action || input.kind || "progress"), total = input.total ?? input.amount ?? stageBase(stage);
  setBar("total", total); setBar("world", input.world ?? (stage.includes("postbuild") ? 92 : stage.includes("load") ? 70 : state.world));
  if (input.worker != null || input.stage) setBar("worker", input.worker ?? stageBase(stage)); if (input.texture != null || stage.includes("texture")) setBar("texture", input.texture ?? stageBase(stage));
  const now = Date.now(); if (now - state.lastDomAt > 180 || input.forceLog) { state.lastDomAt = now; setText(LABEL_IDS.percent, `${Math.round(state.total)}%`); setText(LABEL_IDS.action, input.action || titleFromStage(stage)); setText(LABEL_IDS.sub, input.subAction || input.label || input.name || stage); if (input.stage) setText(LABEL_IDS.worker, compact(stage)); if (input.textureLabel) setText(LABEL_IDS.texture, input.textureLabel); radial(); }
  addLog(input.log || input.subAction || input.stage || input.action || "progress", input.forceLog);
}
export function workerProgress(data = {}) { update({ stage: data.stage || data.text || "worker", action: "Building world...", subAction: data.stage || data.text || "worker", total: stageBase(data.stage || "worker"), worker: stageBase(data.stage || "worker") }); }
export function textureProgress(data = {}) { update({ stage: `texture:${data.stage || "progress"}`, action: "Textures...", subAction: data.type || data.url || data.stage || "texture", texture: data.percent ?? 35, total: Math.max(state.total, 10 + (data.percent || 20) * .25), textureLabel: `${data.stage || "texture"}: ${data.type || "procedural"}` }); }
export function hideLoading() { update({ action: "World ready", subAction: "revealing", total: 100, worker: 100, world: 100, texture: Math.max(state.texture, 100), forceLog: true }); setTimeout(stopLoadingHeartbeat, 600); }
function titleFromStage(stage) { if (stage.includes("texture")) return "Textures..."; if (stage.includes("postbuild")) return "Polishing village..."; if (stage.includes("load")) return "Manifesting..."; return "Drawing Down Light..."; }
function compact(stage) { return String(stage).replace(/-/g, " ").slice(0, 70); }
if (typeof window !== "undefined") { window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading }; window.addEventListener("awtsmoos-texture-progress", e => textureProgress(e.detail || {})); startLoadingHeartbeat(); }
export default { update, workerProgress, textureProgress, hideLoading, startLoadingHeartbeat, stopLoadingHeartbeat };
