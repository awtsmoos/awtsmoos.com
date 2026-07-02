// B"H
/** Tiny worker transport: loading messages are sanctified before postMessage. */
import { protocolMessage, WORKER_PROTOCOL_SEAL } from "./WorkerProtocolSanitizer.js";
const target = () => (typeof self !== "undefined" ? self : globalThis);
export function deliverWorkerProtocol(message) { target().postMessage?.(message); }
export function postWorkerProtocol(type, payload = {}) {
  const message = protocolMessage(type, payload);
  try { deliverWorkerProtocol(message); }
  catch (error) { console.error(`B"H | WORKER_PROTOCOL_ERROR | sanitized message failed | type=${type} | reason=${error?.message || String(error)}`); }
}
export function postWorkerProgress(stage, fields = {}) { postWorkerProtocol("worker_progress", { stage:String(stage), at:Date.now(), ...fields }); }
export function postWorkerError(text, isImportError = false) { postWorkerProtocol("ERROR", { isImportError, message:String(text), details:String(text), errorText:String(text) }); }
export const __AWTSMOOS_WORKER_PROTOCOL_SEAL__ = WORKER_PROTOCOL_SEAL;
