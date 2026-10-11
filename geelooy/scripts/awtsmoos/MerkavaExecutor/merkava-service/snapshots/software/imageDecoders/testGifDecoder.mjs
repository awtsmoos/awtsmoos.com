// B"H
/**
 * @file testGifDecoder.mjs
 * @description Self-tests for gifDecoder.js. Run with: node testGifDecoder.mjs
 *
 * Every test GIF is hand-crafted in this file: headers, descriptors, and
 * extensions are assembled byte by byte, and the LZW streams for the tiny
 * cases are verified against fully hand-computed bit layouts
 * ([0x44,0x34,0x05] and [0x86,0x01], see below). A small literal-only LZW
 * encoder builds streams for the larger cases.
 */
import { decodeGif } from "./gifDecoder.js";

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

// ---------------------------------------------------------------------------
// Tiny LZW encoder (literal-only, dictionary growth tracked in lockstep with
// the decoder, clear emitted when the 12-bit table fills). Used only to build
// test fixtures; the decoder under test never sees this code.
// ---------------------------------------------------------------------------
function lzwEncode(indices, minCodeSize) {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  const out = [];
  let acc = 0;
  let accBits = 0;
  const emit = (code, w) => {
    acc |= code << accBits;
    accBits += w;
    while (accBits >= 8) {
      out.push(acc & 0xff);
      acc >>>= 8;
      accBits -= 8;
    }
  };
  // Mirror the decoder's width/nextCode evolution exactly. The decoder widens
  // BEFORE reading a code when nextCode >= 2^width, and bumps nextCode after
  // every code except the first following a clear. The encoder emits each code
  // with the width the decoder will use to read it.
  emit(clear, minCodeSize + 1);
  let decW = minCodeSize + 1, decNextCode = eoi + 1, first = true;
  for (const p of indices) {
    if (!first && decW < 12 && decNextCode >= (1 << decW)) decW++;
    emit(p, decW);
    if (!first) {
      if (decNextCode >= 4096) {
        emit(clear, decW);
        decW = minCodeSize + 1; decNextCode = eoi + 1; first = true;
      } else decNextCode++;
    } else first = false;
  }
  if (!first && decW < 12 && decNextCode >= (1 << decW)) decW++;
  emit(eoi, decW);
  if (accBits > 0) out.push(acc & 0xff);
  return Uint8Array.from(out);
}

// ---------------------------------------------------------------------------
// Real compressing LZW encoder (dictionary matching, not literal-only).
// Dictionary add/growth discipline mirrors the decoder exactly: an entry is
// added after every emitted image code EXCEPT the first one following a
// clear, and the code width grows when nextCode exceeds 2^codeSize. Used to
// exercise the decoder's multi-character dictionary codes and the KwKwK
// (code == nextCode) path, which literal-only streams never trigger.
// ---------------------------------------------------------------------------
function lzwCompress(indices, minCodeSize) {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  const out = [];
  let acc = 0;
  let accBits = 0;
  const emit = (code, w) => {
    acc |= code << accBits;
    accBits += w;
    while (accBits >= 8) {
      out.push(acc & 0xff);
      acc >>>= 8;
      accBits -= 8;
    }
  };
  let dict;
  const resetDict = () => {
    dict = new Map();
    for (let i = 0; i < clear; i++) dict.set(String.fromCharCode(i), i);
  };
  resetDict();
  // decW/decNextCode mirror the DECODER's state evolution: the decoder widens
  // BEFORE reading a code when its nextCode >= 2^width, and bumps nextCode
  // after every code except the first following a clear. The encoder emits
  // each code with the width the decoder will use to read it, and performs
  // the dictionary insert (for its own compression) in lockstep.
  let decW, decNextCode, decFirst;
  const resetDec = () => {
    decW = minCodeSize + 1; decNextCode = eoi + 1; decFirst = true;
  };
  resetDec();
  emit(clear, decW);
  let w = null; // current match string
  let nextCode = eoi + 1; // compressor's own dictionary code counter
  for (const k of indices) {
    const ch = String.fromCharCode(k);
    if (w !== null && dict.has(w + ch)) {
      w = w + ch;
      continue;
    }
    if (w !== null) {
      if (!decFirst && decW < 12 && decNextCode >= (1 << decW)) decW++;
      emit(dict.get(w), decW);
      if (nextCode >= 4096) {
        // Table full: clear and restart, like a real encoder.
        if (!decFirst && decW < 12 && decNextCode >= (1 << decW)) decW++;
        emit(clear, decW);
        resetDict();
        nextCode = eoi + 1;
        resetDec();
        // The clear was just emitted; the next code is "first" again.
        // (w is reset below; decFirst already true from resetDec.)
      } else {
        // The compressor adds to its dictionary after EVERY emit (this drives
        // the compression matching). The decoder skips its add after the
        // first read, so decNextCode (the decoder's counter) only bumps after
        // the first emit. The code numbers still align: the compressor's k-th
        // add and the decoder's k-th add assign the same code to the same
        // string.
        dict.set(w + ch, nextCode++);
        if (!decFirst) decNextCode++;
        else decFirst = false;
      }
    }
    w = ch;
  }
  if (w !== null) {
    if (!decFirst && decW < 12 && decNextCode >= (1 << decW)) decW++;
    emit(dict.get(w), decW);
    if (!decFirst) decNextCode++;
  }
  if (decW < 12 && decNextCode >= (1 << decW)) decW++;
  emit(eoi, decW);
  if (accBits > 0) out.push(acc & 0xff);
  return Uint8Array.from(out);
}

