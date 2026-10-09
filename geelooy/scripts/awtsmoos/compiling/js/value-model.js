// B"H
// value-model.js — Merkava native tier v2: tagged value + heap object model.
//
// SINGLE SOURCE OF TRUTH. Every stream (codegen, GC, runtime, harness)
// imports tag constants, header layouts, and these encode/decode helpers
// from this file. The authoritative prose spec is OBJECT_MODEL.md next to it.
//
// All 64-bit values are BigInt here (JS Numbers cannot hold u64 exactly).

export const MASK64 = (1n << 64n) - 1n;
export const asU64 = (v) => BigInt(v) & MASK64;
export const asI64 = (v) => { const u = asU64(v); return (u & (1n << 63n)) ? u - (1n << 64n) : u; };

// ---------------------------------------------------------------------------
// Tags: low 3 bits of every 64-bit value.
// ---------------------------------------------------------------------------
export const TAG_FIXNUM   = 0n; // 000 signed 61-bit int, value = raw >> 3 (arith)
export const TAG_HEAPREF  = 1n; // 001 heap pointer | 1, ptr 8-aligned (16 in practice)
export const TAG_DOUBLE   = 2n; // 010 heap pointer | 2 -> boxed double (no header read needed)
export const TAG_SMALLSTR = 3n; // 011 small string: <=3 UTF-16 units inline
export const TAG_IMM      = 4n; // 100 immediate singleton: (code << 3) | 4
export const TAG_R5       = 5n; // 101 reserved (symbol / bigint)
export const TAG_R6       = 6n; // 110 reserved (packed SIMD)
export const TAG_R7       = 7n; // 111 reserved
export const TAG_MASK     = 7n;
export const tagOf = (v) => asU64(v) & TAG_MASK;

// ---------------------------------------------------------------------------
// Fixnums: signed 61-bit. Range +/- (2^60 - 1).
// ---------------------------------------------------------------------------
export const FIXNUM_BITS = 61n;
export const FIXNUM_MAX = (1n << 60n) - 1n;
export const FIXNUM_MIN = -(1n << 60n);

export function fixnum(n) {
  const b = BigInt(n);
  if (b < FIXNUM_MIN || b > FIXNUM_MAX) throw new RangeError(`fixnum out of range: ${n}`);
  return asU64(b << 3n);
}
export const isFixnum = (v) => tagOf(v) === TAG_FIXNUM;
// Arithmetic shift right by 3 over 64 bits (sign-extends).
export function fixnumValue(v) {
  const u = asU64(v);
  const shifted = u >> 3n;
  return (u & (1n << 63n)) ? shifted - (1n << 61n) : shifted;
}

// ---------------------------------------------------------------------------
// Immediates: tag 100, payload = 61-bit code.
// ---------------------------------------------------------------------------
export const IMM_UNDEFINED = 0n;
export const IMM_NULL      = 1n;
export const IMM_TRUE      = 2n;
export const IMM_FALSE     = 3n;
export const IMM_NAN       = 4n; // canonical NaN: no allocation on the cold path
export const IMM_HOLE      = 5n; // array hole (internal; never leaks to user code)

export const imm = (code) => asU64((BigInt(code) << 3n) | TAG_IMM);
export const isImm = (v) => tagOf(v) === TAG_IMM;
export const immCode = (v) => asU64(v) >> 3n;

export const V_UNDEFINED = imm(IMM_UNDEFINED);
export const V_NULL      = imm(IMM_NULL);
export const V_TRUE      = imm(IMM_TRUE);
export const V_FALSE      = imm(IMM_FALSE);
export const V_NAN       = imm(IMM_NAN);
export const V_HOLE      = imm(IMM_HOLE);

// ---------------------------------------------------------------------------
// Heap references: tag 001. Pointers are 8-aligned minimum, 16-aligned by the
// allocator (header is 16 bytes, payloads are multiples of 8).
// ---------------------------------------------------------------------------
export function heapref(ptr) {
  const p = asU64(ptr);
  if ((p & 7n) !== 0n) throw new RangeError(`heapref ptr not 8-aligned: 0x${p.toString(16)}`);
  return p | TAG_HEAPREF;
}
export const isHeapref = (v) => tagOf(v) === TAG_HEAPREF;
export const heapPtr = (v) => asU64(v) & ~TAG_MASK;

