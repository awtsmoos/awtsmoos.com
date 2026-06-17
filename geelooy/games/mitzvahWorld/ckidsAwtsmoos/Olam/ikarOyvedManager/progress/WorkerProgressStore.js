// B"H
/**
 * @file WorkerProgressStore.js
 * @description Chapter 436: world reports now have their own ark and are not drowned by ordinary UI breath.
 */
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?v=zone-reality-20260614-bh817";
function trimArray(value, max) { return Array.isArray(value) ? value.slice(-max) : []; }
function clonePayload(payload) { if (!payload || typeof payload !== "object") return null; try { return JSON.parse(JSON.stringify(payload)); } catch { return { uncloneable: true, stage: payload.stage || null }; } }
export function ensureWorkerProgressStore() {
  if (!window.__AWTSMOOS_WORKER_PROGRESS__) window.__AWTSMOOS_WORKER_PROGRESS__ = { lastStage: "not-started", lastAt: Date.now(), history: [], payloads: [], worldReports: [] };
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
  const entry = { at: Date.now(), report };
  store.worldReports = trimArray([...(store.worldReports || []), entry], 24);
  window.__AWTSMOOS_LAST_WORLD_REPORT__ = report;
  window.__AWTSMOOS_WORKER_WORLD_REPORT__ = report;
  window.__AWTSMOOS_WORLD_REPORT_HISTORY__ = store.worldReports;
  window.dispatchEvent?.(new CustomEvent("awtsmoos-worker-world-report", { detail: report }));
  return report;
}
export function recordWorkerProgress(stage, payload = null) {
  const store = ensureWorkerProgressStore();
  const at = Date.now();
  const cleanPayload = clonePayload(payload);
  store.lastStage = String(stage || payload?.stage || "unknown");
  store.lastAt = at;
  store.lastPayload = cleanPayload;
  store.history.push(`${new Date(at).toISOString()} ${store.lastStage}`);
  store.payloads.push({ at, stage: store.lastStage, payload: cleanPayload });
  store.history = trimArray(store.history, 180);
  store.payloads = trimArray(store.payloads, 80);
  window.__AWTSMOOS_WORKER_PROGRESS_PAYLOADS__ = store.payloads;
  publishWorldReport(store, cleanPayload || payload);
  LoadingProgress.workerProgress({ ...(cleanPayload || {}), stage: store.lastStage, at });
  return store;
}
export function getWorkerProgressAge() { const store = ensureWorkerProgressStore(); return Date.now() - store.lastAt; }