// ---------------------------------------------------------------------------
// GIF byte builders
// ---------------------------------------------------------------------------
function concat(...arrays) {
  let total = 0;
  for (const a of arrays) total += a.length;
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrays) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}
function str(s) {
  const a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
}
function u16le(v) {
  return Uint8Array.of(v & 0xff, (v >> 8) & 0xff);
}
// colors: array of [r,g,b]; returns table padded to 2^n entries as declared
function colorTable(colors) {
  const n = 1 << Math.ceil(Math.log2(Math.max(1, colors.length)));
  const out = new Uint8Array(n * 3);
  for (let i = 0; i < colors.length; i++) {
    out[i * 3] = colors[i][0];
    out[i * 3 + 1] = colors[i][1];
    out[i * 3 + 2] = colors[i][2];
  }
  return { bytes: out, sizeBits: Math.log2(n) - 1 };
}
function lsd(w, h, gctInfo, bg) {
  const packed = gctInfo ? 0x80 | gctInfo.sizeBits : 0;
  return concat(u16le(w), u16le(h), Uint8Array.of(packed, bg || 0, 0));
}
function gce(disposal, delayCs, transFlag, transIdx) {
  return Uint8Array.of(
    0x21,
    0xf9,
    0x04,
    ((disposal & 7) << 2) | (transFlag ? 1 : 0),
    delayCs & 0xff,
    (delayCs >> 8) & 0xff,
    transIdx || 0,
    0x00
  );
}
function netscape(loop) {
  return concat(
    Uint8Array.of(0x21, 0xff, 0x0b),
    str("NETSCAPE2.0"),
    Uint8Array.of(0x03, 0x01, loop & 0xff, (loop >> 8) & 0xff, 0x00)
  );
}
function commentExt(text) {
  const b = str(text);
  return concat(Uint8Array.of(0x21, 0xfe, b.length), b, Uint8Array.of(0x00));
}
function imageDesc(left, top, w, h, opts) {
  opts = opts || {};
  let packed = 0;
  if (opts.lctInfo) packed |= 0x80 | opts.lctInfo.sizeBits;
  if (opts.interlaced) packed |= 0x40;
  return concat(
    Uint8Array.of(0x2c),
    u16le(left),
    u16le(top),
    u16le(w),
    u16le(h),
    Uint8Array.of(packed)
  );
}
// LZW data: min code size byte, then sub-blocks, then terminator.
function lzwBlock(minCodeSize, raw) {
  const parts = [Uint8Array.of(minCodeSize)];
  for (let i = 0; i < raw.length; i += 255) {
    const chunk = raw.subarray(i, Math.min(i + 255, raw.length));
    parts.push(Uint8Array.of(chunk.length), chunk);
  }
  parts.push(Uint8Array.of(0x00));
  return concat(...parts);
}
const TRAILER = Uint8Array.of(0x3b);

function px(data, w, x, y) {
  const o = (y * w + x) * 4;
  return [data[o], data[o + 1], data[o + 2], data[o + 3]];
}
function assertPx(data, w, x, y, rgba, msg) {
  const got = px(data, w, x, y);
  assert(
    got[0] === rgba[0] && got[1] === rgba[1] && got[2] === rgba[2] && got[3] === rgba[3],
    msg + " at (" + x + "," + y + "): got [" + got + "], want [" + rgba + "]"
  );
}

