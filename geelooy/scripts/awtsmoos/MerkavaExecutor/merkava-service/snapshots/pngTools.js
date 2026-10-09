// B"H
/**
 * @file pngTools.js
 * @description
 * The Awtsmoos paints without dependencies. These helpers write minimal RGB
 * PNGs from rectangles so a headless-free Merkava realm can still hand vision
 * models a real image file, not a fake promise.
 */
import zlib from "zlib";

export function crc32(buffer) {
  let c = ~0;
  for (const byte of buffer) {
    c ^= byte;
    for (let bit = 0; bit < 8; bit++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

export function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

export function rgbPng(width, height, painter) {
  const rowSize = width * 3 + 1;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const row = y * rowSize;
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const color = painter(x, y);
      const i = row + 1 + x * 3;
      raw[i] = color[0];
      raw[i + 1] = color[1];
      raw[i + 2] = color[2];
    }
  }
  return pngFromRaw(raw, width, height);
}

// B"H 2026-10-09 (speed): rgbPng's per-pixel callback cost ~1.3s for 800x600
// (480k closure calls + array allocs per pixel). When the source is already
// an RGBA Uint8ClampedArray (the framebuffer), copy straight into RGB rows:
// ~33ms for the same image. 23-40x faster.
export function rgbPngFromRgba(rgba, width, height) {
  const rowSize = width * 3 + 1;
  const raw = Buffer.allocUnsafe(rowSize * height);
  for (let y = 0; y < height; y++) {
    const row = y * rowSize;
    raw[row] = 0;
    let o = row + 1;
    const base = y * width * 4;
    for (let x = 0; x < width; x++) {
      const i = base + x * 4;
      raw[o++] = rgba[i];
      raw[o++] = rgba[i + 1];
      raw[o++] = rgba[i + 2];
    }
  }
  return pngFromRaw(raw, width, height);
}

// B"H 2026-10-09 (speed): downsample a 2x/3x/4x supersampled RGBA buffer to
// width×height RGB rows with box averaging — no per-pixel closures, no
// intermediate arrays. Used by the supersampled PNG path.
export function rgbPngDownsampled(rgba, srcWidth, scale, width, height) {
  const rowSize = width * 3 + 1;
  const raw = Buffer.allocUnsafe(rowSize * height);
  const total = scale * scale;
  for (let y = 0; y < height; y++) {
    const row = y * rowSize;
    raw[row] = 0;
    let o = row + 1;
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let yy = 0; yy < scale; yy++) {
        const brow = (y * scale + yy) * srcWidth * 4;
        for (let xx = 0; xx < scale; xx++) {
          const i = brow + (x * scale + xx) * 4;
          r += rgba[i]; g += rgba[i + 1]; b += rgba[i + 2];
        }
      }
      raw[o++] = Math.round(r / total);
      raw[o++] = Math.round(g / total);
      raw[o++] = Math.round(b / total);
    }
  }
  return pngFromRaw(raw, width, height);
}

function pngFromRaw(raw, width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

export function dataUrlFromPng(buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
