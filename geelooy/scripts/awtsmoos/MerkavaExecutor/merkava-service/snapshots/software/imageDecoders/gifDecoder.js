// B"H
/**
 * @file gifDecoder.js
 * @description
 * From-scratch GIF87a / GIF89a decoder for the Merkava browser's
 * image-decoding subsystem. No npm dependencies, ES module.
 *
 * decodeGif(bytes: Uint8Array) ->
 *   {
 *     width, height,                    // logical screen size
 *     frames: [                         // >= 1; each FULL-CANVAS composited RGBA
 *       { data: Uint8ClampedArray, delayMs: number, disposal: 0|1|2|3,
 *         left, top, width, height }     // frame's sub-rect (data is full canvas)
 *     ],
 *     loopCount: number,                // 0 = infinite
 *     format: 'gif'
 *   }
 * Throws an Error (never crashes the process) on invalid or truncated input.
 *
 * Supported: GIF87a/GIF89a headers, Logical Screen Descriptor, global and
 * local color tables, Graphic Control Extension (disposal method, delay in
 * 1/100s -> ms, transparent color index), NETSCAPE2.0 application extension
 * (loop count), standard GIF LZW (clear/EOI codes, code size growth to 12
 * bits, dictionary reset on clear), 4-pass interlacing, and frame
 * compositing with disposal methods 0 (keep), 1 (keep), 2 (restore
 * background), 3 (restore previous canvas). All other extensions are skipped
 * via sub-block chaining.
 */

// Sanity caps so hostile headers cannot force absurd allocations.
const MAX_DIMENSION = 16384;
const MAX_PIXELS = 16777216; // 16 megapixels

const TRAILER = 0x3b;
const EXT_INTRODUCER = 0x21;
const IMAGE_SEPARATOR = 0x2c;
const GCE_LABEL = 0xf9;
const APP_LABEL = 0xff;

const MAX_LZW_CODES = 4096; // 12-bit codes

// GIF interlace passes: rows start at `start`, advancing by `step`.
const INTERLACE_PASSES = [
  [0, 8],
  [4, 8],
  [2, 4],
  [1, 2],
];

class Reader {
  constructor(bytes) {
    this.b = bytes;
    this.p = 0;
  }
  get remaining() {
    return this.b.length - this.p;
  }
  u8() {
    if (this.p >= this.b.length) {
      throw new Error("decodeGif: truncated input (unexpected end of data)");
    }
    return this.b[this.p++];
  }
  u16() {
    const lo = this.u8();
    const hi = this.u8();
    return lo | (hi << 8);
  }
  bytes(n) {
    if (this.p + n > this.b.length) {
      throw new Error("decodeGif: truncated input (unexpected end of data)");
    }
    const s = this.b.subarray(this.p, this.p + n);
    this.p += n;
    return s;
  }
  skip(n) {
    if (this.p + n > this.b.length) {
      throw new Error("decodeGif: truncated input (unexpected end of data)");
    }
    this.p += n;
  }
  /** Read chained sub-blocks (size byte, data..., 0 terminator), concatenated. */
  subBlocks() {
    const parts = [];
    let total = 0;
    for (;;) {
      const size = this.u8();
      if (size === 0) break;
      const chunk = this.bytes(size);
      parts.push(chunk);
      total += size;
    }
    const out = new Uint8Array(total);
    let o = 0;
    for (let i = 0; i < parts.length; i++) {
      out.set(parts[i], o);
      o += parts[i].length;
    }
    return out;
  }
  /** Skip chained sub-blocks without copying. */
  skipSubBlocks() {
    for (;;) {
      const size = this.u8();
      if (size === 0) break;
      this.skip(size);
    }
  }
}

/**
 * Standard GIF LZW decode. Reads LSB-first codes from `data`, starting with
 * a clear code of (1 << minCodeSize) and EOI of clear+1. The dictionary grows
 * from minCodeSize+1 bits up to 12 bits and resets on clear. Returns exactly
 * `expected` color indices.
 *
 * Code-size growth timing follows the reference encoder behavior (verified
 * against Pillow's GifEncode.c): the width grows the moment the incoming
 * entry's code value reaches 2^codeSize, i.e. the check happens BEFORE the
 * new entry is assigned, so the wider size applies to the next code read.
 */
