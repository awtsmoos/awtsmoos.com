// B"H
/**
 * @file pngDecoder.js
 * @description
 * From-scratch PNG decoder for the Merkava browser's image-decoding
 * subsystem. No npm dependencies: decompression uses Node's builtin zlib,
 * CRC32 comes from the repo's pngTools.js.
 *
 * decodePng(bytes: Uint8Array) ->
 *   { width, height, data: Uint8ClampedArray (RGBA, row-major, top-to-bottom), format: 'png' }
 * Throws an Error (never crashes the process) on invalid or truncated input.
 *
 * Supported: all 5 color types (0, 2, 3, 4, 6), bit depths 1/2/4/8/16
 * (16-bit samples are reduced to their high byte), all 5 filter types,
 * tRNS transparency for types 0/2/3, Adam7 interlacing. Unknown ancillary
 * chunks are skipped (after CRC verification); unknown critical chunks are
 * rejected.
 */
import { inflateSync } from "zlib";
import { crc32Init, crc32Update, crc32Finish } from "../../pngTools.js";

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// Sanity caps so hostile headers cannot force absurd allocations.
const MAX_DIMENSION = 16384;
const MAX_PIXELS = 16777216; // 16 megapixels

// Adam7 interlace passes: [xOrigin, yOrigin, xDelta, yDelta]
const ADAM7 = [
  [0, 0, 8, 8],
  [4, 0, 8, 8],
  [0, 4, 4, 8],
  [2, 0, 4, 4],
  [0, 2, 2, 4],
  [1, 0, 2, 2],
  [0, 1, 1, 2],
];

const SAMPLES_PER_PIXEL = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
const VALID_BIT_DEPTHS = {
  0: [1, 2, 4, 8, 16],
  2: [8, 16],
  3: [1, 2, 4, 8],
  4: [8, 16],
  6: [8, 16],
};

function fail(message) {
  throw new Error("pngDecoder: " + message);
}

function readU32BE(b, o) {
  return (
    ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>>
    0
  );
}

function chunkTypeName(tb) {
  return String.fromCharCode(tb[0], tb[1], tb[2], tb[3]);
}

function isCritical(type) {
  const c = type.charCodeAt(0);
  return c >= 65 && c <= 90; // uppercase first letter
}

// ---------------------------------------------------------------------------
// Chunk parsing
// ---------------------------------------------------------------------------

