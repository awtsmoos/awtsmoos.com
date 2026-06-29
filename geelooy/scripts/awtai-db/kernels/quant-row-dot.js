// B"H

const { f16 } = require('../math/f16.js');
const { blockSize } = require('../format/ggml-types.js');

/**
 * Direct row dot products for GGML quantized rows.
 *
 * A row enters as bytes from disk; the input activation is already a small
 * Float32Array.  No row-sized Float32Array is born here.  The Awtsmoos
 * speaks through packed bits, scales, mins, and one accumulated breath.
 */
function rowByteLength(type, cols) {
  const shape = blockSize(type);
  return Math.ceil(cols / shape.blockElements) * shape.blockSize;
}

function canStreamRows(tensor, cols) {
  return !!tensor && rowByteLength(tensor.type, cols) <= tensor.byteLength;
}

function dotQuantizedRow(bytes, type, cols, input) {
  switch (type) {
    case 0: return dotF32(bytes, cols, input);
    case 1: return dotF16(bytes, cols, input);
    case 2: return dotQ4_0(bytes, cols, input);
    case 8: return dotQ8_0(bytes, cols, input);
    case 10: return dotQ2_K(bytes, cols, input);
    case 11: return dotQ3_K(bytes, cols, input);
    case 12: return dotQ4_K(bytes, cols, input);
    case 13: return dotQ5_K(bytes, cols, input);
    case 14: return dotQ6_K(bytes, cols, input);
    default: throw new Error(`B'H direct dot missing for GGML type ${type}`);
  }
}

function dotF32(b, n, x) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += view.getFloat32(i * 4, true) * x[i];
  return sum;
}

function dotF16(b, n, x) {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += f16(b, i * 2) * x[i];
  return sum;
}

function dotQ4_0(b, n, x) {
  let sum = 0, p = 0;
  for (let base = 0; base < n; base += 32) {
    const d = f16(b, p); p += 2;
    for (let i = 0; i < 16; i++) {
      const q = b[p++];
      if (base + i < n) sum += ((q & 15) - 8) * d * x[base + i];
      if (base + i + 16 < n) sum += ((q >> 4) - 8) * d * x[base + i + 16];
    }
  }
  return sum;
}

function dotQ8_0(b, n, x) {
  let sum = 0, p = 0;
  for (let base = 0; base < n; base += 32) {
    const d = f16(b, p); p += 2;
    for (let i = 0; i < 32; i++) {
      if (base + i < n) sum += i8(b[p]) * d * x[base + i];
      p++;
    }
  }
  return sum;
}

function dotQ2_K(b, n, x) {
  let sum = 0, p = 0;
  for (let base = 0; base < n; base += 256) {
    const scales = p; p += 16;
    const qs = p; p += 64;
    const d = f16(b, p), dm = f16(b, p + 2); p += 4;
    sum += dotQ2Half(b, x, base, scales, qs, d, dm, n, 0);
    sum += dotQ2Half(b, x, base + 128, scales, qs + 32, d, dm, n, 8);
  }
  return sum;
}

function dotQ2Half(b, x, base, scales, qs, d, dm, n, scaleBase) {
  let sum = 0;
  for (let i = 0; i < 32; i++) {
    const by = b[qs + i];
    const is = scaleBase + (i >> 4);
    for (let z = 0; z < 4; z++) {
      const idx = base + i + 32 * z;
      if (idx >= n) continue;
      const sc = b[scales + is + 2 * z];
      sum += (d * (sc & 15) * ((by >> (2 * z)) & 3) - dm * (sc >> 4)) * x[idx];
    }
  }
  return sum;
}

function dotQ3_K(b, n, x) {
  let sum = 0, p = 0;
  const aux = new Uint8Array(16);
  const km1 = 0x03030303, km2 = 0x0f0f0f0f;
  for (let base = 0; base < n; base += 256) {
    const hmask = p; p += 32;
    const qs = p; p += 64;
    const scp = p; p += 12;
    const d = f16(b, p); p += 2;
    aux.fill(0); aux.set(b.subarray(scp, scp + 12));
    const a0 = u32(aux, 0), a1 = u32(aux, 4), a2 = u32(aux, 8);
    putU32(aux, 8, ((a0 >>> 4) & km2) | (((a2 >>> 4) & km1) << 4));
    putU32(aux, 12, ((a1 >>> 4) & km2) | (((a2 >>> 6) & km1) << 4));
    putU32(aux, 0, (a0 & km2) | (((a2 >>> 0) & km1) << 4));
    putU32(aux, 4, (a1 & km2) | (((a2 >>> 2) & km1) << 4));
    sum += dotQ3Block(b, x, base, hmask, qs, aux, d, n);
  }
  return sum;
}

