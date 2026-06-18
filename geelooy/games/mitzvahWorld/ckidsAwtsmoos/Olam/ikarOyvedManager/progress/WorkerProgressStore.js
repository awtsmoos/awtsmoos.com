// B"H
/**
 * @file WorkerProgressStore.js
 * @description Chapter 438: worker truth is preserved without drowning the
 * main thread. The report remains a lamp; it is no longer a boulder cloned on
 * every heartbeat.
 */
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?v=zone-reality-20260617-99-watchdog-bh";
const FINAL_STAGES = new Set(["world_final_ready", "loadedWorld", "canvas_transferred"]);
let pendingProgress = null, progressTimer = null;
function trimArray(value, max) { return Array.isArray(value) ? value.slice(-max) : []; }
function copyScalar(value) { return value == null || ["string", "number", "boolean"].includes(typeof value) ? value : undefined; }
function cloneLight(value, depth = 0) {
  const scalar = copyScalar(value); if (scalar !== undefined || value == null) return scalar ?? null;
  if (depth > 2) return "[DepthTrimmed]";
  if (Array.isArray(value)) return value.slice(0, 12).map(item => cloneLight(item, depth + 1));
  if (typeof value !== "object") return String(value).slice(0, 180);
  const out = {}; for (const key of Object.keys(value).slice(0, 24)) out[key] = cloneLight(value[key], depth + 1); return out;
}
function cloneWorldReport(report) {
  if (!report || typeof report !== "object") return null;
  const keep = ["at", "sceneChildren", "nivrayim", "trees", "buildings", "npcs", "npcCount", "octree", "combat", "postbuild", "starterStation", "schoolChecklist"];
  const out = {}; for (const key of keep) if (key in report) out[key] = cloneLight(report[key], 0); return out;
}
function clonePayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const worldReport = payload.worldReport || payload.payload?.workerWorldReport || payload.workerWorldReport || null;
  const out = cloneLight(payload, 0) || {};
  if (worldReport) out.worldReport = cloneWorldReport(worldReport);
  return out;
}
export function ensureWorkerProgressStore() {
  if (!window.__AWTSMOOS_WORKER_PROGRESS__) window.__AWTSMOOS_WORKER_PROGRESS__ = { lastStage:"not-started", lastAt:Date.now(), history:[], payloads:[], worldReports:[] };
  const store = window.__AWTSMOOS_WORKER_PROGRESS__;
  if (!Array.isArray(store.history)) store.history = [];
  if (!Array.isArray(store.payloads)) store.payloads = [];
  if (!Array.isArray(store.worldReports)) store.worldReports = [];
  window.__AWTSMOOS_WORKER_PROGRESS_PAYLOADS__ = store.payloads;
  window.__AWTSMOOS_WORLD_REPORT_HISTORY__ = store.worldReports;
  window.__AWTSMOOS_WORLD_REPORT__ = () => window.__AWTSMOOS_LAST_WORLD_REPORT__ || null;
  window.__AWTSMOOS_WORLD_REPORTS__ = () => window.__AWTSMOOS_WORLD_REPORT_HISTORY__ || [];
  return store;
}
function publishWorldReport(store, payload) {
  const report = payload?.worldReport || payload?.payload?.workerWorldReport || payload?.workerWorldReport || null;
  if (!report) return null;
  const cleanReport = cloneWorldReport(report) || report;
  const entry = { at:Date.now(), report:cleanReport };
  store.worldReports = trimArray([...(store.worldReports || []), entry], 24);
  window.__AWTSMOOS_LAST_WORLD_REPORT__ = cleanReport;
  window.__AWTSMOOS_WORKER_WORLD_REPORT__ = cleanReport;
  window.__AWTSMOOS_WORLD_REPORT_HISTORY__ = store.worldReports;
  window.dispatchEvent?.(new CustomEvent("awtsmoos-worker-world-report", { detail:cleanReport }));
  return cleanReport;
}
function flushProgress() { progressTimer = null; const next = pendingProgress; pendingProgress = null; if (next) LoadingProgress.workerProgress(next); }
function queueProgress(stage, payload) {
  const data = { ...(payload || {}), stage, at:Date.now() };
  if (FINAL_STAGES.has(stage) || stage.includes("ready-for-first-render")) { pendingProgress = null; if (progressTimer) clearTimeout(progressTimer); progressTimer = null; LoadingProgress.workerProgress(data); return; }
  pendingProgress = data; if (!progressTimer) progressTimer = setTimeout(flushProgress, 80);
}
export function recordWorkerProgress(stage, payload = null) {
  const store = ensureWorkerProgressStore(), at = Date.now(), cleanPayload = clonePayload(payload);
  store.lastStage = String(stage || payload?.stage || "unknown"); store.lastAt = at; store.lastPayload = cleanPayload;
  store.history = trimArray([...(store.history || []), `${new Date(at).toISOString()} ${store.lastStage}`], 120);
  store.payloads = trimArray([...(store.payloads || []), { at, stage:store.lastStage, payload:cleanPayload }], 40);
  window.__AWTSMOOS_WORKER_PROGRESS_PAYLOADS__ = store.payloads;
  publishWorldReport(store, payload || cleanPayload);
  queueProgress(store.lastStage, cleanPayload || payload || {});
  return store;
}
export function getWorkerProgressAge() { const store = ensureWorkerProgressStore(); return Date.now() - store.lastAt; }
