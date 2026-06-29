/* B"H
Worker client: optional acceleration stays behind a tiny adapter, never breaking main-thread encode.
*/
import { WORKER_MESSAGE, workerMessage } from './workerMessages.js';
export function createRecordingWorkerClient(worker) {
  const listeners = new Set();
  worker?.addEventListener?.('message', event => listeners.forEach(fn => fn(event.data)));
  return { post:(type,payload={}) => worker?.postMessage?.(workerMessage(type,payload)), onMessage:fn => (listeners.add(fn), () => listeners.delete(fn)), init:payload => worker?.postMessage?.(workerMessage(WORKER_MESSAGE.INIT,payload)), stop:() => worker?.postMessage?.(workerMessage(WORKER_MESSAGE.STOP)) };
}
