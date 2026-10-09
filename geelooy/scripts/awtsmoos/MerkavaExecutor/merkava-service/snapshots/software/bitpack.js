// B"H
/**
 * @file bitpack.js
 * @description
 * Bit-level utilities for Merkava's "is every bit used?" mandate.
 * Zero-dependency helpers for packing data tighter than naive JS objects.
 *
 * Every function here exists to eliminate wasted bytes:
 * - Bitfields: 8 booleans in 1 byte, not 8 bytes
 * - Varints: small numbers in 1 byte, not 8
 * - Interning: one copy of each repeated string, not N copies
 * - Pooling: reuse objects, don't allocate in hot paths
 */

/* ------------------------------------------------------------------ */
/* Bitfields: pack up to 32 boolean flags into a single Uint32.        */
/* ------------------------------------------------------------------ */

/** Create a bitfield with named flags. Returns {get, set, clear, toggle, value}. */
export function makeBitfield() {
  let bits = 0;
  return {
    get(i) { return (bits >>> i) & 1; },
    set(i) { bits |= (1 << i); },
    clear(i) { bits &= ~(1 << i); },
    toggle(i) { bits ^= (1 << i); },
    get value() { return bits >>> 0; },
    set value(v) { bits = v >>> 0; },
  };
}

/** Pack an array of booleans into a single number. */
export function packFlags(flags) {
  let bits = 0;
  for (let i = 0; i < flags.length && i < 32; i++) {
    if (flags[i]) bits |= (1 << i);
  }
  return bits >>> 0;
}

/** Unpack a number into an array of booleans. */
export function unpackFlags(bits, count) {
  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = ((bits >>> i) & 1) === 1;
  return out;
}

/* ------------------------------------------------------------------ */
/* Varints: variable-length integer encoding. Small numbers = 1 byte.  */
/* ------------------------------------------------------------------ */

/** Encode a non-negative int as varint bytes. Returns Uint8Array. */
export function encodeVarint(n) {
  n = Math.floor(Math.abs(n));
  const out = [];
  do {
    let b = n & 0x7f;
    n >>>= 7;
    if (n) b |= 0x80;
    out.push(b);
  } while (n);
  return Uint8Array.from(out);
}

/** Decode varint from bytes at offset. Returns {value, bytesRead}. */
export function decodeVarint(bytes, offset = 0) {
  let value = 0, shift = 0, i = offset;
  while (i < bytes.length) {
    const b = bytes[i++];
    value |= (b & 0x7f) << shift;
    if (!(b & 0x80)) break;
    shift += 7;
  }
  return { value, bytesRead: i - offset };
}

/* ------------------------------------------------------------------ */
/* String interning: one copy of each string, not N.                   */
/* ------------------------------------------------------------------ */

/**
 * Create a string interner. intern(str) returns a canonical reference.
 * Repeated strings share the same reference (saves memory, speeds ===).
 */
export function makeInterner() {
  const pool = new Map();
  return {
    intern(s) {
      s = String(s);
      let v = pool.get(s);
      if (v === undefined) { pool.set(s, s); return s; }
      return v;
    },
    size() { return pool.size; },
    clear() { pool.clear(); },
  };
}

// Global tag name interner (HTML has ~100 unique tags, not thousands).
export const tagInterner = makeInterner();

/* ------------------------------------------------------------------ */
/* Object pooling: reuse, don't allocate in hot paths.                 */
/* ------------------------------------------------------------------ */

/**
 * Create an object pool. acquire() gets a reusable object, release() returns it.
 * Reduces GC pressure in hot paths (layout, paint, VM).
 */
export function makePool(factory, reset, maxSize = 100) {
  const pool = [];
  return {
    acquire() {
      return pool.length ? pool.pop() : factory();
    },
    release(obj) {
      if (pool.length < maxSize) {
        if (reset) reset(obj);
        pool.push(obj);
      }
    },
    size() { return pool.length; },
    clear() { pool.length = 0; },
  };
}

/* ------------------------------------------------------------------ */
/* Compact pairs: two 16-bit ints in one 32-bit number.                */
/* ------------------------------------------------------------------ */

/** Pack two 16-bit unsigned ints into one 32-bit number. */
export function pack16(a, b) {
  return (((a & 0xffff) << 16) | (b & 0xffff)) >>> 0;
}

export const unpack16hi = (p) => (p >>> 16) & 0xffff;
export const unpack16lo = (p) => p & 0xffff;

/** Pack two 16-bit signed ints into one 32-bit number. */
export function pack16s(a, b) {
  return ((((a & 0xffff) << 16) | (b & 0xffff)) >>> 0);
}

export const unpack16shi = (p) => {
  const v = (p >>> 16) & 0xffff;
  return v >= 0x8000 ? v - 0x10000 : v;
};
export const unpack16slo = (p) => {
  const v = p & 0xffff;
  return v >= 0x8000 ? v - 0x10000 : v;
}

/* ------------------------------------------------------------------ */
/* Float quantization: store pixel coordinates as integers when safe.  */
/* ------------------------------------------------------------------ */

/**
 * Quantize a float to 1/64 precision in a 32-bit int.
 * For layout coordinates: 1/64px precision is visually lossless,
 * but stores as int32 (4B) instead of float64 (8B).
 */
export function quantize(f) { return Math.round(f * 64); }
export function dequantize(q) { return q / 64; }
