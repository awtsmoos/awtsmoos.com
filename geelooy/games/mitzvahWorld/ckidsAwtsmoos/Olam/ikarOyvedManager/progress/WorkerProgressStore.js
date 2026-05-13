
/**
 * B"H
 * @file WorkerProgressStore.js
 * @description
 * Stores Worker progress on the main thread.
 */

/**
 * B"H
 * Ensures global progress state.
 *
 * @returns {{lastStage:string,lastAt:number,history:string[]}}
 * Progress store.
 */
export function ensureWorkerProgressStore() {
  if (!window.__AWTSMOOS_WORKER_PROGRESS__) {
    window.__AWTSMOOS_WORKER_PROGRESS__ = {
      lastStage: "not-started",
      lastAt: Date.now(),
      history: []
    };
  }

  return window.__AWTSMOOS_WORKER_PROGRESS__;
}

/**
 * B"H
 * Records progress.
 *
 * @param {string} stage
 * Stage.
 *
 * @returns {void}
 */
export function recordWorkerProgress(stage) {
  const store = ensureWorkerProgressStore();

  store.lastStage = stage;
  store.lastAt = Date.now();
  store.history.push(`${new Date().toISOString()} ${stage}`);

  if (store.history.length > 100) {
    store.history.shift();
  }
}

/**
 * B"H
 * Gets progress age.
 *
 * @returns {number}
 * Milliseconds since last progress.
 */
export function getWorkerProgressAge() {
  const store = ensureWorkerProgressStore();
  return Date.now() - store.lastAt;
}