function dotQ3Block(b, x, base, hmask, qs, scales, d, n) {
  let sum = 0, is = 0, mask = 1, qoff = qs, y = base;
  for (let nn = 0; nn < 256; nn += 128) {
    let shift = 0;
    for (let j = 0; j < 4; j++) {
      sum += dotQ3Group(b, x, y, qoff, hmask, mask, shift, d * (i8(scales[is++]) - 32), n); y += 16;
      sum += dotQ3Group(b, x, y, qoff + 16, hmask + 16, mask, shift, d * (i8(scales[is++]) - 32), n); y += 16;
      shift += 2; mask <<= 1;
    }
    qoff += 32;
  }
  return sum;
}

function dotQ3Group(b, x, base, q, hm, mask, shift, d, n) {
  let sum = 0;
  for (let l = 0; l < 16; l++) {
    const idx = base + l;
    if (idx < n) sum += d * (((b[q + l] >> shift) & 3) - ((b[hm + l] & mask) ? 0 : 4)) * x[idx];
  }
  return sum;
}

function dotQ4_K(b, n, x) {
  let sum = 0, p = 0;
  for (let base = 0; base < n; base += 256) {
    const d = f16(b, p), dm = f16(b, p + 2); p += 4;
    const scales = p; p += 12;
    const qs = p; p += 128;
    for (let group = 0; group < 4; group++) {
      const low = getScaleMin(b, scales, 2 * group);
      const high = getScaleMin(b, scales, 2 * group + 1);
      for (let l = 0; l < 32; l++) {
        const q = b[qs + group * 32 + l];
        const i0 = base + group * 64 + l;
        const i1 = i0 + 32;
        if (i0 < n) sum += (d * low.s * (q & 15) - dm * low.m) * x[i0];
        if (i1 < n) sum += (d * high.s * (q >> 4) - dm * high.m) * x[i1];
      }
    }
  }
  return sum;
}

function dotQ5_K(b, n, x) {
  let sum = 0, p = 0;
  for (let base = 0; base < n; base += 256) {
    const d = f16(b, p), dm = f16(b, p + 2); p += 4;
    const scales = p; p += 12;
    const qh = p; p += 32;
    const qs = p; p += 128;
    for (let i = 0; i < 256 && base + i < n; i++) {
      const sm = getScaleMin(b, scales, i >> 5);
      const low = i % 2 === 0 ? b[qs + (i >> 1)] & 15 : b[qs + (i >> 1)] >> 4;
      const high = (b[qh + (i >> 3)] >> (i & 7)) & 1;
      sum += (d * sm.s * (low | (high << 4)) - dm * sm.m) * x[base + i];
    }
  }
  return sum;
}

function dotQ6_K(b, n, x) {
  let sum = 0, p = 0;
  for (let base = 0; base < n; base += 256) {
    let ql = p; p += 128;
    let qh = p; p += 64;
    let sc = p; p += 16;
    const d = f16(b, p); p += 2;
    for (let half = 0, y = base; half < 2; half++, y += 128, ql += 64, qh += 32, sc += 8) {
      for (let l = 0; l < 32; l++) {
        const a = b[ql + l], c = b[ql + 32 + l], h = b[qh + l], is = l >> 4;
        sum += q6One(d, i8(b[sc + is]), ((a & 15) | (((h >> 0) & 3) << 4)) - 32, x, y + l, n);
        sum += q6One(d, i8(b[sc + is + 2]), ((c & 15) | (((h >> 2) & 3) << 4)) - 32, x, y + l + 32, n);
        sum += q6One(d, i8(b[sc + is + 4]), ((a >> 4) | (((h >> 4) & 3) << 4)) - 32, x, y + l + 64, n);
        sum += q6One(d, i8(b[sc + is + 6]), ((c >> 4) | (((h >> 6) & 3) << 4)) - 32, x, y + l + 96, n);
      }
    }
  }
  return sum;
}

function q6One(d, scale, q, x, idx, n) {
  return idx < n ? d * scale * q * x[idx] : 0;
}

function getScaleMin(b, off, j) {
  if (j < 4) return { s: b[off + j] & 63, m: b[off + j + 4] & 63 };
  return {
    s: (b[off + j + 4] & 15) | ((b[off + j - 4] >> 6) << 4),
    m: (b[off + j + 4] >> 4) | ((b[off + j] >> 6) << 4),
  };
}

function i8(x) { return x > 127 ? x - 256 : x; }
function u32(a, o) { return (a[o] | (a[o + 1] << 8) | (a[o + 2] << 16) | (a[o + 3] << 24)) >>> 0; }
function putU32(a, o, v) { a[o] = v & 255; a[o + 1] = (v >>> 8) & 255; a[o + 2] = (v >>> 16) & 255; a[o + 3] = (v >>> 24) & 255; }

module.exports = { canStreamRows, dotQuantizedRow, rowByteLength };