function parseChunks(b) {
  let pos = 8;
  let ihdr = null;
  let plte = null; // Uint8Array of RGB triples
  let trns = null; // { gray: number(-1 none), rgb: [r,g,b]|null, pal: Uint8Array|null }
  const idatParts = [];
  let seenIHDR = false;
  let seenIDAT = false;
  let seenPLTE = false;
  let seenIEND = false;

  while (pos < b.length) {
    if (pos + 12 > b.length) fail("truncated chunk header");
    const length = readU32BE(b, pos);
    if (length > 0x7fffffff) fail("absurd chunk length");
    const typeBytes = b.subarray(pos + 4, pos + 8);
    const type = chunkTypeName(typeBytes);
    const dataStart = pos + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > b.length) fail("truncated chunk data (" + type + ")");
    const data = b.subarray(dataStart, dataEnd);
    const storedCrc = readU32BE(b, dataEnd);

    // Incremental table-driven CRC over the type + data bytes: no concatenation
    // buffer is allocated (the old code copied up to megabytes per IDAT chunk).
    let crc = crc32Init();
    crc = crc32Update(crc, typeBytes, 0, 4);
    crc = crc32Update(crc, data, 0, length);
    if (crc32Finish(crc) !== storedCrc) fail("CRC mismatch in chunk " + type);

    pos = dataEnd + 4;

    if (type === "IHDR") {
      if (seenIHDR) fail("duplicate IHDR");
      if (pos !== 8 + 12 + length) fail("IHDR is not the first chunk");
      if (length !== 13) fail("bad IHDR length");
      ihdr = {
        width: readU32BE(data, 0),
        height: readU32BE(data, 4),
        bitDepth: data[8],
        colorType: data[9],
        compression: data[10],
        filter: data[11],
        interlace: data[12],
      };
      seenIHDR = true;
    } else if (type === "PLTE") {
      if (!seenIHDR) fail("PLTE before IHDR");
      if (seenPLTE) fail("duplicate PLTE");
      if (seenIDAT) fail("PLTE after IDAT");
      if (length === 0 || length % 3 !== 0 || length > 768)
        fail("bad PLTE length");
      plte = Uint8Array.from(data);
      seenPLTE = true;
    } else if (type === "tRNS") {
      if (!seenIHDR) fail("tRNS before IHDR");
      if (seenIDAT) fail("tRNS after IDAT");
      if (trns) fail("duplicate tRNS");
      trns = { gray: -1, rgb: null, pal: null, raw: Uint8Array.from(data) };
    } else if (type === "IDAT") {
      if (!seenIHDR) fail("IDAT before IHDR");
      seenIDAT = true;
      idatParts.push(data);
    } else if (type === "IEND") {
      if (length !== 0) fail("bad IEND length");
      seenIEND = true;
      break;
    } else {
      if (!seenIHDR) fail("chunk " + type + " before IHDR");
      if (isCritical(type)) fail("unknown critical chunk " + type);
      if (seenIDAT) fail("chunk " + type + " between IDAT and IEND");
      // Unknown ancillary chunk: CRC already verified, skip its data.
    }
  }

  if (!seenIHDR) fail("missing IHDR");
  if (!seenIEND) fail("missing IEND");
  if (!seenIDAT) fail("missing IDAT");
  return { ihdr, plte, trns, idatParts };
}

function validateIHDR(ihdr) {
  const { width, height, bitDepth, colorType, compression, filter, interlace } =
    ihdr;
  if (width < 1 || width > MAX_DIMENSION) fail("bad width " + width);
  if (height < 1 || height > MAX_DIMENSION) fail("bad height " + height);
  if (width * height > MAX_PIXELS) fail("image too large");
  const okDepths = VALID_BIT_DEPTHS[colorType];
  if (!okDepths) fail("bad color type " + colorType);
  if (!okDepths.includes(bitDepth))
    fail("bit depth " + bitDepth + " invalid for color type " + colorType);
  if (compression !== 0) fail("bad compression method " + compression);
  if (filter !== 0) fail("bad filter method " + filter);
  if (interlace !== 0 && interlace !== 1)
    fail("bad interlace method " + interlace);
}

function resolveTransparency(trns, colorType, plte) {
  // Returns { gray, rgb, pal } with gray=-1 meaning "none".
  const out = { gray: -1, rgb: null, pal: null };
  if (!trns) return out;
  const d = trns.raw;
  if (colorType === 0) {
    if (d.length !== 2) fail("bad tRNS length for grayscale");
    out.gray = (d[0] << 8) | d[1];
  } else if (colorType === 2) {
    if (d.length !== 6) fail("bad tRNS length for truecolor");
    out.rgb = [
      (d[0] << 8) | d[1],
      (d[2] << 8) | d[3],
      (d[4] << 8) | d[5],
    ];
  } else if (colorType === 3) {
    if (!plte) fail("tRNS without PLTE");
    if (d.length > plte.length / 3) fail("tRNS longer than palette");
    out.pal = d; // alpha per palette index; missing entries default to 255
  }
  // tRNS on other color types is ignored per spec.
  return out;
}

// ---------------------------------------------------------------------------
// Scanline unfiltering (typed arrays, plain loops, no closures)
// ---------------------------------------------------------------------------