// Boxed double: tag 010 -> header type TYPE_DOUBLE, 8-byte IEEE754 at +16.
export function doubleref(ptr) {
  const p = asU64(ptr);
  if ((p & 7n) !== 0n) throw new RangeError(`doubleref ptr not 8-aligned: 0x${p.toString(16)}`);
  return p | TAG_DOUBLE;
}
export const isDouble = (v) => tagOf(v) === TAG_DOUBLE;

// ---------------------------------------------------------------------------
// Small strings (SSO): tag 011.
//   bits 0..2  = 0b011
//   bits 3..4  = length in UTF-16 code units (0..3)
//   bits 5..52 = up to 3 UTF-16 units, little-endian (unit 0 in bits 5..20)
//   bits 53..63= reserved 0
// Empty string is SSO length 0. Surrogate halves count as one unit each
// (exact JS semantics: '\u{1F600}'.length === 2).
// ---------------------------------------------------------------------------
export const SSO_MAX_UNITS = 3;

export function smallString(s) {
  if (typeof s !== "string") throw new TypeError("smallString expects a string");
  if (s.length > SSO_MAX_UNITS) throw new RangeError(`smallString max ${SSO_MAX_UNITS} units`);
  let v = TAG_SMALLSTR | (BigInt(s.length) << 3n);
  for (let i = 0; i < s.length; i++) v |= BigInt(s.charCodeAt(i)) << (5n + 16n * BigInt(i));
  return asU64(v);
}
export const isSmallString = (v) => tagOf(v) === TAG_SMALLSTR;
export const smallStringLength = (v) => Number((asU64(v) >> 3n) & 3n);
export function smallStringValue(v) {
  const n = smallStringLength(v);
  let s = "";
  for (let i = 0; i < n; i++) s += String.fromCharCode(Number((asU64(v) >> (5n + 16n * BigInt(i))) & 0xffffn));
  return s;
}

// ---------------------------------------------------------------------------
// Heap object header: 16 bytes, little-endian.
//   +0  type  u32   (TYPE_* below)
//   +4  flags u32   (GC bits)
//   +8  meta  u64   (per-type; see OBJECT_MODEL.md)
// ---------------------------------------------------------------------------
export const HEADER_SIZE = 16;

export const TYPE_STRING       = 1; // UTF-16 units inline, meta = length in units
export const TYPE_ARRAY        = 2; // meta = length(high32) | capacity(low32), tagged elems inline
export const TYPE_OBJECT       = 3; // meta = shape pointer, tagged values inline per shape
export const TYPE_DOUBLE       = 4; // boxed double: 8-byte IEEE754 payload (reached via TAG_DOUBLE)
export const TYPE_CLOSURE      = 5; // meta = code address, tagged captured env inline
export const TYPE_BUFFER       = 6; // raw bytes, meta = byte length
export const TYPE_SPARSE_ARRAY = 7; // meta = entry count, sorted (u32 key, tagged val) pairs
export const TYPE_SHAPE        = 8; // hidden class: meta = prop count, names[N] + slots[N]

// GC flag bits (flags u32)
export const FLAG_MARKED    = 1 << 0; // mark-sweep mark bit
export const FLAG_FORWARDED = 1 << 1; // copying GC: meta holds forwarding pointer
export const FLAG_GEN_SHIFT = 8;      // bits 8..15: generation / age counter
export const FLAG_GEN_MASK  = 0xff << FLAG_GEN_SHIFT;

export function writeHeader(dv, off, type, flags, meta) {
  dv.setUint32(off, type >>> 0, true);
  dv.setUint32(off + 4, flags >>> 0, true);
  dv.setBigUint64(off + 8, asU64(meta), true);
}
export function readHeader(dv, off) {
  return {
    type: dv.getUint32(off, true),
    flags: dv.getUint32(off + 4, true),
    meta: dv.getBigUint64(off + 8, true),
  };
}

