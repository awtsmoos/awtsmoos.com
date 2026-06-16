// B"H
/**
 * @file LoadingProgressBridge.js
 * @description A truthful loading instrument: events move the bar, while the
 * heartbeat only proves that the page is alive. The final veil belongs to the
 * first rendered world frame, never to a hopeful timer.
 */
const IDS = Object.freeze({
  total: "genesisProgressBar", world: "genesisWorldBar",
  worker: "genesisWorkerBar", texture: "genesisTextureBar",
  action: "genesisActionText", sub: "genesisSubActionText",
  percent: "genesisPercentText", workerText: "genesisWorkerText",
  textureText: "genesisTextureText", log: "genesisProgressLog"
});
const STAGES = Object.freeze([
  ["entrypoint", 5], ["boot-runner", 10], ["angelic-invoker", 16],
  ["vessel_ready", 20], ["message:pawsawch", 24], ["soul-loader", 28],
  ["load-nivrayim:parse", 32], ["load-nivrayim:asset-size", 35],
  ["load-nivrayim:heescheel", 48], ["load-nivrayim:madeAll", 52],
  ["load-nivrayim:placeholder", 58], ["load-nivrayim:ready", 64],
  ["load-nivrayim:afterBriyah", 68], ["load-nivrayim:entry-runtime", 71],
  ["postbuild:regionStack", 74], ["postbuild:livingRegionRuntime", 77],
  ["postbuild:battleLayer", 80], ["postbuild:visualReality", 83],
  ["postbuild:botanicalReality", 86], ["postbuild:ecologyReality", 89],
  ["postbuild:landmarks", 91], ["postbuild:atmosphere", 92],
  ["postbuild:npcLife", 93], ["postbuild:interactionLayers", 94],
  ["postbuild:finalGrounding", 96], ["postbuild:treeRuntimeAudit", 97],
  ["postbuild:runtimeVisualAudit", 98], ["postbuild:ready-for-first-render", 99],
  ["canvas_transferred", 99], ["world_final_ready", 100]
]);
const state = { total: 0, world: 0, worker: 0, texture: 0, lastAt: 0, hidden: false, finalReady: false, log: [] };
let heartbeat = null, hideTimer = null;
const doc = () => typeof document === "undefined" ? null : document;
const byId = id => doc()?.getElementById(id) || null;
const clamp = value => Math.max(0, Math.min(100, Number(value) || 0));

/** @param {string} stage Runtime stage. @returns {number} Weighted completion. */
function stagePercent(stage = "") {
  const clean = String(stage);
  for (const [prefix, percent] of STAGES) if (clean.startsWith(prefix)) return percent;
  return state.total;
}

function text(id, value) { const node = byId(id); if (node && value != null) node.textContent = String(value); }
function bar(key, value) { state[key] = Math.max(state[key], clamp(value)); const node = byId(IDS[key]); if (node) node.style.width = `${state[key]}%`; }
function title(stage) {
  if (stage === "world_final_ready") return "World ready";
  if (stage.includes("finalGrounding")) return "Grounding every living form...";
  if (stage.includes("texture")) return "Preparing textures...";
  if (stage.includes("postbuild")) return "Building the finished zone...";
  if (stage.includes("load-nivrayim")) return "Creating the world...";
  return "Opening the world...";
}
function record(message) {
  if (!message || state.log.at(-1) === message) return;
  state.log.push(message); state.log = state.log.slice(-5);
  text(IDS.log, state.log.join("\n"));
}

/** @param {object} input Progress event. @returns {void} */
export function update(input = {}) {
  if (!doc() || state.hidden) return;
  const stage = String(input.stage || input.kind || "progress");
  state.lastAt = Date.now();
  if (stage === "world_final_ready") state.finalReady = true;
  const total = input.total ?? input.amount ?? stagePercent(stage);
  bar("total", state.finalReady ? total : Math.min(99, total));
  if (input.world != null || stage.includes("load") || stage.includes("postbuild")) bar("world", input.world ?? stagePercent(stage));
  if (input.worker != null || stage) bar("worker", input.worker ?? stagePercent(stage));
  if (input.texture != null) bar("texture", input.texture);
  text(IDS.percent, `${Math.round(state.total)}%`);
  text(IDS.action, input.action || title(stage));
  text(IDS.sub, input.subAction || input.label || stage.replace(/:/g, " "));
  text(IDS.workerText, stage.replace(/[-:]/g, " ").slice(0, 72));
  if (input.textureLabel) text(IDS.textureText, input.textureLabel);
  const radial = doc()?.querySelector?.(".loading-radial-core");
  radial?.style?.setProperty?.("--load", `${Math.round(state.total)}%`);
  record(input.log || input.subAction || stage);
  if (state.finalReady && input.hide !== false) scheduleHide(180);
}

/** @param {object} data Worker progress payload. */
export function workerProgress(data = {}) { const stage = String(data.stage || data.text || "worker"),isTexture=stage.includes("texture"); update({ stage, action: title(stage), subAction: data.label || stage, texture:isTexture?clamp(data.percent??(stage.endsWith(":done")?100:12)):undefined, textureLabel:isTexture?`${stage.replace(/:/g," ")} ${clamp(data.percent??(stage.endsWith(":done")?100:12))}%`:undefined }); }
/** @param {object} data Texture progress payload. */
export function textureProgress(data = {}) { const percent = clamp(data.percent); update({ stage: `texture:${data.stage || "progress"}`, texture: percent, textureLabel: `${data.type || data.kind || "texture"} ${percent}%` }); }
export function markFinalReady() { update({ stage: "world_final_ready", total: 100, world: 100, worker: 100, texture: 100, subAction: "first rendered frame confirmed", hide: true }); }
export function hideLoading() { record("Waiting for the first rendered frame..."); }
export function scheduleHide(ms = 180) { if (hideTimer || state.hidden || !state.finalReady) return; hideTimer = setTimeout(reallyHide, ms); }
function reallyHide() { if (!state.finalReady || state.hidden) return; state.hidden = true; stopLoadingHeartbeat(); doc()?.querySelectorAll?.(".loading,.loadingContent").forEach(node => { node.classList.add("hidden"); node.style.display = "none"; }); }
function heartbeatTick() {
  if (state.hidden) return;
  const shell = doc()?.querySelector?.(".loading");
  if (shell) shell.dataset.heartbeat = String(Math.floor(Date.now() / 1000) % 4);
}
export function startLoadingHeartbeat() { if (heartbeat || !doc()) return; heartbeat = setInterval(heartbeatTick, 1000); }
export function stopLoadingHeartbeat() { if (heartbeat) clearInterval(heartbeat); heartbeat = null; }
if (typeof window !== "undefined") { window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading, markFinalReady, seal:"zone-reality-20260614-bh817" }; window.addEventListener("awtsmoos-texture-progress", event => textureProgress(event.detail || {})); startLoadingHeartbeat(); }
export default { update, workerProgress, textureProgress, hideLoading, markFinalReady, scheduleHide, startLoadingHeartbeat, stopLoadingHeartbeat };
