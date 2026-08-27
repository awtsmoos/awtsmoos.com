/* B"H
Recording worker shell: importable browser worker entry for future off-main-thread encoding.
*/
import { WORKER_MESSAGE, workerMessage } from './workerMessages.js';
import { createWorkerRecordingState, markWorkerReady, markWorkerStopping } from './workerState.js';
let state = createWorkerRecordingState();
self.onmessage = event => {
  const message = event.data || {};
  if (message.type === WORKER_MESSAGE.INIT) { state = markWorkerReady(createWorkerRecordingState(message.payload)); self.postMessage(workerMessage(WORKER_MESSAGE.STATUS, { ready:true })); }
  if (message.type === WORKER_MESSAGE.STOP) { markWorkerStopping(state); self.postMessage(workerMessage(WORKER_MESSAGE.COMPLETE, { telemetry:state.telemetry })); }
};
