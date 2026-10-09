// B"H
/**
 * @file testPngDecoder.mjs
 * @description Self-tests for pngDecoder.js. Run with: node testPngDecoder.mjs
 */
import { deflateSync } from "zlib";
import { pngChunk, rgbPngFromRgba } from "../../pngTools.js";
import { decodePng } from "./pngDecoder.js";

const MAGIC = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

let passed = 0;
let failed = 0;

function t(name, fn) {
  try {
    fn();
    passed++;
    console.log("ok   - " + name);
  } catch (e) {
    failed++;
    console.log("FAIL - " + name + ": " + (e && e.message ? e.message : e));
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error("assert failed: " + msg);
}

function assertBytesEqual(actual, expected, msg) {
  assert(
    actual.length === expected.length,
    msg + " (length " + actual.length + " != " + expected.length + ")"
  );
  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i])
      throw new Error(
        msg + " (byte " + i + ": got " + actual[i] + ", want " + expected[i] + ")"
      );
  }
}

function assertThrows(fn, msg) {
  let threw = false;
  try {
    fn();
  } catch (e) {
    threw = true;
    assert(e instanceof Error, msg + " (threw non-Error)");
  }
  assert(threw, msg + " (did not throw)");
}

// --- hand-crafted PNG builders ---------------------------------------------

function ihdrChunk(w, h, bitDepth, colorType, interlace = 0) {
  const d = Buffer.alloc(13);
  d.writeUInt32BE(w, 0);
  d.writeUInt32BE(h, 4);
  d[8] = bitDepth;
  d[9] = colorType;
  d[10] = 0;
  d[11] = 0;
  d[12] = interlace;
  return pngChunk("IHDR", d);
}

function rawPng({ w, h, bitDepth, colorType, interlace = 0, raw, extra = [] }) {
  return Buffer.concat([
    MAGIC,
    ihdrChunk(w, h, bitDepth, colorType, interlace),
    ...extra,
    pngChunk("IDAT", deflateSync(Buffer.from(raw))),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// Encode RGBA pixels (Uint8ClampedArray) as color-type-6 PNG, filter 0 rows.
function rgbaPng(rgba, w, h) {
  const rowSize = w * 4 + 1;
  const raw = new Uint8Array(rowSize * h);
  for (let y = 0; y < h; y++) {
    const ro = y * rowSize;
    raw[ro] = 0;
    raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), ro + 1);
  }
  return rawPng({ w, h, bitDepth: 8, colorType: 6, raw });
}

// --- 1. RGBA round trip (1920x1080) + speed --------------------------------

t("RGBA round trip 1920x1080 byte-exact", () => {
  const w = 1920;
  const h = 1080;
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      rgba[i] = x & 255;
      rgba[i + 1] = y & 255;
      rgba[i + 2] = (x * 3 + y * 5) & 255;
      rgba[i + 3] = (x + y * 7) & 255;
    }
  }
  const png = rgbaPng(rgba, w, h);
  const t0 = performance.now();
  const out = decodePng(new Uint8Array(png));
  const ms = performance.now() - t0;
  console.log("       decode 1920x1080 RGBA: " + ms.toFixed(1) + " ms");
  assert(out.format === "png", "format");
  assert(out.width === w && out.height === h, "dims");
  assert(out.data instanceof Uint8ClampedArray, "data type");
  assertBytesEqual(out.data, rgba, "pixels");
});

// --- 2. rgbPngFromRgba round trip (type 2, alpha forced 255) ----------------

t("rgbPngFromRgba round trip 320x200", () => {
  const w = 320;
  const h = 200;
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = (i * 13) & 255;
    rgba[i * 4 + 1] = (i * 29) & 255;
    rgba[i * 4 + 2] = (i * 7) & 255;
    rgba[i * 4 + 3] = 200; // dropped by the RGB encoder
  }
  const png = rgbPngFromRgba(rgba, w, h);
  const out = decodePng(new Uint8Array(png));
  assert(out.width === w && out.height === h, "dims");
  const want = new Uint8ClampedArray(rgba);
  for (let i = 0; i < w * h; i++) want[i * 4 + 3] = 255;
  assertBytesEqual(out.data, want, "pixels");
});

// --- 3. 1-bit grayscale -----------------------------------------------------

