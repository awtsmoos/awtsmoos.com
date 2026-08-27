/* B"H
Worker messages: main thread and encoder worker speak one small stable language.
*/
export const WORKER_MESSAGE = Object.freeze({ INIT:'init', FRAME:'frame', AUDIO:'audio', STOP:'stop', STATUS:'status', ERROR:'error', COMPLETE:'complete' });
export function workerMessage(type, payload = {}) { return { type, payload, id:`msg-${Date.now()}-${Math.random().toString(36).slice(2)}` }; }
export function isWorkerMessage(message) { return !!message && typeof message.type === 'string' && 'payload' in message; }