const RED = [255, 0, 0, 255];
const GREEN = [0, 255, 0, 255];
const BLUE = [0, 0, 255, 255];
const WHITE = [255, 255, 255, 255];
const BLACK = [0, 0, 0, 255];

// ---------------------------------------------------------------------------
// 1. The test LZW encoder must reproduce fully hand-computed bit layouts.
// ---------------------------------------------------------------------------
// Indices [0,1,2,3], minCodeSize=2: clear=4, eoi=5, nextCode starts at 6.
// Codes emitted: 4(3b) 0(3b) 1(3b) 2(3b) 3(3b), then the dictionary grows the
// Indices [0,1,2,3], minCodeSize=2: clear=4, eoi=5. Code stream with widths:
// 4(3b) 0(3b) 1(3b) 2(3b), then the decoder widens BEFORE reading the 5th
// code (nextCode 8 >= 2^3), so 3(4b) 5(4b).
// LSB-first packing:
//   4 -> 0,0,1 | 0 -> 0,0,0 | 1 -> 1,0,0 | 2 -> 0,1,0 | 3 -> 1,1,0,0 | 5 -> 1,0,1,0
//   byte0 = bits[0..7]   = 0,0,1,0,0,0,1,0 = 0x44
//   byte1 = bits[8..15]  = 0,0,1,0,1,1,0,0 = 0x34
//   byte2 = bits[16..19] = 1,0,1,0         = 0x05
t("encoder matches hand-computed LZW bits for [0,1,2,3]/min=2", () => {
  const got = lzwEncode([0, 1, 2, 3], 2);
  const want = Uint8Array.of(0x44, 0x34, 0x05);
  assert(got.length === want.length, "length " + got.length);
  for (let i = 0; i < want.length; i++) assert(got[i] === want[i], "byte " + i);
});

// Indices [1,0], minCodeSize=1: clear=2, eoi=3. Code stream with widths:
// 2(2b) 1(2b), then the decoder widens BEFORE reading the 3rd code
// (nextCode 4 >= 2^2), so 0(3b) 3(3b):
//   2 -> 0,1 | 1 -> 1,0 | 0 -> 0,0,0 | 3 -> 1,1,0
//   byte0 = bits[0..7] = 0,1,1,0,0,0,0,1 = 0x86 ; byte1 = bits[8..9] = 1,0 = 0x01
t("encoder matches hand-computed LZW bits for [1,0]/min=1", () => {
  const got = lzwEncode([1, 0], 1);
  const want = Uint8Array.of(0x86, 0x01);
  assert(got.length === want.length, "length " + got.length);
  for (let i = 0; i < want.length; i++) assert(got[i] === want[i], "byte " + i);
});

// ---------------------------------------------------------------------------
// 2. 2x2, 4-color GCT, hand-computed LZW bytes -> exact RGBA pixels.
// ---------------------------------------------------------------------------
t("2x2 exact pixels via hand-computed LZW stream", () => {
  const g = colorTable([
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 255],
  ]);
  const gif = concat(
    str("GIF89a"),
    lsd(2, 2, g, 0),
    g.bytes,
    imageDesc(0, 0, 2, 2),
    // minCodeSize=2, one 3-byte sub-block with the hand-computed stream, terminator
    Uint8Array.of(0x02, 0x03, 0x44, 0x34, 0x05, 0x00),
    TRAILER
  );
  const d = decodeGif(gif);
  assert(d.width === 2 && d.height === 2, "dims");
  assert(d.format === "gif", "format");
  assert(d.frames.length === 1, "one frame");
  assert(d.loopCount === 0, "default loop count");
  const f = d.frames[0];
  assert(f.delayMs === 0 && f.disposal === 0, "default gce");
  assert(f.left === 0 && f.top === 0 && f.width === 2 && f.height === 2, "sub-rect");
  assert(f.data.length === 16, "full-canvas data length");
  // indices row0: 0,1 row1: 2,3
  assertPx(f.data, 2, 0, 0, RED, "2x2");
  assertPx(f.data, 2, 1, 0, GREEN, "2x2");
  assertPx(f.data, 2, 0, 1, BLUE, "2x2");
  assertPx(f.data, 2, 1, 1, WHITE, "2x2");
});