function unfilterRow(f, row, prev, cur, bpp) {
  const n = row.length;
  if (f === 0) {
    cur.set(row);
    return;
  }
  if (f === 1) {
    // Sub: first bpp bytes have no left neighbor (plain copy), then branch-free.
    let i = 0;
    const first = bpp < n ? bpp : n;
    for (; i < first; i++) cur[i] = row[i];
    for (; i < n; i++) cur[i] = (row[i] + cur[i - bpp]) & 255;
    return;
  }
  if (f === 2) {
    // Up
    for (let i = 0; i < n; i++) cur[i] = (row[i] + prev[i]) & 255;
    return;
  }
  if (f === 3) {
    // Average: first bpp bytes average with 0 on the left.
    let i = 0;
    const first = bpp < n ? bpp : n;
    for (; i < first; i++) cur[i] = (row[i] + (prev[i] >> 1)) & 255;
    for (; i < n; i++) cur[i] = (row[i] + ((cur[i - bpp] + prev[i]) >> 1)) & 255;
    return;
  }
  if (f === 4) {
    // Paeth: first bpp bytes degrade to Up (a=0,c=0 -> pr=b); then branch-free.
    let i = 0;
    const first = bpp < n ? bpp : n;
    for (; i < first; i++) cur[i] = (row[i] + prev[i]) & 255;
    for (; i < n; i++) {
      const a = cur[i - bpp];
      const bb = prev[i];
      const c = prev[i - bpp];
      const p = a + bb - c;
      let pa = p - a;
      if (pa < 0) pa = -pa;
      let pb = p - bb;
      if (pb < 0) pb = -pb;
      let pc = p - c;
      if (pc < 0) pc = -pc;
      const pr = pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
      cur[i] = (row[i] + pr) & 255;
    }
    return;
  }
  fail("unknown filter type " + f);
}

// Expand one unfiltered packed row into native sample values (Uint16Array).
function unpackRow(cur, smp, pw, spp, bitDepth) {
  const n = pw * spp;
  if (bitDepth === 8) {
    for (let i = 0; i < n; i++) smp[i] = cur[i];
  } else if (bitDepth === 16) {
    for (let i = 0; i < n; i++) smp[i] = (cur[i * 2] << 8) | cur[i * 2 + 1];
  } else if (bitDepth === 4) {
    for (let i = 0; i < n; i++)
      smp[i] = (i & 1) === 0 ? cur[i >> 1] >> 4 : cur[i >> 1] & 15;
  } else if (bitDepth === 2) {
    for (let i = 0; i < n; i++)
      smp[i] = (cur[i >> 2] >> ((3 - (i & 3)) * 2)) & 3;
  } else {
    // bitDepth === 1
    for (let i = 0; i < n; i++) smp[i] = (cur[i >> 3] >> (7 - (i & 7))) & 1;
  }
}

// Native sample value -> 8-bit output (high byte for 16-bit, scaled for <8).
function makeToByte(bitDepth) {
  if (bitDepth === 16) {
    const t = new Uint8Array(65536);
    for (let i = 0; i < 65536; i++) t[i] = i >> 8;
    return t;
  }
  if (bitDepth === 8) {
    const t = new Uint8Array(256);
    for (let i = 0; i < 256; i++) t[i] = i;
    return t;
  }
  const max = (1 << bitDepth) - 1;
  const t = new Uint8Array(max + 1);
  for (let i = 0; i <= max; i++) t[i] = Math.round((i * 255) / max);
  return t;
}

