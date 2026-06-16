// B"H
/**
 * @file packed_varint.mjs
 * @chapter The Integers Fold Themselves Into Small Vessels
 * @description
 * Tiny unsigned varint helpers for the super-packed Hebrew index. The old JSONL
 * sea repeated metadata as if every token were a new world. Here the Awtsmoos
 * teaches numbers to bow: small values become one byte, larger values unfold
 * only as much as necessary.
 */

export function encodeU32(value, out = []) {
  let n = Number(value >>> 0);
  while (n >= 0x80) {
    out.push((n & 0x7f) | 0x80);
    n >>>= 7;
  }
  out.push(n);
  return out;
}

export function encodeU53(value, out = []) {
  let n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0) throw new Error(`Cannot varint encode unsafe value ${value}`);
  while (n >= 0x80) {
    out.push((n % 0x80) | 0x80);
    n = Math.floor(n / 0x80);
  }
  out.push(n);
  return out;
}

export function decodeU53(bytes, offset = 0) {
  let value = 0;
  let shift = 1;
  let pos = offset;
  while (pos < bytes.length) {
    const byte = bytes[pos++];
    value += (byte & 0x7f) * shift;
    if ((byte & 0x80) === 0) return { value, offset: pos };
    shift *= 0x80;
  }
  throw new Error('Truncated varint');
}

export function encodeDeltaSorted(values) {
  const out = [];
  let previous = 0;
  for (const value of values) {
    const current = Number(value);
    if (!Number.isSafeInteger(current) || current < previous) throw new Error('Delta values must be sorted safe integers');
    encodeU53(current - previous, out);
    previous = current;
  }
  return Buffer.from(out);
}

export function decodeDeltaSorted(bytes) {
  const values = [];
  let previous = 0;
  let offset = 0;
  while (offset < bytes.length) {
    const decoded = decodeU53(bytes, offset);
    previous += decoded.value;
    values.push(previous);
    offset = decoded.offset;
  }
  return values;
}

export function encodeRows(rows) {
  const out = [];
  for (const row of rows) for (const value of row) encodeU53(value, out);
  return Buffer.from(out);
}

export function decodeRows(bytes, width) {
  const rows = [];
  let offset = 0;
  while (offset < bytes.length) {
    const row = [];
    for (let i = 0; i < width; i++) {
      const decoded = decodeU53(bytes, offset);
      row.push(decoded.value);
      offset = decoded.offset;
    }
    rows.push(row);
  }
  return rows;
}