// ---------------------------------------------------------------------------
// Simulated heap (unit tests / differential harness). Production uses the
// real allocator; addresses there are absolute, here they are byte offsets
// into one ArrayBuffer. Objects are 16-byte aligned.
// ---------------------------------------------------------------------------
export function makeHeap(sizeBytes = 1 << 20) {
  const buf = new ArrayBuffer(sizeBytes);
  const dv = new DataView(buf);
  let top = 0;
  const heap = {
    dv,
    get top() { return top; },
    // Allocate a heap object: header + payloadBytes, 16-aligned. Returns byte offset.
    alloc(type, payloadBytes, meta = 0n, flags = 0) {
      const total = HEADER_SIZE + Number(payloadBytes);
      const aligned = (total + 15) & ~15;
      if (top + aligned > sizeBytes) throw new RangeError("simulated heap exhausted");
      const off = top;
      top += aligned;
      writeHeader(dv, off, type, flags, meta);
      return off;
    },
    allocString(js) {
      if (js.length <= SSO_MAX_UNITS) return smallString(js); // not a heapref!
      const off = heap.alloc(TYPE_STRING, js.length * 2, BigInt(js.length));
      for (let i = 0; i < js.length; i++) dv.setUint16(off + HEADER_SIZE + i * 2, js.charCodeAt(i), true);
      return heapref(BigInt(off));
    },
    allocArray(taggedElems, { length = taggedElems.length, capacity = Math.max(taggedElems.length, 4) } = {}) {
      const off = heap.alloc(TYPE_ARRAY, capacity * 8,
        (BigInt(length) << 32n) | BigInt(capacity));
      for (let i = 0; i < taggedElems.length; i++) dv.setBigUint64(off + HEADER_SIZE + i * 8, asU64(taggedElems[i]), true);
      for (let i = taggedElems.length; i < capacity; i++) dv.setBigUint64(off + HEADER_SIZE + i * 8, V_HOLE, true);
      return heapref(BigInt(off));
    },
    allocDouble(num) {
      const off = heap.alloc(TYPE_DOUBLE, 8);
      dv.setFloat64(off + HEADER_SIZE, num, true);
      return doubleref(BigInt(off));
    },
  };
  return heap;
}

// ---------------------------------------------------------------------------
// Marshal: JS value <-> tagged value (host interop / differential testing).
// Numbers: integers in fixnum range -> fixnum; -0 / fractions / out-of-range
//          / Infinity -> boxed double; NaN -> V_NAN.
// ---------------------------------------------------------------------------
export function encodeValue(heap, js) {
  if (typeof js === "number") {
    if (Number.isNaN(js)) return V_NAN;
    // NOTE: the upper bound is a strict < 2**60, not <= Number(FIXNUM_MAX).
    // Number(2**60 - 1) as a JS double already rounds UP to the double 2**60,
    // so a <= comparison admits 2**60 and fixnum() then throws RangeError.
    // Only doubles strictly below 2^60 take the fixnum path; 2^60 itself boxes.
    if (Number.isInteger(js) && !Object.is(js, -0) && js >= Number(FIXNUM_MIN) && js < 2 ** 60) {
      return fixnum(js);
    }
    return heap.allocDouble(js);
  }
  if (typeof js === "bigint") return fixnum(js); // throws if out of range: exact, no silent wrap
  if (typeof js === "string") return heap.allocString(js);
  if (typeof js === "boolean") return js ? V_TRUE : V_FALSE;
  if (js === null) return V_NULL;
  if (js === undefined) return V_UNDEFINED;
  if (Array.isArray(js)) {
    // Build densely: map() skips holes, so loop explicitly and use V_HOLE.
    const elems = new Array(js.length);
    for (let i = 0; i < js.length; i++) elems[i] = (i in js) ? encodeValue(heap, js[i]) : V_HOLE;
    return heap.allocArray(elems, { length: js.length });
  }
  if (typeof js === "object") {
    // Plain object -> TYPE_OBJECT with a fresh shape (names + slot indexes).
    const names = Object.keys(js);
    const nameRefs = names.map((n) => heap.allocString(n));
    const shapeOff = heap.alloc(TYPE_SHAPE, names.length * 16, BigInt(names.length));
    const dv = heap.dv;
    nameRefs.forEach((r, i) => dv.setBigUint64(shapeOff + HEADER_SIZE + i * 8, r, true));
    names.forEach((_, i) => dv.setUint32(shapeOff + HEADER_SIZE + names.length * 8 + i * 4, i, true));
    const objOff = heap.alloc(TYPE_OBJECT, names.length * 8, BigInt(shapeOff));
    names.forEach((n, i) => dv.setBigUint64(objOff + HEADER_SIZE + i * 8, encodeValue(heap, js[n]), true));
    return heapref(BigInt(objOff));
  }
  throw new TypeError(`encodeValue: unsupported JS type ${typeof js}`);
}