// Fast blit for 8-bit rows with no tRNS: works directly on the unfiltered
// bytes, skipping the Uint16 sample buffer and the toByte table entirely.
// For the common non-interlaced RGBA case this is a single bulk copy.
function blitRowFast8(cur, pw, colorType, out, dstRow, x0, dx, plte) {
  if (colorType === 6) {
    if (dx === 1) {
      out.set(cur, dstRow + x0 * 4);
      return;
    }
    for (let x = 0; x < pw; x++) {
      const o = dstRow + (x0 + x * dx) * 4, s = x * 4;
      out[o] = cur[s];
      out[o + 1] = cur[s + 1];
      out[o + 2] = cur[s + 2];
      out[o + 3] = cur[s + 3];
    }
  } else if (colorType === 2) {
    for (let x = 0; x < pw; x++) {
      const o = dstRow + (x0 + x * dx) * 4, s = x * 3;
      out[o] = cur[s];
      out[o + 1] = cur[s + 1];
      out[o + 2] = cur[s + 2];
      out[o + 3] = 255;
    }
  } else if (colorType === 0) {
    for (let x = 0; x < pw; x++) {
      const o = dstRow + (x0 + x * dx) * 4, g = cur[x];
      out[o] = g;
      out[o + 1] = g;
      out[o + 2] = g;
      out[o + 3] = 255;
    }
  } else if (colorType === 4) {
    for (let x = 0; x < pw; x++) {
      const o = dstRow + (x0 + x * dx) * 4, s = x * 2, g = cur[s];
      out[o] = g;
      out[o + 1] = g;
      out[o + 2] = g;
      out[o + 3] = cur[s + 1];
    }
  } else {
    // colorType === 3 (palette)
    for (let x = 0; x < pw; x++) {
      const idx = cur[x];
      const pi = idx * 3;
      if (pi + 2 >= plte.length) fail("palette index out of range");
      const o = dstRow + (x0 + x * dx) * 4;
      out[o] = plte[pi];
      out[o + 1] = plte[pi + 1];
      out[o + 2] = plte[pi + 2];
      out[o + 3] = 255;
    }
  }
}

