
/**
 * B"H
 * @file WorkerProgressWatchdog.js
 * @description
 * Warns when Worker progress stalls.
 */

import {
  ensureWorkerProgressStore,
  getWorkerProgressAge
} from "../progress/WorkerProgressStore.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Starts the progress watchdog.
 *
 * @param {Object} manager
 * Worker manager.
 *
 * @returns {void}
 */
export function startWorkerProgressWatchdog(manager) {
  const stallLimitMs = 60000;

  const check = () => {
    const store = ensureWorkerProgressStore();
    const age = getWorkerProgressAge();

    if (!manager._vesselIsReady && age > stallLimitMs) {
      console.error(
        [
          `B"H | WORKER_STALLED`,
          `lastStage=${store.lastStage}`,
          `ageMs=${age}`,
          `workerPath=${manager.workerPath}`,
          `hint=look at window.__AWTSMOOS_WORKER_PROGRESS__.history for exact last checkpoints`
        ].join(" | ")
      );

      store.lastAt = Date.now();
    }

    setTimeout(check, 4000);
  };

  setTimeout(check, stallLimitMs);
}