function lzwDecode(data, minCodeSize, expected) {
  if (minCodeSize < 1 || minCodeSize > 8) {
    throw new Error("decodeGif: invalid LZW minimum code size " + minCodeSize);
  }
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;

  // Dictionary as prefix/suffix chains plus the first char of each entry.
  const prefix = new Int32Array(MAX_LZW_CODES);
  const suffix = new Uint8Array(MAX_LZW_CODES);
  const first = new Uint8Array(MAX_LZW_CODES);
  for (let i = 0; i < clear; i++) {
    prefix[i] = -1;
    suffix[i] = i;
    first[i] = i;
  }

  const out = new Uint8Array(expected);
  const stack = new Uint8Array(MAX_LZW_CODES); // reversed emission buffer
  let outLen = 0;
  let codeSize = minCodeSize + 1;
  let nextCode = eoi + 1;
  let bitPos = 0;
  let prev = -1;
  const dataLen = data.length;

  for (;;) {
    // Grow the code width BEFORE reading, when the next dictionary code value
    // would need it. This mirrors reference encoders (verified against
    // Pillow's GifEncode.c): the encoder widens immediately after the insert
    // that fills the current width, so the very next emitted code uses the
    // wider size -- the decoder must do the same before reading it.
    // (No growth on the first code after a clear: prev === -1 there.)
    if (prev !== -1 && codeSize < 12 && nextCode >= 1 << codeSize) {
      codeSize++;
    }

    // Read one code, LSB-first, at the current code width.
    let code = 0;
    let br = 0;
    const cs = codeSize;
    while (br < cs) {
      const bi = bitPos >> 3;
      if (bi >= dataLen) {
        // Tolerate a missing EOI only when the pixel count is already exact.
        if (outLen === expected) return out;
        throw new Error("decodeGif: truncated LZW data");
      }
      const bit = bitPos & 7;
      let take = 8 - bit;
      const need = cs - br;
      if (take > need) take = need;
      code |= ((data[bi] >> bit) & ((1 << take) - 1)) << br;
      br += take;
      bitPos += take;
    }

    if (code === clear) {
      codeSize = minCodeSize + 1;
      nextCode = eoi + 1;
      prev = -1;
      continue;
    }
    if (code === eoi) break;

    // Emit the entry's index string via the reversed chain stack.
    let emitFirst;
    let n = 0;
    if (code < nextCode) {
      let c = code;
      while (prefix[c] !== -1) {
        stack[n++] = suffix[c];
        c = prefix[c];
      }
      stack[n++] = suffix[c];
      emitFirst = first[code];
    } else if (code === nextCode && prev !== -1) {
      // KwKwK case: the string is prev's string plus its first character.
      // The stack holds the string in reverse (read from n-1 down to 0), so
      // the appended first-character must be pushed FIRST to land at the end.
      const f = first[prev];
      stack[n++] = f;
      let c = prev;
      while (prefix[c] !== -1) {
        stack[n++] = suffix[c];
        c = prefix[c];
      }
      stack[n++] = suffix[c];
      emitFirst = f;
    } else {
      throw new Error("decodeGif: invalid LZW code " + code);
    }

    if (outLen + n > expected) {
      throw new Error("decodeGif: LZW stream produced more pixels than expected");
    }
    for (let i = n - 1; i >= 0; i--) {
      out[outLen++] = stack[i];
    }

    if (prev !== -1 && nextCode < MAX_LZW_CODES) {
      prefix[nextCode] = prev;
      suffix[nextCode] = emitFirst;
      first[nextCode] = first[prev];
      nextCode++;
    }
    prev = code;
  }

  if (outLen !== expected) {
    throw new Error(
      "decodeGif: LZW stream produced " + outLen + " pixels, expected " + expected
    );
  }
  return out;
}

function defaultGce() {
  return { disposal: 0, delayCs: 0, transFlag: false, transIndex: 0 };
}