function blitRow(
  smp,
  pw,
  colorType,
  toByte,
  out,
  dstRow,
  x0,
  dx,
  plte,
  trnsGray,
  trnsRgb,
  trnsPal
) {
  if (colorType === 0) {
    for (let x = 0; x < pw; x++) {
      const v = smp[x];
      const o = dstRow + (x0 + x * dx) * 4;
      const g = toByte[v];
      out[o] = g;
      out[o + 1] = g;
      out[o + 2] = g;
      out[o + 3] = trnsGray !== -1 && v === trnsGray ? 0 : 255;
    }
  } else if (colorType === 2) {
    for (let x = 0; x < pw; x++) {
      const r = smp[x * 3];
      const g = smp[x * 3 + 1];
      const bb = smp[x * 3 + 2];
      const o = dstRow + (x0 + x * dx) * 4;
      out[o] = toByte[r];
      out[o + 1] = toByte[g];
      out[o + 2] = toByte[bb];
      out[o + 3] =
        trnsRgb !== null && r === trnsRgb[0] && g === trnsRgb[1] && bb === trnsRgb[2]
          ? 0
          : 255;
    }
  } else if (colorType === 3) {
    const entries = plte.length / 3;
    for (let x = 0; x < pw; x++) {
      const idx = smp[x];
      if (idx >= entries) fail("palette index out of range");
      const o = dstRow + (x0 + x * dx) * 4;
      const pi = idx * 3;
      out[o] = plte[pi];
      out[o + 1] = plte[pi + 1];
      out[o + 2] = plte[pi + 2];
      out[o + 3] =
        trnsPal !== null && idx < trnsPal.length ? trnsPal[idx] : 255;
    }
  } else if (colorType === 4) {
    for (let x = 0; x < pw; x++) {
      const g = toByte[smp[x * 2]];
      const o = dstRow + (x0 + x * dx) * 4;
      out[o] = g;
      out[o + 1] = g;
      out[o + 2] = g;
      out[o + 3] = toByte[smp[x * 2 + 1]];
    }
  } else {
    // colorType === 6
    for (let x = 0; x < pw; x++) {
      const o = dstRow + (x0 + x * dx) * 4;
      out[o] = toByte[smp[x * 4]];
      out[o + 1] = toByte[smp[x * 4 + 1]];
      out[o + 2] = toByte[smp[x * 4 + 2]];
      out[o + 3] = toByte[smp[x * 4 + 3]];
    }
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function decodePng(bytes) {
  if (!(bytes instanceof Uint8Array)) fail("expected a Uint8Array");
  const b = bytes;
  if (b.length < 8) fail("input too short for PNG magic");
  for (let i = 0; i < 8; i++)
    if (b[i] !== PNG_MAGIC[i]) fail("bad PNG magic");

  const { ihdr, plte, trns, idatParts } = parseChunks(b);
  validateIHDR(ihdr);
  const { width, height, bitDepth, colorType, interlace } = ihdr;

  if (colorType === 3 && !plte) fail("palette image without PLTE");
  if ((colorType === 0 || colorType === 4) && plte)
    fail("PLTE not allowed for grayscale types");

  const t = resolveTransparency(trns, colorType, plte);
  const spp = SAMPLES_PER_PIXEL[colorType];
  // toByte table is only needed on the slow path (sub-byte/16-bit/tRNS).
  // 8-bit rows without tRNS skip the sample buffer + toByte table entirely.
  const fast8 = bitDepth === 8 && t.gray === -1 && t.rgb === null && t.pal === null;
  const toByte = fast8 ? null : makeToByte(bitDepth);
  // Filter "bytes per pixel": one complete pixel, rounded up to whole bytes.
  const bpp = Math.max(1, Math.ceil((bitDepth * spp) / 8));

  // Concatenate IDAT payloads and decompress.
  let totalIdat = 0;
  for (const part of idatParts) totalIdat += part.length;
  const compressed = new Uint8Array(totalIdat);
  let off = 0;
  for (const part of idatParts) {
    compressed.set(part, off);
    off += part.length;
  }
  let raw;
  try {
    raw = inflateSync(compressed);
  } catch (e) {
    fail("IDAT inflate failed: " + (e && e.message ? e.message : e));
  }

  // Lay out the passes and verify the decompressed size exactly.
  const passDefs = interlace === 1 ? ADAM7 : [[0, 0, 1, 1]];
  const passes = [];
  let expected = 0;
  for (const [x0, y0, dx, dy] of passDefs) {
    const pw = x0 >= width ? 0 : Math.ceil((width - x0) / dx);
    const ph = y0 >= height ? 0 : Math.ceil((height - y0) / dy);
    if (pw === 0 || ph === 0) continue;
    const rowBytes = Math.ceil((pw * bitDepth * spp) / 8);
    expected += ph * (1 + rowBytes);
    passes.push({ x0, y0, dx, dy, pw, ph, rowBytes });
  }
  if (raw.length !== expected)
    fail(
      "IDAT size mismatch: got " + raw.length + ", expected " + expected
    );

  const out = new Uint8ClampedArray(width * height * 4);
  let p = 0;
  for (const pass of passes) {
    const { x0, y0, dx, dy, pw, ph, rowBytes } = pass;
    let prev = new Uint8Array(rowBytes);
    let cur = new Uint8Array(rowBytes);
    const smp = fast8 ? null : new Uint16Array(pw * spp);
    for (let y = 0; y < ph; y++) {
      const f = raw[p++];
      const row = raw.subarray(p, p + rowBytes);
      p += rowBytes;
      unfilterRow(f, row, prev, cur, bpp);
      const dstRow = (y0 + y * dy) * width * 4;
      if (fast8) {
        blitRowFast8(cur, pw, colorType, out, dstRow, x0, dx, plte);
      } else {
        unpackRow(cur, smp, pw, spp, bitDepth);
        blitRow(
          smp,
          pw,
          colorType,
          toByte,
          out,
          dstRow,
          x0,
          dx,
          plte,
          t.gray,
          t.rgb,
          t.pal
        );
      }
      const tmp = prev;
      prev = cur;
      cur = tmp;
    }
  }

  return { width, height, data: out, format: "png" };
}
