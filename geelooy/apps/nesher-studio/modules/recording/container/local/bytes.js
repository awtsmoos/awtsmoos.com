/* B"H
 * Byte vessels for the local WebM forge: small, exact, and dependency-free.
 * The Awtsmoos speaks in bits; the Nesher gathers them without a remote bridge.
 */
export const u8 = (...values) => new Uint8Array(values);
export const ascii = text => Uint8Array.from([...text].map(ch => ch.charCodeAt(0)));
export const utf8 = text => new TextEncoder().encode(text);

export function concat(parts) {
  const arrays = parts.filter(Boolean).map(toU8), size = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(size); let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

export function uintBE(value, bytes = minBytes(value)) {
  let n = BigInt(value), out = new Uint8Array(bytes);
  for (let i = bytes - 1; i >= 0; i--) { out[i] = Number(n & 255n); n >>= 8n; }
  return out;
}

export function uintLE(value, bytes = minBytes(value)) {
  let n = BigInt(value), out = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) { out[i] = Number(n & 255n); n >>= 8n; }
  return out;
}

export function float64(value) {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setFloat64(0, Number(value), false);
  return out;
}

export function chunkBytes(chunk) {
  if (chunk instanceof Uint8Array) return chunk;
  if (chunk instanceof ArrayBuffer) return new Uint8Array(chunk);
  if (ArrayBuffer.isView(chunk)) return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  if (chunk?.data) return chunkBytes(chunk.data);
  if (chunk?.bytes) return chunkBytes(chunk.bytes);
  const out = new Uint8Array(Number(chunk?.byteLength || 0));
  if (typeof chunk?.copyTo === 'function') chunk.copyTo(out);
  return out;
}

export function exactBuffer(bytes) {
  const a = toU8(bytes);
  return a.buffer.slice(a.byteOffset, a.byteOffset + a.byteLength);
}

function toU8(value) { return value instanceof Uint8Array ? value : new Uint8Array(value); }
function minBytes(value) { let n = BigInt(value), bytes = 1; while (n > ((1n << BigInt(bytes * 8)) - 1n)) bytes++; return bytes; }
