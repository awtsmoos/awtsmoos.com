import assert from 'node:assert/strict';
import { WORKER_MESSAGE, workerMessage, isWorkerMessage } from '../modules/recording/worker/workerMessages.js';
import { createWorkerRecordingState, markWorkerReady } from '../modules/recording/worker/workerState.js';
assert.equal(isWorkerMessage(workerMessage(WORKER_MESSAGE.INIT, {})), true);
assert.equal(markWorkerReady(createWorkerRecordingState()).ready, true);
console.log('B"H worker messages smoke passed');