// ---------------------------------------------------------------------------
// 3. Interlaced 8x8 with a known pattern -> exact pixels after de-interlace.
// ---------------------------------------------------------------------------
t("interlaced 8x8 decodes to exact pattern", () => {
  const pal = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 255],
  ];
  const g = colorTable(pal);
  const W = 8;
  const H = 8;
  const pat = (x, y) => (x * 3 + y * 5) % 4;
  // LZW stream order follows the 4 interlace passes.
  const order = [];
  const passes = [
    [0, 8],
    [4, 8],
    [2, 4],
    [1, 2],
  ];
  for (const [start, step] of passes) {
    for (let y = start; y < H; y += step) {
      for (let x = 0; x < W; x++) order.push(pat(x, y));
    }
  }
  const gif = concat(
    str("GIF89a"),
    lsd(W, H, g, 0),
    g.bytes,
    commentExt("hello"), // unknown-ish extension must be skipped harmlessly
    imageDesc(0, 0, W, H, { interlaced: true }),
    lzwBlock(2, lzwEncode(order, 2)),
    TRAILER
  );
  const d = decodeGif(gif);
  assert(d.width === W && d.height === H, "dims");
  const f = d.frames[0];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = pal[pat(x, y)];
      assertPx(f.data, W, x, y, [c[0], c[1], c[2], 255], "interlaced");
    }
  }
});

// ---------------------------------------------------------------------------
// 4. Two-frame animation: sub-rect + disposal=2 + delay + transparent index,
//    plus NETSCAPE2.0 loop count.
// ---------------------------------------------------------------------------
function buildAnim2() {
  const g = colorTable([
    [0, 0, 0], // 0 black (background)
    [0, 255, 0], // 1 green (transparent)
    [0, 0, 255], // 2 blue
    [255, 0, 0], // 3 red
  ]);
  const f1idx = new Array(16).fill(3);
  const f2idx = [2, 1, 1, 2]; // 2x2 at (1,1): blue corners, transparent rest
  return concat(
    str("GIF89a"),
    lsd(4, 4, g, 0),
    g.bytes,
    netscape(3),
    gce(2, 5, true, 1), // disposal=2, 5cs = 50ms, transparent idx 1
    imageDesc(0, 0, 4, 4),
    lzwBlock(2, lzwEncode(f1idx, 2)),
    gce(1, 7, true, 1), // disposal=1, 7cs = 70ms, transparent idx 1
    imageDesc(1, 1, 2, 2),
    lzwBlock(2, lzwEncode(f2idx, 2)),
    TRAILER
  );
}

t("2-frame animation: compositing, disposal=2, delay, transparency, loop", () => {
  const d = decodeGif(buildAnim2());
  assert(d.width === 4 && d.height === 4, "dims");
  assert(d.frames.length === 2, "two frames");
  assert(d.loopCount === 3, "NETSCAPE loop count, got " + d.loopCount);

  const f1 = d.frames[0];
  assert(f1.delayMs === 50, "frame1 delay 50ms, got " + f1.delayMs);
  assert(f1.disposal === 2, "frame1 disposal=2");
  assert(f1.left === 0 && f1.top === 0 && f1.width === 4 && f1.height === 4, "f1 rect");
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < 4; x++) assertPx(f1.data, 4, x, y, RED, "frame1 all red");

  const f2 = d.frames[1];
  assert(f2.delayMs === 70, "frame2 delay 70ms, got " + f2.delayMs);
  assert(f2.disposal === 1, "frame2 disposal=1");
  assert(f2.left === 1 && f2.top === 1 && f2.width === 2 && f2.height === 2, "f2 rect");
  // Frame 1 was disposal=2, so the canvas was restored to black before frame 2.
  // Frame 2 draws blue at (1,1) and (2,2); transparent pixels keep the black.
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const want = (x === 1 && y === 1) || (x === 2 && y === 2) ? BLUE : BLACK;
      assertPx(f2.data, 4, x, y, want, "frame2 composited");
    }
  }
});

// ---------------------------------------------------------------------------
// 5. Disposal method 3 restores the previous canvas.
// ---------------------------------------------------------------------------
t("disposal=3 restores previous canvas", () => {
  const g = colorTable([
    [0, 0, 0],
    [255, 0, 0],
    [0, 0, 255],
  ]);
  const gif = concat(
    str("GIF89a"),
    lsd(4, 4, g, 0),
    g.bytes,
    // frame 1: full canvas red, disposal 0
    imageDesc(0, 0, 4, 4),
    lzwBlock(2, lzwEncode(new Array(16).fill(1), 2)),
    // frame 2: blue 2x2 rect at (1,1), disposal 3
    gce(3, 0, false, 0),
    imageDesc(1, 1, 2, 2),
    lzwBlock(2, lzwEncode([2, 2, 2, 2], 2)),
    // frame 3: full canvas, everything transparent -> draws nothing
    gce(0, 0, true, 0),
    imageDesc(0, 0, 4, 4),
    lzwBlock(2, lzwEncode(new Array(16).fill(0), 2)),
    TRAILER
  );
  const d = decodeGif(gif);
  assert(d.frames.length === 3, "three frames");
  const [f1, f2, f3] = d.frames;
  assert(f2.disposal === 3, "f2 disposal");
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < 4; x++) {
      assertPx(f1.data, 4, x, y, RED, "f1 red");
      const inRect = x >= 1 && x <= 2 && y >= 1 && y <= 2;
      assertPx(f2.data, 4, x, y, inRect ? BLUE : RED, "f2 blue rect");
      assertPx(f3.data, 4, x, y, RED, "f3 restored to red");
    }
});

