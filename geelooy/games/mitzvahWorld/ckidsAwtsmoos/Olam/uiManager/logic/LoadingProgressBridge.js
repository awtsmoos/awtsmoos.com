// B"H
/**
 * @file LoadingProgressBridge.js
 * @description
 * Chapter 430: the loading veil refuses silence.
 * The Awtsmoos gives the player four visible rivers: total creation, world boot,
 * worker breath, and texture forging. A heartbeat writes every few seconds so no
 * phone screen appears frozen while vessels are still being drawn from nothing.
 */
const BAR_IDS = {
  total: "genesisProgressBar",
  world: "genesisWorldBar",
  worker: "genesisWorkerBar",
  texture: "genesisTextureBar"
};
const LABEL_IDS = {
  action: "genesisActionText",
  sub: "genesisSubActionText",
  percent: "genesisPercentText",
  worker: "genesisWorkerText",
  texture: "genesisTextureText",
  log: "genesisProgressLog"
};
const STAGE_BASE = {
  entrypoint: 8,
  "boot-runner": 15,
  "angelic-invoker": 24,
  message: 34,
  pawsawch: 45,
  "soul-loader": 58,
  "load-nivrayim": 68,
  lifecycle: 78,
  postbuild: 88,
  loadedWorld: 94,
  canvas_transferred: 98,
  texture: 12
};
let state = { total: 0, world: 0, worker: 0, texture: 0, lastAt: 0, log: [] };
let heartbeat = null;
const doc = () => (typeof document === "undefined" ? null : document);
const el = id => doc()?.getElementById(id) || null;
function clamp(n) { return Math.max(0, Math.min(100, Number.isFinite(Number(n)) ? Number(n) : 0)); }
function setText(id, text) { const node = el(id); if (node) node.textContent = String(text || ""); }
function setBar(key, value) { state[key] = Math.max(state[key] || 0, clamp(value)); const node = el(BAR_IDS[key]); if (node) node.style.width = `${state[key].toFixed(1)}%`; }
function radial() { const node = doc()?.querySelector?.(".loading-radial-core"); if (node) node.style.setProperty("--load", `${Math.round(state.total)}%`); }
function addLog(text) { const msg = `${new Date().toLocaleTimeString()}  ${text}`; state.log.push(msg); state.log = state.log.slice(-7); const host = el(LABEL_IDS.log); if (host) host.innerHTML = state.log.map(line => `<div>${escapeHtml(line)}</div>`).join(""); }
function escapeHtml(s) { return String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function stageBase(stage = "") { const key = String(stage).split(":")[0]; return STAGE_BASE[key] ?? (stage.includes("texture") ? 12 : 6); }
function heartbeatTick() { if (!doc()) return; const age = Date.now() - (state.lastAt || 0); if (age > 4500) update({ kind: "heartbeat", action: "Still drawing vessels...", subAction: `No silence: last signal ${Math.round(age / 1000)}s ago`, total: Math.min(99, (state.total || 0) + 0.35) }); }
export function startLoadingHeartbeat() { if (heartbeat || !doc()) return; heartbeat = setInterval(heartbeatTick, 2500); update({ kind: "boot", action: "Opening the gates...", subAction: "Preparing world vessels", total: 3 }); }
export function stopLoadingHeartbeat() { if (heartbeat) clearInterval(heartbeat); heartbeat = null; }
export function update(input = {}) {
  if (!doc()) return;
  startLoadingHeartbeat();
  state.lastAt = Date.now();
  const stage = String(input.stage || input.action || input.kind || "progress");
  const total = input.total ?? input.amount ?? stageBase(stage);
  setBar("total", total);
  setBar("world", input.world ?? (stage.includes("postbuild") ? 92 : stage.includes("load") ? 70 : state.world));
  if (input.worker != null || input.stage) setBar("worker", input.worker ?? stageBase(stage));
  if (input.texture != null || stage.includes("texture")) setBar("texture", input.texture ?? stageBase(stage));
  setText(LABEL_IDS.percent, `${Math.round(state.total)}%`);
  setText(LABEL_IDS.action, input.action || titleFromStage(stage));
  setText(LABEL_IDS.sub, input.subAction || input.label || input.name || stage);
  if (input.stage) setText(LABEL_IDS.worker, compact(stage));
  if (input.textureLabel) setText(LABEL_IDS.texture, input.textureLabel);
  radial(); addLog(input.log || input.subAction || input.stage || input.action || "progress");
}
export function workerProgress(data = {}) { update({ stage: data.stage || data.text || "worker", action: "Worker is building the world...", subAction: data.stage || data.text || "worker progress", total: stageBase(data.stage || "worker"), worker: stageBase(data.stage || "worker") }); }
export function textureProgress(data = {}) { update({ stage: `texture:${data.stage || "progress"}`, action: "Generating and caching textures...", subAction: data.type || data.url || data.stage || "texture", texture: data.percent ?? 35, total: Math.max(state.total, 10 + (data.percent || 20) * .3), textureLabel: `${data.stage || "texture"}: ${data.type || "procedural"}` }); }
export function hideLoading() { update({ action: "World ready", subAction: "Revealing the village", total: 100, worker: 100, world: 100, texture: Math.max(state.texture, 100) }); setTimeout(stopLoadingHeartbeat, 900); }
function titleFromStage(stage) { if (stage.includes("texture")) return "Forging textures..."; if (stage.includes("postbuild")) return "Polishing the village..."; if (stage.includes("load")) return "Manifesting vessels..."; return "Drawing Down the Infinite Light..."; }
function compact(stage) { return String(stage).replace(/-/g, " ").slice(0, 80); }
if (typeof window !== "undefined") { window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading }; window.addEventListener("awtsmoos-texture-progress", e => textureProgress(e.detail || {})); startLoadingHeartbeat(); }
export default { update, workerProgress, textureProgress, hideLoading, startLoadingHeartbeat, stopLoadingHeartbeat };