t("1-bit grayscale 8x2", () => {
  // row0: 0,1,0,1,0,1,0,1 ; row1: 1,0,1,0,1,0,1,0
  const raw = Uint8Array.from([0, 0b01010101, 0, 0b10101010]);
  const out = decodePng(rawPng({ w: 8, h: 2, bitDepth: 1, colorType: 0, raw }));
  const want = new Uint8ClampedArray(8 * 2 * 4);
  for (let y = 0; y < 2; y++)
    for (let x = 0; x < 8; x++) {
      const v = (x + y) % 2 === 0 ? 0 : 255;
      const i = (y * 8 + x) * 4;
      want[i] = want[i + 1] = want[i + 2] = v;
      want[i + 3] = 255;
    }
  assertBytesEqual(out.data, want, "pixels");
});

// --- 4. 4-bit palette with tRNS ---------------------------------------------

t("4-bit palette + tRNS 4x2", () => {
  const plte = Buffer.from([
    255, 0, 0, // 0 red
    0, 255, 0, // 1 green
    0, 0, 255, // 2 blue
    255, 255, 255, // 3 white
  ]);
  const trns = Buffer.from([255, 128, 0]); // index 2 fully transparent
  const raw = Uint8Array.from([0, 0x01, 0x23, 0, 0x32, 0x10]);
  const png = rawPng({
    w: 4,
    h: 2,
    bitDepth: 4,
    colorType: 3,
    raw,
    extra: [pngChunk("PLTE", plte), pngChunk("tRNS", trns)],
  });
  const out = decodePng(png);
  const want = new Uint8ClampedArray([
    255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 0, 255, 255, 255, 255,
    255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 0, 128, 255, 0, 0, 255,
  ]);
  assertBytesEqual(out.data, want, "pixels");
});

// --- 5. 16-bit RGB (high byte kept) ------------------------------------------

t("16-bit RGB 2x1 takes high byte", () => {
  const raw = Uint8Array.from([
    0,
    0xab, 0xcd, 0x34, 0x12, 0x78, 0x00, // pixel 0
    0x01, 0xff, 0xfe, 0x00, 0x80, 0x80, // pixel 1
  ]);
  const out = decodePng(
    rawPng({ w: 2, h: 1, bitDepth: 16, colorType: 2, raw })
  );
  const want = new Uint8ClampedArray([
    0xab, 0x34, 0x78, 255,
    0x01, 0xfe, 0x80, 255,
  ]);
  assertBytesEqual(out.data, want, "pixels");
});

// --- 6. Adam7 interlaced 8x8 --------------------------------------------------

t("Adam7 interlaced 8x8 known pattern", () => {
  const w = 8;
  const h = 8;
  const ADAM7 = [
    [0, 0, 8, 8],
    [4, 0, 8, 8],
    [0, 4, 4, 8],
    [2, 0, 4, 4],
    [0, 2, 2, 4],
    [1, 0, 2, 2],
    [0, 1, 1, 2],
  ];
  const raw = [];
  for (const [x0, y0, dx, dy] of ADAM7) {
    const pw = Math.ceil((w - x0) / dx);
    const ph = Math.ceil((h - y0) / dy);
    for (let y = 0; y < ph; y++) {
      raw.push(0); // filter None
      for (let x = 0; x < pw; x++) raw.push((y0 + y * dy) * 8 + (x0 + x * dx));
    }
  }
  const out = decodePng(
    rawPng({ w, h, bitDepth: 8, colorType: 0, interlace: 1, raw })
  );
  const want = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = y * 8 + x;
      const i = (y * w + x) * 4;
      want[i] = want[i + 1] = want[i + 2] = v;
      want[i + 3] = 255;
    }
  assertBytesEqual(out.data, want, "pixels");
});

// --- 7. all filter types -------------------------------------------------------

function forwardFilter(orig, prev, bpp, type) {
  const n = orig.length;
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const a = i >= bpp ? orig[i - bpp] : 0;
    const bb = prev[i];
    const c = i >= bpp ? prev[i - bpp] : 0;
    let f;
    if (type === 0) f = orig[i];
    else if (type === 1) f = orig[i] - a;
    else if (type === 2) f = orig[i] - bb;
    else if (type === 3) f = orig[i] - ((a + bb) >> 1);
    else {
      const p = a + bb - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - bb);
      const pc = Math.abs(p - c);
      const pr = pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
      f = orig[i] - pr;
    }
    out[i] = f & 255;
  }
  return out;
}