// ---------------------------------------------------------------------------
// 6. Local color table with no global color table.
// ---------------------------------------------------------------------------
t("local color table without a global color table", () => {
  const l = colorTable([
    [10, 20, 30],
    [40, 50, 60],
  ]);
  const gif = concat(
    str("GIF89a"),
    lsd(2, 1, null, 0), // no GCT
    imageDesc(0, 0, 2, 1, { lctInfo: l }),
    l.bytes,
    // hand-computed stream for indices [1,0], min=1
    Uint8Array.of(0x01, 0x02, 0x86, 0x01, 0x00),
    TRAILER
  );
  const d = decodeGif(gif);
  assert(d.width === 2 && d.height === 1, "dims");
  const f = d.frames[0];
  assertPx(f.data, 2, 0, 0, [40, 50, 60, 255], "lct idx 1");
  assertPx(f.data, 2, 1, 0, [10, 20, 30, 255], "lct idx 0");
});

// ---------------------------------------------------------------------------
// 6b. Compressing-LZW round trips: multi-character dictionary codes and the
// KwKwK path (code == nextCode), which literal-only streams never trigger.
// ---------------------------------------------------------------------------
function gifFromIndices(w, h, pal, indices, minCodeSize, compress) {
  const g = colorTable(pal);
  return concat(
    str("GIF89a"),
    lsd(w, h, g, 0),
    g.bytes,
    imageDesc(0, 0, w, h),
    lzwBlock(minCodeSize, compress ? lzwCompress(indices, minCodeSize) : lzwEncode(indices, minCodeSize)),
    TRAILER
  );
}
function assertIndicesPixels(d, w, pal, indices, msg) {
  const f = d.frames[0];
  assert(f.data.length === indices.length * 4, msg + ": pixel count");
  for (let i = 0; i < indices.length; i++) {
    const c = pal[indices[i]];
    const x = i % w;
    const y = (i / w) | 0;
    assertPx(f.data, w, x, y, [c[0], c[1], c[2], 255], msg);
  }
}

t("dictionary codes round-trip on repetitive data", () => {
  const pal = [
    [10, 20, 30],
    [40, 50, 60],
    [70, 80, 90],
    [100, 110, 120],
  ];
  // Runs + ABAB-style alternation: forces multi-char codes and KwKwK cases.
  const idx = [];
  for (let i = 0; i < 24; i++) idx.push(1); // long run of 1s
  for (let i = 0; i < 24; i++) idx.push(i % 2); // 0,1,0,1,...
  for (let i = 0; i < 16; i++) idx.push((i * i) % 4);
  const d = decodeGif(gifFromIndices(8, 8, pal, idx, 2, true));
  assertIndicesPixels(d, 8, pal, idx, "dict round-trip");
  // Sanity: the compressed stream really did use dictionary codes.
  const raw = lzwCompress(idx, 2);
  const lit = lzwEncode(idx, 2);
  assert(raw.length < lit.length, "compressed smaller than literal (" + raw.length + " < " + lit.length + ")");
});

t("fuzz: compressing-LZW round trips exact over random patterns", () => {
  let seed = 123456789;
  const rnd = (n) => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n;
  for (let trial = 0; trial < 200; trial++) {
    const min = 1 + rnd(8); // 1..8
    const nColors = 1 << min;
    const len = 1 + rnd(300);
    const idx = [];
    for (let i = 0; i < len; i++) {
      const r = rnd(10);
      if (r < 4 && i > 0) idx.push(idx[i - 1]); // runs (KwKwK-prone)
      else if (r < 6) idx.push((i * 3 + trial) % nColors); // cycles
      else idx.push(rnd(nColors)); // noise
    }
    const pal = [];
    for (let i = 0; i < nColors; i++) pal.push([(i * 37) % 256, (i * 91) % 256, (i * 53) % 256]);
    const d = decodeGif(gifFromIndices(len, 1, pal, idx, min, true));
    assertIndicesPixels(d, len, pal, idx, "fuzz trial " + trial);
  }
});