export function decodeGif(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error("decodeGif: bytes must be a Uint8Array");
  }
  const r = new Reader(bytes);

  const sig =
    String.fromCharCode(r.u8(), r.u8(), r.u8()) +
    String.fromCharCode(r.u8(), r.u8(), r.u8());
  if (sig !== "GIF87a" && sig !== "GIF89a") {
    throw new Error("decodeGif: bad header signature");
  }

  const width = r.u16();
  const height = r.u16();
  if (width === 0 || height === 0 || width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new Error("decodeGif: invalid logical screen size " + width + "x" + height);
  }
  if (width * height > MAX_PIXELS) {
    throw new Error("decodeGif: logical screen too large");
  }
  const packed = r.u8();
  const bgIndex = r.u8();
  r.u8(); // pixel aspect ratio (unused)

  let gct = null;
  if (packed & 0x80) {
    const nColors = 1 << ((packed & 0x07) + 1);
    gct = r.bytes(nColors * 3);
  }

  // Background color for disposal method 2 (opaque from the GCT when present).
  let bgR = 0,
    bgG = 0,
    bgB = 0,
    bgA = 0;
  if (gct && bgIndex * 3 + 2 < gct.length) {
    bgR = gct[bgIndex * 3];
    bgG = gct[bgIndex * 3 + 1];
    bgB = gct[bgIndex * 3 + 2];
    bgA = 255;
  }

  const canvas = new Uint8ClampedArray(width * height * 4);
  if (bgA === 255) {
    for (let i = 0; i < canvas.length; i += 4) {
      canvas[i] = bgR;
      canvas[i + 1] = bgG;
      canvas[i + 2] = bgB;
      canvas[i + 3] = 255;
    }
  }

  const frames = [];
  let loopCount = 0;
  let gce = defaultGce();
  let backup = null; // canvas snapshot for disposal method 3

  while (r.remaining > 0) {
    const sep = r.u8();

    if (sep === TRAILER) break;

    if (sep === EXT_INTRODUCER) {
      const label = r.u8();
      if (label === GCE_LABEL) {
        const blockSize = r.u8();
        if (blockSize !== 4) {
          throw new Error("decodeGif: invalid Graphic Control Extension");
        }
        const gp = r.u8();
        const delayCs = r.u16();
        const transIndex = r.u8();
        const term = r.u8();
        if (term !== 0) {
          throw new Error("decodeGif: invalid Graphic Control Extension");
        }
        let disposal = (gp >> 2) & 0x07;
        if (disposal > 3) disposal = 0; // reserved values behave as "keep"
        gce = {
          disposal,
          delayCs,
          transFlag: (gp & 0x01) !== 0,
          transIndex,
        };
      } else if (label === APP_LABEL) {
        const idSize = r.u8();
        const id = r.bytes(idSize);
        const want = "NETSCAPE2.0";
        let isNetscape = idSize === 11;
        if (isNetscape) {
          for (let i = 0; i < 11; i++) {
            if (id[i] !== want.charCodeAt(i)) {
              isNetscape = false;
              break;
            }
          }
        }
        const data = r.subBlocks();
        if (isNetscape && data.length >= 3 && data[0] === 1) {
          loopCount = data[1] | (data[2] << 8);
        }
      } else {
        // Comment, plain-text, and unknown extensions: skip via sub-blocks.
        r.skipSubBlocks();
      }
      continue;
    }

    if (sep === IMAGE_SEPARATOR) {
      const left = r.u16();
      const top = r.u16();
      const iw = r.u16();
      const ih = r.u16();
      if (iw === 0 || ih === 0 || iw > MAX_DIMENSION || ih > MAX_DIMENSION) {
        throw new Error("decodeGif: invalid image dimensions " + iw + "x" + ih);
      }
      if (iw * ih > MAX_PIXELS) {
        throw new Error("decodeGif: image too large");
      }
      const ip = r.u8();

      let lct = null;
      if (ip & 0x80) {
        const nColors = 1 << ((ip & 0x07) + 1);
        lct = r.bytes(nColors * 3);
      }
      const table = lct || gct;
      if (!table) {
        throw new Error("decodeGif: image has no color table");
      }
      const interlaced = (ip & 0x40) !== 0;
      const minCodeSize = r.u8();
      const lzwData = r.subBlocks();

      const count = iw * ih;
      const stream = lzwDecode(lzwData, minCodeSize, count);

      // De-interlace into row-major order when needed.
      let idx;
      if (interlaced) {
        idx = new Uint8Array(count);
        let p = 0;
        for (let pass = 0; pass < 4; pass++) {
          const start = INTERLACE_PASSES[pass][0];
          const step = INTERLACE_PASSES[pass][1];
          for (let y = start; y < ih; y += step) {
            idx.set(stream.subarray(p, p + iw), y * iw);
            p += iw;
          }
        }
      } else {
        idx = stream;
      }

      // Snapshot for disposal method 3 (restore previous canvas) before drawing.
      if (gce.disposal === 3) {
        backup = canvas.slice();
      }

      // Composite the sub-rect onto the canvas; the transparent index leaves
      // the underlying pixel untouched. The rect is clipped to the screen.
      const trans = gce.transFlag ? gce.transIndex : -1;
      const tlen = table.length;
      const x0 = Math.max(0, left);
      const y0 = Math.max(0, top);
      const x1 = Math.min(width, left + iw);
      const y1 = Math.min(height, top + ih);
      for (let y = y0; y < y1; y++) {
        const srow = (y - top) * iw - left;
        let o = (y * width + x0) * 4;
        for (let x = x0; x < x1; x++) {
          const ci = idx[srow + x];
          if (ci === trans) {
            o += 4;
            continue;
          }
          const to = ci * 3;
          if (to + 2 >= tlen) {
            o += 4; // index outside the table: leave pixel alone
            continue;
          }
          canvas[o] = table[to];
          canvas[o + 1] = table[to + 1];
          canvas[o + 2] = table[to + 2];
          canvas[o + 3] = 255;
          o += 4;
        }
      }

      frames.push({
        data: canvas.slice(), // full-canvas composited RGBA
        delayMs: gce.delayCs * 10,
        disposal: gce.disposal,
        left,
        top,
        width: iw,
        height: ih,
      });

      // Apply this frame's disposal method to the canvas for the next frame.
      if (gce.disposal === 2) {
        for (let y = y0; y < y1; y++) {
          let o = (y * width + x0) * 4;
          for (let x = x0; x < x1; x++) {
            canvas[o] = bgR;
            canvas[o + 1] = bgG;
            canvas[o + 2] = bgB;
            canvas[o + 3] = bgA;
            o += 4;
          }
        }
      } else if (gce.disposal === 3) {
        if (backup) canvas.set(backup);
      }

      gce = defaultGce();
      continue;
    }

    throw new Error("decodeGif: invalid block separator 0x" + sep.toString(16));
  }

  if (frames.length === 0) {
    throw new Error("decodeGif: no image data found");
  }
  return { width, height, frames, loopCount, format: "gif" };
}
