// B"H
/**
 * @file WorkerProgressStore.js
 * @description
 * Chapter 434: every worker breath reaches the visible veil.
 */
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?v=zone-reality-20260614-bh817";
export function ensureWorkerProgressStore() {
  if (!window.__AWTSMOOS_WORKER_PROGRESS__) window.__AWTSMOOS_WORKER_PROGRESS__ = { lastStage: "not-started", lastAt: Date.now(), history: [] };
  return window.__AWTSMOOS_WORKER_PROGRESS__;
}
export function recordWorkerProgress(stage) {
  const store = ensureWorkerProgressStore();
  store.lastStage = String(stage || "unknown");
  store.lastAt = Date.now();
  store.history.push(`${new Date().toISOString()} ${store.lastStage}`);
  if (store.history.length > 160) store.history.shift();
  LoadingProgress.workerProgress({ stage: store.lastStage, at: store.lastAt });
}
export function getWorkerProgressAge() { const store = ensureWorkerProgressStore(); return Date.now() - store.lastAt; }