// ---------------------------------------------------------------------------
// 7. Invalid / truncated input throws Error, never hangs.
// ---------------------------------------------------------------------------
t("empty input throws", () => {
  assertThrows(() => decodeGif(new Uint8Array(0)), "empty");
});
t("truncated header throws", () => {
  assertThrows(() => decodeGif(Uint8Array.of(0x47, 0x49, 0x46)), "short header");
});
t("bad signature throws", () => {
  assertThrows(() => decodeGif(str("NOTGIF89a")), "bad signature");
});
t("GIF87a signature accepted", () => {
  const g = colorTable([
    [1, 2, 3],
    [4, 5, 6],
  ]);
  const gif = concat(
    str("GIF87a"),
    lsd(1, 1, g, 0),
    g.bytes,
    imageDesc(0, 0, 1, 1),
    lzwBlock(1, lzwEncode([0], 1)),
    TRAILER
  );
  const d = decodeGif(gif);
  assert(d.width === 1 && d.frames.length === 1, "87a decodes");
});
t("truncated GCT throws", () => {
  const gif = concat(str("GIF89a"), lsd(2, 2, colorTable([[1, 2, 3]]), 0), Uint8Array.of(1, 2));
  assertThrows(() => decodeGif(gif), "truncated GCT");
});
t("truncated mid-LZW throws", () => {
  const full = buildAnim2();
  assertThrows(() => decodeGif(full.subarray(0, full.length - 12)), "truncated LZW");
});
t("header only throws (no image data)", () => {
  const g = colorTable([[1, 2, 3]]);
  const gif = concat(str("GIF89a"), lsd(1, 1, g, 0), g.bytes, TRAILER);
  assertThrows(() => decodeGif(gif), "no frames");
});
t("non-Uint8Array throws", () => {
  assertThrows(() => decodeGif("GIF89a"), "wrong type");
});
t("invalid block separator throws", () => {
  const g = colorTable([[1, 2, 3]]);
  const gif = concat(
    str("GIF89a"),
    lsd(1, 1, g, 0),
    g.bytes,
    Uint8Array.of(0x99),
    TRAILER
  );
  assertThrows(() => decodeGif(gif), "bad separator");
});

// ---------------------------------------------------------------------------
// 8. Speed: decode a 500x500 two-frame animated GIF.
// ---------------------------------------------------------------------------
t("500x500 animated GIF decodes fast and correctly", () => {
  const W = 500;
  const H = 500;
  const pal = [];
  for (let i = 0; i < 256; i++) pal.push([i, 255 - i, (i * 3) % 256]);
  const g = colorTable(pal);
  const mk = (f) => {
    const idx = new Uint8Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) idx[y * W + x] = (x * 7 + y * 13 + f * 5) % 256;
    return idx;
  };
  const gif = concat(
    str("GIF89a"),
    lsd(W, H, g, 0),
    g.bytes,
    netscape(0),
    gce(1, 10, false, 0),
    imageDesc(0, 0, W, H),
    lzwBlock(8, lzwEncode(mk(0), 8)),
    gce(1, 10, false, 0),
    imageDesc(0, 0, W, H),
    lzwBlock(8, lzwEncode(mk(1), 8)),
    TRAILER
  );
  const t0 = Date.now();
  const d = decodeGif(gif);
  const ms = Date.now() - t0;
  console.log("      decode time for 500x500x2: " + ms + "ms (" + gif.length + " bytes input)");
  assert(d.width === W && d.height === H, "dims");
  assert(d.frames.length === 2, "two frames");
  assert(d.loopCount === 0, "infinite loop");
  const check = (f, x, y) => {
    const i = (x * 7 + y * 13 + f * 5) % 256;
    assertPx(d.frames[f].data, W, x, y, [i, 255 - i, (i * 3) % 256, 255], "speed px f" + f);
  };
  check(0, 0, 0);
  check(0, 499, 499);
  check(0, 123, 321);
  check(1, 0, 0);
  check(1, 499, 499);
  check(1, 321, 123);
  assert(ms < 15000, "decode under 15s, took " + ms + "ms");
});

console.log("\n" + passed + " passed, " + failed + " failed");
if (failed > 0) process.exit(1);
