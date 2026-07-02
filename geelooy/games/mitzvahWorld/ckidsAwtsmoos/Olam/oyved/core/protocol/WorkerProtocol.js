// B"H
/** @file WorkerProtocol.js @description Clone-safe worker protocol messages. */
const MAX_DEPTH = 5;
const MAX_ARRAY = 80;
const MAX_KEYS = 80;
function primitive(value) { return value === null || ["string", "number", "boolean", "undefined"].includes(typeof value); }
function compactFunction(fn) { return `[Function ${fn?.name || "anonymous"}]`; }
function compactError(error) { return { name:error?.name || "Error", message:error?.message || String(error), stack:String(error?.stack || "").split("\n").slice(0, 5).join(" | ") }; }
function compactBinary(value) { return { type:value?.constructor?.name || "Binary", byteLength:value?.byteLength ?? value?.length ?? 0 }; }
function compactThree(value) { return { type:value.type || value.constructor?.name || "Object3D", name:value.name || null, uuid:value.uuid || null, position:value.position ? { x:Number(value.position.x), y:Number(value.position.y), z:Number(value.position.z) } : undefined }; }
function compactBitmap(value) { return { type:"ImageBitmap", width:Number(value?.width || 0), height:Number(value?.height || 0), omitted:"not clone-safe after transfer/close" }; }
function safeClone(value, depth = 0, seen = new WeakSet()) {
  if (primitive(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "symbol") return String(value);
  if (typeof value === "function") return compactFunction(value);
  if (value instanceof Error) return compactError(value);
  if (typeof ImageBitmap !== "undefined" && value instanceof ImageBitmap) return compactBitmap(value);
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return compactBinary(value);
  if (value && (value.isObject3D || value.isMesh || value.isMaterial || value.isTexture || value.isBufferGeometry)) return compactThree(value);
  if (typeof value !== "object") return String(value);
  if (seen.has(value)) return "[Circular]";
  if (depth >= MAX_DEPTH) return `[MaxDepth ${value.constructor?.name || "Object"}]`;
  seen.add(value);
  if (Array.isArray(value)) return value.slice(0, MAX_ARRAY).map(item => safeClone(item, depth + 1, seen));
  const out = {};
  let count = 0;
  for (const key of Object.keys(value)) { if (count++ >= MAX_KEYS) { out.__truncatedKeys = Object.keys(value).length - MAX_KEYS; break; } out[key] = safeClone(value[key], depth + 1, seen); }
  return out;
}
function deliver(message) { const target = typeof self !== "undefined" ? self : globalThis; target.postMessage?.(message); }
export function postWorkerProtocol(type, payload = {}) {
  const message = { type, ...payload };
  try { deliver(message); }
  catch (error) {
    const reason = error?.message || String(error);
    try { deliver({ type, ...safeClone(payload), sanitized:true, originalPostError:reason }); }
    catch (again) { console.error(`B"H | WORKER_PROTOCOL_ERROR | failed sanitized protocol message | type=${type} | reason=${again?.message || String(again)} | original=${reason}`); }
  }
}
export function postWorkerProgress(stage, fields = {}) { postWorkerProtocol("worker_progress", { stage:String(stage), at:Date.now(), ...fields }); }
export function postWorkerError(text, isImportError = false) { postWorkerProtocol("ERROR", { isImportError, message:String(text), details:String(text), errorText:String(text) }); }
export const __AWTSMOOS_WORKER_PROTOCOL_SEAL__ = "clone-safe-worker-protocol-20260701-bh10";