t("all 5 filter types 4x5 RGB", () => {
  const w = 4;
  const h = 5;
  const bpp = 3;
  const origRows = [];
  for (let y = 0; y < h; y++) {
    const row = new Uint8Array(w * 3);
    for (let i = 0; i < row.length; i++) row[i] = (y * 37 + i * 11 + 5) & 255;
    origRows.push(row);
  }
  const raw = [];
  let prev = new Uint8Array(w * 3);
  for (let y = 0; y < h; y++) {
    raw.push(y); // filter type = row index (0..4)
    const f = forwardFilter(origRows[y], prev, bpp, y);
    for (const v of f) raw.push(v);
    prev = origRows[y];
  }
  const out = decodePng(
    rawPng({ w, h, bitDepth: 8, colorType: 2, raw })
  );
  const want = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      want[i] = origRows[y][x * 3];
      want[i + 1] = origRows[y][x * 3 + 1];
      want[i + 2] = origRows[y][x * 3 + 2];
      want[i + 3] = 255;
    }
  assertBytesEqual(out.data, want, "pixels");
});

// --- 8. gray+alpha ---------------------------------------------------------------

t("gray+alpha 2x1", () => {
  const raw = Uint8Array.from([0, 10, 200, 250, 77]);
  const out = decodePng(
    rawPng({ w: 2, h: 1, bitDepth: 8, colorType: 4, raw })
  );
  assertBytesEqual(
    out.data,
    new Uint8ClampedArray([10, 10, 10, 200, 250, 250, 250, 77]),
    "pixels"
  );
});

// --- 9. tRNS on grayscale and truecolor --------------------------------------------

t("tRNS grayscale 3x1", () => {
  const raw = Uint8Array.from([0, 5, 9, 200]);
  const png = rawPng({
    w: 3,
    h: 1,
    bitDepth: 8,
    colorType: 0,
    raw,
    extra: [pngChunk("tRNS", Buffer.from([0, 9]))],
  });
  const out = decodePng(png);
  assertBytesEqual(
    out.data,
    new Uint8ClampedArray([5, 5, 5, 255, 9, 9, 9, 0, 200, 200, 200, 255]),
    "pixels"
  );
});

t("tRNS truecolor 2x1", () => {
  const raw = Uint8Array.from([0, 10, 20, 30, 255, 0, 0]);
  const png = rawPng({
    w: 2,
    h: 1,
    bitDepth: 8,
    colorType: 2,
    raw,
    extra: [pngChunk("tRNS", Buffer.from([0, 255, 0, 0, 0, 0]))],
  });
  const out = decodePng(png);
  assertBytesEqual(
    out.data,
    new Uint8ClampedArray([10, 20, 30, 255, 255, 0, 0, 0]),
    "pixels"
  );
});

// --- 10. corrupt inputs --------------------------------------------------------------

t("corrupt: bad magic throws", () => {
  const png = Buffer.from(rgbaPng(new Uint8ClampedArray(16), 1, 1));
  png[0] ^= 1;
  assertThrows(() => decodePng(new Uint8Array(png)), "bad magic");
});

t("corrupt: truncated file throws", () => {
  const png = rgbaPng(new Uint8ClampedArray(64), 2, 2);
  assertThrows(
    () => decodePng(new Uint8Array(png.slice(0, png.length - 25))),
    "truncated"
  );
});

t("corrupt: bad CRC throws", () => {
  const png = Buffer.from(rgbaPng(new Uint8ClampedArray(64), 2, 2));
  const i = png.indexOf(Buffer.from("IDAT"));
  assert(i > 0, "found IDAT");
  png[i + 6] ^= 1; // corrupt one IDAT data byte, CRC now wrong
  assertThrows(() => decodePng(new Uint8Array(png)), "bad CRC");
});

t("corrupt: truncated chunk header throws", () => {
  assertThrows(() => decodePng(new Uint8Array(MAGIC).slice(0, 20)), "header");
});

t("corrupt: empty input throws", () => {
  assertThrows(() => decodePng(new Uint8Array(0)), "empty");
});

t("corrupt: unknown filter type throws", () => {
  const raw = Uint8Array.from([7, 1, 2, 3]); // filter 7 is invalid
  const png = rawPng({ w: 1, h: 1, bitDepth: 8, colorType: 2, raw });
  assertThrows(() => decodePng(png), "filter");
});

t("corrupt: palette image without PLTE throws", () => {
  const raw = Uint8Array.from([0, 0]);
  const png = rawPng({ w: 2, h: 1, bitDepth: 1, colorType: 3, raw });
  assertThrows(() => decodePng(png), "no PLTE");
});

t("corrupt: missing IEND throws", () => {
  const png = Buffer.from(rgbaPng(new Uint8ClampedArray(16), 1, 1));
  assertThrows(
    () => decodePng(new Uint8Array(png.slice(0, png.length - 12))),
    "no IEND"
  );
});

// --- summary ------------------------------------------------------------------

console.log("\n" + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
