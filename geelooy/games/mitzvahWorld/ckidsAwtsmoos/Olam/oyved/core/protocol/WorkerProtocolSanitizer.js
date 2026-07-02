// B"H
/** Clone-safe reductions for loading: no function crosses the sea. */
export const WORKER_PROTOCOL_SEAL = "split-sanitized-worker-protocol-20260702-bh2";
const MAX_DEPTH = 5, MAX_ARRAY = 80, MAX_KEYS = 80;
const primitive = v => v === null || ["string", "number", "boolean", "undefined"].includes(typeof v);
const num = v => Number.isFinite(Number(v)) ? Number(v) : 0;
const fn = f => `[Function ${f?.name || "anonymous"}]`;
const err = e => ({ name:e?.name || "Error", message:e?.message || String(e), stack:String(e?.stack || "").split("\n").slice(0, 5).join(" | ") });
const bin = v => ({ type:v?.constructor?.name || "Binary", byteLength:v?.byteLength ?? v?.length ?? 0 });
const vec = v => ({ x:num(v.x), y:num(v.y), z:num(v.z), w:v.w == null ? undefined : num(v.w) });
const three = v => ({ type:v.type || v.constructor?.name || "ThreeObject", name:v.name || "", uuid:v.uuid || "", position:v.position ? vec(v.position) : undefined });
const bitmap = v => ({ type:"ImageBitmap", width:num(v?.width), height:num(v?.height), omitted:"not posted through progress protocol" });
const vectorish = v => v && ["x", "y", "z"].every(k => typeof v[k] === "number") && Object.keys(v).length <= 8;
export function safeClone(value, depth = 0, seen = new WeakSet()) {
  if (primitive(value)) return value; if (typeof value === "bigint") return Number(value); if (typeof value === "symbol") return String(value); if (typeof value === "function") return fn(value); if (value instanceof Error) return err(value);
  if (typeof ImageBitmap !== "undefined" && value instanceof ImageBitmap) return bitmap(value); if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return bin(value); if (value?.isObject3D || value?.isMesh || value?.isMaterial || value?.isTexture || value?.isBufferGeometry || value?.isEuler || value?.isQuaternion) return three(value);
  if (vectorish(value)) return vec(value); if (value instanceof Date) return value.toISOString(); if (typeof value !== "object") return String(value); if (seen.has(value)) return "[Circular]"; if (depth >= MAX_DEPTH) return `[MaxDepth ${value.constructor?.name || "Object"}]`;
  seen.add(value); if (Array.isArray(value)) return value.slice(0, MAX_ARRAY).map(item => safeClone(item, depth + 1, seen)); const out = {}, keys = Object.keys(value);
  for (let i = 0; i < Math.min(keys.length, MAX_KEYS); i++) out[keys[i]] = safeClone(value[keys[i]], depth + 1, seen); if (keys.length > MAX_KEYS) out.__truncatedKeys = keys.length - MAX_KEYS; return out;
}
export function protocolMessage(type, payload = {}) { const safe = safeClone(payload); const body = safe && typeof safe === "object" && !Array.isArray(safe) ? safe : { value:safe }; return { ...body, type, sanitized:true, protocolSeal:WORKER_PROTOCOL_SEAL }; }