export function decodeValue(heap, v) {
  const t = tagOf(v);
  if (t === TAG_FIXNUM) return Number(fixnumValue(v));
  if (t === TAG_IMM) {
    switch (immCode(v)) {
      case IMM_UNDEFINED: return undefined;
      case IMM_NULL: return null;
      case IMM_TRUE: return true;
      case IMM_FALSE: return false;
      case IMM_NAN: return NaN;
      default: throw new Error(`decodeValue: cannot decode immediate code ${immCode(v)}`);
    }
  }
  if (t === TAG_SMALLSTR) return smallStringValue(v);
  const dv = heap.dv;
  const ptr = Number(heapPtr(v));
  const { type, meta } = readHeader(dv, ptr);
  if (t === TAG_DOUBLE) {
    if (type !== TYPE_DOUBLE) throw new Error("doubleref points at non-double header");
    return dv.getFloat64(ptr + HEADER_SIZE, true);
  }
  // TAG_HEAPREF from here on.
  if (type === TYPE_STRING) {
    const n = Number(meta);
    let s = "";
    for (let i = 0; i < n; i++) s += String.fromCharCode(dv.getUint16(ptr + HEADER_SIZE + i * 2, true));
    return s;
  }
  if (type === TYPE_ARRAY) {
    const length = Number(meta >> 32n);
    const out = new Array(length);
    for (let i = 0; i < length; i++) {
      const e = dv.getBigUint64(ptr + HEADER_SIZE + i * 8, true);
      if (e !== V_HOLE) out[i] = decodeValue(heap, e); // holes stay holes
    }
    return out;
  }
  if (type === TYPE_SPARSE_ARRAY) {
    const count = Number(meta);
    const pairs = [];
    for (let i = 0; i < count; i++) {
      const key = dv.getUint32(ptr + HEADER_SIZE + i * 12, true);
      const val = dv.getBigUint64(ptr + HEADER_SIZE + i * 12 + 4, true);
      pairs.push([key, val]);
    }
    const length = pairs.length ? pairs[pairs.length - 1][0] + 1 : 0;
    const out = new Array(length);
    for (const [k, val] of pairs) out[k] = decodeValue(heap, val);
    return out;
  }
  if (type === TYPE_OBJECT) {
    const shapeOff = Number(meta);
    const sh = readHeader(dv, shapeOff);
    if (sh.type !== TYPE_SHAPE) throw new Error("object meta is not a shape");
    const n = Number(sh.meta);
    const out = {};
    for (let i = 0; i < n; i++) {
      const name = decodeValue(heap, dv.getBigUint64(shapeOff + HEADER_SIZE + i * 8, true));
      const slot = dv.getUint32(shapeOff + HEADER_SIZE + n * 8 + i * 4, true);
      out[name] = decodeValue(heap, dv.getBigUint64(ptr + HEADER_SIZE + slot * 8, true));
    }
    return out;
  }
  if (type === TYPE_BUFFER) {
    const n = Number(meta);
    return new Uint8Array(dv.buffer, ptr + HEADER_SIZE, n).slice();
  }
  throw new Error(`decodeValue: unsupported heap type ${type}`);
}

