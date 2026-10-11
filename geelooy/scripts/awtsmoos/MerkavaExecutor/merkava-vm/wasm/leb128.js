// B"H — LEB128 encode/decode for WebAssembly binary format.
// Pure from-scratch implementation, no dependencies.

// Some runtimes only provide asIntN/asUintN — polyfill the 64-bit aliases.
if (typeof BigInt.asInt64 !== 'function') {
  BigInt.asInt64 = (v) => BigInt.asIntN(64, v);
  BigInt.asUint64 = (v) => BigInt.asUintN(64, v);
}

export function readU32(reader) {
  let result = 0, shift = 0, byte;
  do {
    byte = reader.u8();
    result |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte & 0x80);
  return result >>> 0;
}

export function readS32(reader) {
  let result = 0, shift = 0, byte;
  do {
    byte = reader.u8();
    result |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte & 0x80);
  if (shift < 32 && (byte & 0x40)) result |= -(1 << shift);
  return result | 0;
}

export function readU64(reader) {
  let result = 0n, shift = 0n, byte;
  do {
    byte = reader.u8();
    result |= BigInt(byte & 0x7f) << shift;
    shift += 7n;
  } while (byte & 0x80);
  return result;
}

export function readS64(reader) {
  let result = 0n, shift = 0n, byte;
  do {
    byte = reader.u8();
    result |= BigInt(byte & 0x7f) << shift;
    shift += 7n;
  } while (byte & 0x80);
  if (shift < 64n && (byte & 0x40)) result |= -(1n << shift);
  return BigInt.asInt64(result);
}

export function writeU32(out, value) {
  value >>>= 0;
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value !== 0) byte |= 0x80;
    out.push(byte);
  } while (value !== 0);
}

export function writeS32(out, value) {
  value |= 0;
  let more = true;
  while (more) {
    let byte = value & 0x7f;
    value >>= 7;
    const signBit = (byte & 0x40) !== 0;
    if ((value === 0 && !signBit) || (value === -1 && signBit)) more = false;
    else byte |= 0x80;
    out.push(byte);
  }
}

export function writeU64(out, value) {
  value = BigInt(value);
  do {
    let byte = Number(value & 0x7fn);
    value >>= 7n;
    if (value !== 0n) byte |= 0x80;
    out.push(byte);
  } while (value !== 0n);
}

export function writeS64(out, value) {
  value = BigInt.asInt64(BigInt(value));
  let more = true;
  while (more) {
    let byte = Number(value & 0x7fn);
    value >>= 7n;
    const signBit = (byte & 0x40) !== 0;
    if ((value === 0n && !signBit) || (value === -1n && signBit)) more = false;
    else byte |= 0x80;
    out.push(byte);
  }
}

export function writeF32(out, value) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setFloat32(0, value, true);
  for (const b of new Uint8Array(buf)) out.push(b);
}

export function writeF64(out, value) {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setFloat64(0, value, true);
  for (const b of new Uint8Array(buf)) out.push(b);
}

// Byte-reader over a Uint8Array with position tracking.
export function makeReader(bytes) {
  let pos = 0;
  return {
    get pos() { return pos; },
    get remaining() { return bytes.length - pos; },
    u8() {
      if (pos >= bytes.length) throw new Error('[wasm] unexpected end of binary');
      return bytes[pos++];
    },
    bytes(n) {
      if (pos + n > bytes.length) throw new Error('[wasm] unexpected end of binary');
      const s = bytes.subarray(pos, pos + n);
      pos += n;
      return s;
    },
    u32() { return readU32(this); },
    s32() { return readS32(this); },
    u64() { return readU64(this); },
    s64() { return readS64(this); },
    f32() {
      const b = this.bytes(4);
      return new DataView(b.buffer, b.byteOffset, 4).getFloat32(0, true);
    },
    f64() {
      const b = this.bytes(8);
      return new DataView(b.buffer, b.byteOffset, 8).getFloat64(0, true);
    },
    name() {
      const len = this.u32();
      const b = this.bytes(len);
      return new TextDecoder().decode(b);
    },
  };
}
