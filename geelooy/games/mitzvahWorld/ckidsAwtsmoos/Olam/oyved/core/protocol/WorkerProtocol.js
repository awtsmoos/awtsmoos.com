// B"H
/** @file WorkerProtocol.js @description Always-clone-safe worker messages; no raw payload may pierce the veil. */
const MAX_DEPTH = 5;
const MAX_ARRAY = 80;
const MAX_KEYS = 80;
const SEAL = "always-sanitized-worker-protocol-20260702-bh1";
const isPrimitive = value => value === null || ["string", "number", "boolean", "undefined"].includes(typeof value);
const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
function compactFunction(fn) { return `[Function ${fn?.name || "anonymous"}]`; }
function compactError(error) { return { name:error?.name || "Error", message:error?.message || String(error), stack:String(error?.stack || "").split("\n").slice(0, 5).join(" | ") }; }
function compactBinary(value) { return { type:value?.constructor?.name || "Binary", byteLength:value?.byteLength ?? value?.length ?? 0 }; }
function compactVec(value) { return { x:num(value.x), y:num(value.y), z:num(value.z), w:value.w == null ? undefined : num(value.w) }; }
function compactThree(value) {
  return { type:value.type || value.constructor?.name || "ThreeObject", name:value.name || "", uuid:value.uuid || "", position:value.position ? compactVec(value.position) : undefined };
}
function compactBitmap(value) { return { type:"ImageBitmap", width:num(value?.width), height:num(value?.height), omitted:"not posted through progress protocol" }; }
function looksVectorish(value) { return value && ["x", "y", "z"].every(key => typeof value[key] === "number") && Object.keys(value).length <= 8; }
function safeClone(value, depth = 0, seen = new WeakSet()) {
  if (isPrimitive(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "symbol") return String(value);
  if (typeof value === "function") return compactFunction(value);
  if (value instanceof Error) return compactError(value);
  if (typeof ImageBitmap !== "undefined" && value instanceof ImageBitmap) return compactBitmap(value);
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return compactBinary(value);
  if (value && (value.isObject3D || value.isMesh || value.isMaterial || value.isTexture || value.isBufferGeometry || value.isEuler || value.isQuaternion)) return compactThree(value);
  if (looksVectorish(value)) return compactVec(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return String(value);
  if (seen.has(value)) return "[Circular]";
  if (depth >= MAX_DEPTH) return `[MaxDepth ${value.constructor?.name || "Object"}]`;
  seen.add(value);
  if (Array.isArray(value)) return value.slice(0, MAX_ARRAY).map(item => safeClone(item, depth + 1, seen));
  const out = {};
  const keys = Object.keys(value);
  for (let i = 0; i < Math.min(keys.length, MAX_KEYS); i++) out[keys[i]] = safeClone(value[keys[i]], depth + 1, seen);
  if (keys.length > MAX_KEYS) out.__truncatedKeys = keys.length - MAX_KEYS;
  return out;
}
function deliver(message) { (typeof self !== "undefined" ? self : globalThis).postMessage?.(message); }
export function postWorkerProtocol(type, payload = {}) {
  const safe = safeClone(payload);
  const message = { ...(safe && typeof safe === "object" && !Array.isArray(safe) ? safe : { value:safe }), type, sanitized:true, protocolSeal:SEAL };
  try { deliver(message); }
  catch (error) { console.error(`B"H | WORKER_PROTOCOL_ERROR | sanitized message failed | type=${type} | reason=${error?.message || String(error)}`); }
}
export function postWorkerProgress(stage, fields = {}) { postWorkerProtocol("worker_progress", { stage:String(stage), at:Date.now(), ...fields }); }
export function postWorkerError(text, isImportError = false) { postWorkerProtocol("ERROR", { isImportError, message:String(text), details:String(text), errorText:String(text) }); }
export const __AWTSMOOS_WORKER_PROTOCOL_SEAL__ = SEAL;