// ---------------------------------------------------------------------------
// Semantics helpers.
// ---------------------------------------------------------------------------
// JS truthiness over tagged values.
export function isTruthy(heap, v) {
  const t = tagOf(v);
  if (t === TAG_FIXNUM) return asU64(v) !== 0n; // fixnum 0 encodes as 0n
  if (t === TAG_SMALLSTR) return smallStringLength(v) !== 0;
  if (t === TAG_IMM) return immCode(v) === IMM_TRUE;
  if (t === TAG_DOUBLE) {
    const d = heap.dv.getFloat64(Number(heapPtr(v)) + HEADER_SIZE, true);
    return d !== 0 && !Number.isNaN(d);
  }
  // TAG_HEAPREF: objects/arrays/buffers truthy; strings truthy iff non-empty.
  const dv = heap.dv;
  const ptr = Number(heapPtr(v));
  const { type, meta } = readHeader(dv, ptr);
  if (type === TYPE_STRING) return meta !== 0n;
  return true;
}

// Strict equality (===) over tagged values. Needs heap access for doubles
// (-0 === 0) and heap strings (content comparison).
export function strictEqual(heap, a, b) {
  const ta = tagOf(a), tb = tagOf(b);
  // NaN !== NaN even though the immediate bits are identical.
  if (ta === TAG_IMM && tb === TAG_IMM && immCode(a) === IMM_NAN && immCode(b) === IMM_NAN) return false;
  if (a === b) return true; // covers fixnum eq, imm eq, smallstr eq, heapref identity
  if (ta !== tb) {
    // Cross-tag numerics (spec §12 rule 6): compare Number(fixnum) with the
    // boxed double. Every fixnum is exactly representable as a double, so the
    // numeric comparison is the exact comparison. NaN === anything is false
    // (covers the NaN sub-case); fixnum(0) === double(-0) is true, matching V8.
    if ((ta === TAG_FIXNUM && tb === TAG_DOUBLE) || (ta === TAG_DOUBLE && tb === TAG_FIXNUM)) {
      const f = ta === TAG_FIXNUM ? a : b;
      const d = ta === TAG_DOUBLE ? a : b;
      const dv = heap.dv.getFloat64(Number(heapPtr(d)) + HEADER_SIZE, true);
      return dv === Number(fixnumValue(f));
    }
    return false;
  }
  if (ta === TAG_DOUBLE) {
    const pa = Number(heapPtr(a)), pb = Number(heapPtr(b));
    const ba = heap.dv.getBigUint64(pa + HEADER_SIZE, true);
    const bb = heap.dv.getBigUint64(pb + HEADER_SIZE, true);
    const za = (ba & 0x7fffffffffffffffn) === 0n, zb = (bb & 0x7fffffffffffffffn) === 0n;
    if (za && zb) return true; // -0 === +0
    if (za || zb) return false;
    // NaN payloads never equal (also guarded above for the imm case).
    const expA = ba & 0x7ff0000000000000n, expB = bb & 0x7ff0000000000000n;
    if (expA === 0x7ff0000000000000n || expB === 0x7ff0000000000000n) return false;
    return ba === bb;
  }
  if (ta === TAG_HEAPREF) {
    const pa = Number(heapPtr(a)), pb = Number(heapPtr(b));
    const ha = readHeader(heap.dv, pa), hb = readHeader(heap.dv, pb);
    if (ha.type !== hb.type || ha.type !== TYPE_STRING) return false; // identity only for non-strings
    if (ha.meta !== hb.meta) return false;
    const n = Number(ha.meta);
    for (let i = 0; i < n; i++) {
      if (heap.dv.getUint16(pa + HEADER_SIZE + i * 2, true) !== heap.dv.getUint16(pb + HEADER_SIZE + i * 2, true)) return false;
    }
    return true;
  }
  return false;
}

// typeof over tagged values.
export function typeOf(heap, v) {
  const t = tagOf(v);
  if (t === TAG_FIXNUM || t === TAG_DOUBLE) return "number";
  if (t === TAG_SMALLSTR) return "string";
  if (t === TAG_IMM) {
    const c = immCode(v);
    if (c === IMM_UNDEFINED) return "undefined";
    if (c === IMM_NULL) return "object"; // JS quirk, kept exact
    if (c === IMM_TRUE || c === IMM_FALSE) return "boolean";
    return "number"; // NaN
  }
  const { type } = readHeader(heap.dv, Number(heapPtr(v)));
  if (type === TYPE_STRING) return "string";
  if (type === TYPE_CLOSURE) return "function";
  return "object";
}
