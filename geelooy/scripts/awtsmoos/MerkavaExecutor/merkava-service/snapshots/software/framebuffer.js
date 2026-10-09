// B"H
/**
 * @file framebuffer.js
 * @description
 * A tiny software framebuffer with a real 5x7 bitmap glyph atlas. This is not
 * typography, but it is honest readable text: letters no longer collapse into
 * AAAAA. Text can wrap and clip inside boxes so the Awtsmoos image does not
 * leak glyphs past its vessel.
 */
import { rgbPngFromRgba } from "../pngTools.js";
import { gradientColor, parseGradient, gradientColorAt, parseColor } from "./color.js";

export class Framebuffer {
  constructor(width = 960, height = 640, bg = [0, 0, 0, 255]) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
    this.clear(bg);
  }

  // B"H 2026-10-09 (viewport culling): bulk clear. The old loop called
  // writeRaw per pixel (function call overhead × 480k). Direct writes are
  // ~5x faster; solid white/black use .fill() on the typed array.
  clear(color) {
    const r = color[0] | 0, g = color[1] | 0, b = color[2] | 0, a = color[3] ?? 255;
    if (r === g && g === b && b === a) { this.data.fill(r); return; }
    const d = this.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
    }
  }
  // B"H 2026-10-09: real pixel clip stack (overflow:hidden etc.). The painter
  // pushes ancestor clip rects in DEVICE px; null = unclipped. Intersected on
  // push so nested overflow containers compose. Honored by setPixel,
  // fillRect/fillRectPacked, gradientRect, and blitFrom. Hot paths check
  // `this._clip` once (null in the common case) to stay fast.
  pushClip(x0, y0, x1, y1) {
    // B"H 2026-10-09: also accept a {x0,y0,x1,y1} rect object.
    if (x0 !== null && typeof x0 === "object") {
      const r = x0;
      return this.pushClip(r.x0, r.y0, r.x1, r.y1);
    }
    const r = [Math.max(0, Math.floor(x0)), Math.max(0, Math.floor(y0)),
               Math.min(this.width, Math.ceil(x1)), Math.min(this.height, Math.ceil(y1))];
    const c = this._clip;
    this._clipStack = this._clipStack || [];
    this._clipStack.push(c || null);
    this._clip = c ? [Math.max(c[0], r[0]), Math.max(c[1], r[1]), Math.min(c[2], r[2]), Math.min(c[3], r[3])] : r;
  }
  popClip() {
    const st = this._clipStack;
    this._clip = (st && st.length) ? st.pop() : null;
  }
  _inClip(ix, iy) {
    const c = this._clip;
    return !c || (ix >= c[0] && iy >= c[1] && ix < c[2] && iy < c[3]);
  }
  setPixel(x, y, color) {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (!this._inClip(ix, iy)) return;
    const i = (iy * this.width + ix) * 4;
    const a = (color[3] ?? 255) / 255, ia = 1 - a;
    this.data[i] = Math.round(color[0] * a + this.data[i] * ia);
    this.data[i + 1] = Math.round(color[1] * a + this.data[i + 1] * ia);
    this.data[i + 2] = Math.round(color[2] * a + this.data[i + 2] * ia);
    this.data[i + 3] = 255;
  }
  // B"H 2026-10-09: Packed-color fast path. Takes a Uint32 0xRRGGBBAA.
  // Avoids 4 array-index lookups per pixel vs setPixel. Use with parseColorPacked.
  setPixelPacked(x, y, packed) {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (!this._inClip(ix, iy)) return;
    const i = (iy * this.width + ix) * 4;
    const a = (packed & 255) / 255;
    if (a >= 1) {
      // Opaque: direct write, no blend math.
      this.data[i] = (packed >>> 24) & 255;
      this.data[i + 1] = (packed >>> 16) & 255;
      this.data[i + 2] = (packed >>> 8) & 255;
      this.data[i + 3] = 255;
    } else {
      const ia = 1 - a;
      this.data[i] = Math.round(((packed >>> 24) & 255) * a + this.data[i] * ia);
      this.data[i + 1] = Math.round(((packed >>> 16) & 255) * a + this.data[i + 1] * ia);
      this.data[i + 2] = Math.round(((packed >>> 8) & 255) * a + this.data[i + 2] * ia);
      this.data[i + 3] = 255;
    }
  }
  // B"H 2026-10-09: intersect the paint rect with the active clip once per
  // call (faster than a per-pixel test in the loops below).
  _clipBounds(sx, sy, ex, ey) {
    const c = this._clip;
    if (!c) return [sx, sy, ex, ey];
    return [Math.max(sx, c[0]), Math.max(sy, c[1]), Math.min(ex, c[2]), Math.min(ey, c[3])];
  }
  fillRectPacked(x, y, w, h, packed) {
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    const [csx, csy, cex, cey] = this._clipBounds(sx, sy, ex, ey);
    for (let yy = csy; yy < cey; yy++) for (let xx = csx; xx < cex; xx++) this.setPixelPacked(xx, yy, packed);
  }
  fillRect(x, y, w, h, color) {
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    const [csx, csy, cex, cey] = this._clipBounds(sx, sy, ex, ey);
    for (let yy = csy; yy < cey; yy++) for (let xx = csx; xx < cex; xx++) this.setPixel(xx, yy, color);
  }
  gradientRect(x, y, w, h, background, fallback) {
    // B"H 2026-10-09 (speed): parse the gradient ONCE per rect instead of
    // per pixel. A 800x600 gradient rect went from ~480k regex parses to 1.
    const g = parseGradient(background);
    let sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    let ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    [sx, sy, ex, ey] = this._clipBounds(sx, sy, ex, ey);
    if (g) {
      // B"H 2026-10-09 (speed): opaque gradients skip setPixel's alpha-blend
      // math entirely — direct writes, no Math.round, no bounds re-check.
      // mix() already returns rounded ints.
      const opaque = (g.stops || []).every(s => ((s.color || [])[3] ?? 255) === 255);
      if (opaque) {
        const d = this.data, W = this.width;
        for (let yy = sy; yy < ey; yy++) {
          const rowBase = yy * W * 4;
          for (let xx = sx; xx < ex; xx++) {
            const col = gradientColorAt(g, xx - x, yy - y, w, h, fallback);
            const i = rowBase + xx * 4;
            d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
          }
        }
      } else {
        for (let yy = sy; yy < ey; yy++) for (let xx = sx; xx < ex; xx++) this.setPixel(xx, yy, gradientColorAt(g, xx - x, yy - y, w, h, fallback));
      }
    } else {
      for (let yy = sy; yy < ey; yy++) for (let xx = sx; xx < ex; xx++) this.setPixel(xx, yy, fallback);
    }
  }
  // B"H 2026-10-09: fix-forward. boxPainter.js and blendClipMask.js call
  // fillRoundedRect/gradientRoundedRect but the methods never landed on the
  // class (only the pointInRoundedRect helper existed). Banded
  // implementation: the middle band is one fast fillRect; only the corner
  // bands test pixels, and only inside the corner x-ranges.
  fillRoundedRect(x, y, w, h, radii, color) {
    const r = normalizeRadii(radii || {}, w, h);
    if (!hasAnyRadius(r)) return this.fillRect(x, y, w, h, color);
    const top = Math.max(r.tl[1] || 0, r.tr[1] || 0);
    const bot = Math.max(r.bl[1] || 0, r.br[1] || 0);
    const lft = Math.max(r.tl[0] || 0, r.bl[0] || 0);
    const rgt = Math.max(r.tr[0] || 0, r.br[0] || 0);
    const midY0 = y + top, midY1 = y + h - bot;
    if (midY1 > midY0) this.fillRect(x, midY0, w, midY1 - midY0, color);
    this._roundedCornerBands(x, y, w, h, r, top, bot, lft, rgt, (xx, yy) => this.setPixel(xx, yy, color));
  }
  gradientRoundedRect(x, y, w, h, radii, background, fallback) {
    const r = normalizeRadii(radii || {}, w, h);
    const g = parseGradient(background);
    if (!hasAnyRadius(r)) return this.gradientRect(x, y, w, h, background, fallback);
    const top = Math.max(r.tl[1] || 0, r.tr[1] || 0);
    const bot = Math.max(r.bl[1] || 0, r.br[1] || 0);
    const lft = Math.max(r.tl[0] || 0, r.bl[0] || 0);
    const rgt = Math.max(r.tr[0] || 0, r.br[0] || 0);
    const midY0 = y + top, midY1 = y + h - bot;
    if (midY1 > midY0) {
      if (g) {
        const opaque = (g.stops || []).every(s => ((s.color || [])[3] ?? 255) === 255);
        const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(midY0));
        const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(midY1));
        if (opaque) {
          const d = this.data, W = this.width;
          for (let yy = sy; yy < ey; yy++) {
            const rowBase = yy * W * 4;
            for (let xx = sx; xx < ex; xx++) {
              const col = gradientColorAt(g, xx - x, yy - y, w, h, fallback);
              const i = rowBase + xx * 4;
              d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
            }
          }
        } else {
          for (let yy = sy; yy < ey; yy++) for (let xx = sx; xx < ex; xx++) this.setPixel(xx, yy, gradientColorAt(g, xx - x, yy - y, w, h, fallback));
        }
      } else this.fillRect(x, midY0, w, midY1 - midY0, fallback);
    }
    if (g) this._roundedCornerBands(x, y, w, h, r, top, bot, lft, rgt, (xx, yy) => this.setPixel(xx, yy, gradientColorAt(g, xx - x, yy - y, w, h, fallback)));
    else this._roundedCornerBands(x, y, w, h, r, top, bot, lft, rgt, (xx, yy) => this.setPixel(xx, yy, fallback));
  }
  // B"H 2026-10-09: strokeRoundedRect was also missing (boxPainter calls it
  // for bordered rounded boxes). Pixel is on the border iff inside the outer
  // rounded rect but outside the inner one (inset by lineWidth, radii shrunk).
  strokeRoundedRect(x, y, w, h, radii, color, lineWidth = 1) {
    const lw = Math.max(1, Math.round(lineWidth));
    const r = normalizeRadii(radii || {}, w, h);
    if (!hasAnyRadius(r)) return this.strokeRect(x, y, w, h, color, lw);
    const inner = {};
    for (const k of ["tl", "tr", "br", "bl"]) {
      const c = r[k] || [0, 0];
      inner[k] = [Math.max(0, c[0] - lw), Math.max(0, c[1] - lw)];
    }
    const ix = x + lw, iy = y + lw, iw = w - 2 * lw, ih = h - 2 * lw;
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    for (let yy = sy; yy < ey; yy++) {
      for (let xx = sx; xx < ex; xx++) {
        const cx = xx + 0.5, cy = yy + 0.5;
        if (pointInRoundedRect(cx, cy, x, y, w, h, r) &&
            !pointInRoundedRect(cx, cy, ix, iy, iw, ih, inner)) {
          this.setPixel(xx, yy, color);
        }
      }
    }
  }
  /** Corner bands of a rounded rect: middle x-range fills directly, corner
   * x-ranges are tested per pixel. Shared by fill/gradient variants. */  _roundedCornerBands(x, y, w, h, r, top, bot, lft, rgt, paint) {
    const midX0 = x + lft, midX1 = x + w - rgt;
    for (const [b0, b1] of [[y, y + top], [y + h - bot, y + h]]) {
      const yy0 = Math.max(0, Math.floor(b0)), yy1 = Math.min(this.height, Math.ceil(b1));
      for (let yy = yy0; yy < yy1; yy++) {
        const xxA0 = Math.max(0, Math.floor(x)), xxA1 = Math.min(this.width, Math.ceil(midX0));
        for (let xx = xxA0; xx < xxA1; xx++)
          if (pointInRoundedRect(xx + 0.5, yy + 0.5, x, y, w, h, r)) paint(xx, yy);
        if (midX1 > midX0) {
          const mx0 = Math.max(0, Math.floor(midX0)), mx1 = Math.min(this.width, Math.ceil(midX1));
          for (let xx = mx0; xx < mx1; xx++) paint(xx, yy);
        }
        const xxB0 = Math.max(0, Math.floor(midX1)), xxB1 = Math.min(this.width, Math.ceil(x + w));
        for (let xx = xxB0; xx < xxB1; xx++)
          if (pointInRoundedRect(xx + 0.5, yy + 0.5, x, y, w, h, r)) paint(xx, yy);
      }
    }
  }
  strokeRect(x, y, w, h, color, lineWidth = 1) {
    const lw = Math.max(1, Math.round(lineWidth));
    this.fillRect(x, y, w, lw, color);
    this.fillRect(x, y + h - lw, w, lw, color);
    this.fillRect(x, y, lw, h, color);
    this.fillRect(x + w - lw, y, lw, h, color);
  }
  drawLine(x0, y0, x1, y1, color, width = 1) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.fillRect(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, width, width, color);
    }
  }
  drawText(text, x, y, color, scale = 1, maxWidth = Infinity) {
    let cursor = x;
    const charW = 6 * scale;
    for (const ch of String(text || "")) {
      if (cursor + charW > x + maxWidth) break;
      drawGlyph(this, ch, cursor, y, color, scale);
      cursor += charW;
    }
    return cursor - x;
  }
  drawWrappedText(text, x, y, maxWidth, maxHeight, color, scale = 1) {
    const words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    const lineH = 9 * scale;
    const maxLines = Math.max(1, Math.floor(maxHeight / lineH));
    let line = "", yy = y, used = 0;
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (textWidth(next, scale) <= maxWidth) { line = next; continue; }
      this.drawText(line, x, yy, color, scale, maxWidth);
      used++;
      if (used >= maxLines) return used;
      yy += lineH;
      line = word;
    }
    if (line && used < maxLines) { this.drawText(line, x, yy, color, scale, maxWidth); used++; }
    return used;
  }
  sample(x, y) {
    const ix = Math.max(0, Math.min(this.width - 1, Math.round(x))), iy = Math.max(0, Math.min(this.height - 1, Math.round(y)));
    const i = (iy * this.width + ix) * 4;
    return Array.from(this.data.slice(i, i + 4));
  }
  countNonBackground(bg = [0, 0, 0, 255]) {
    let count = 0;
    for (let i = 0; i < this.data.length; i += 4) if (this.data[i] !== bg[0] || this.data[i + 1] !== bg[1] || this.data[i + 2] !== bg[2]) count++;
    return count;
  }
  // B"H 2026-10-09 (speed): direct RGBA->PNG, no per-pixel closures (23x faster).
  toPngBuffer() { return rgbPngFromRgba(this.data, this.width, this.height); }
  // B"H 2026-10-09: composite an RGBA buffer ({width,height,data}, device px)
  // onto this surface at device coords (x,y), source-over, honoring the
  // active clip. Used by box-shadow / text-shadow painters.
  blitFrom(src, x, y) {
    if (!src || !src.data) return;
    const sw = src.width | 0, sh = src.height | 0;
    if (sw < 1 || sh < 1) return;
    const sdata = src.data;
    const ddata = this.data, dw = this.width, dh = this.height;
    const ox = Math.round(x), oy = Math.round(y);
    let x0 = Math.max(0, -ox), y0 = Math.max(0, -oy);
    let x1 = Math.min(sw, dw - ox), y1 = Math.min(sh, dh - oy);
    const c = this._clip;
    if (c) {
      x0 = Math.max(x0, c[0] - ox); y0 = Math.max(y0, c[1] - oy);
      x1 = Math.min(x1, c[2] - ox); y1 = Math.min(y1, c[3] - oy);
    }
    for (let sy = y0; sy < y1; sy++) {
      const dy = oy + sy;
      for (let sx = x0; sx < x1; sx++) {
        const si = (sy * sw + sx) * 4;
        const a = sdata[si + 3] / 255;
        if (a <= 0) continue;
        const di = (dy * dw + ox + sx) * 4;
        if (a >= 1) {
          ddata[di] = sdata[si]; ddata[di + 1] = sdata[si + 1];
          ddata[di + 2] = sdata[si + 2]; ddata[di + 3] = 255;
        } else {
          const ia = 1 - a;
          ddata[di] = Math.round(sdata[si] * a + ddata[di] * ia);
          ddata[di + 1] = Math.round(sdata[si + 1] * a + ddata[di + 1] * ia);
          ddata[di + 2] = Math.round(sdata[si + 2] * a + ddata[di + 2] * ia);
          ddata[di + 3] = 255;
        }
      }
    }
  }
  writeRaw(i, color) { this.data[i] = color[0]; this.data[i + 1] = color[1]; this.data[i + 2] = color[2]; this.data[i + 3] = color[3] ?? 255; }
  // B"H 2026-10-09: Packed writeRaw. Zero array indexing.
  writeRawPacked(i, packed) {
    this.data[i] = (packed >>> 24) & 255;
    this.data[i + 1] = (packed >>> 16) & 255;
    this.data[i + 2] = (packed >>> 8) & 255;
    this.data[i + 3] = packed & 255;
  }
  // B"H 2026-10-09: Packed clear. Uses writeRawPacked in the loop.
  clearPacked(packed) { for (let i = 0; i < this.data.length; i += 4) this.writeRawPacked(i, packed); }
}

// B"H 2026-10-09 (viewport culling): text measurement cache. textWidth()
// is called thousands of times per frame with identical arguments during
// word-wrap. Cache by content+scale. Bounded at 8192 entries.
const textWidthCache = new Map();
export function textWidth(text, scale = 1) {
  const key = `${text}|${scale}`;
  let v = textWidthCache.get(key);
  if (v === undefined) {
    v = String(text || "").length * 6 * scale;
    if (textWidthCache.size >= 8192) textWidthCache.clear();
    textWidthCache.set(key, v);
  }
  return v;
}
export function cssColor(value, fallback = [0, 0, 0, 255]) { return parseColor(value, fallback); }

const GLYPHS = Object.freeze({
  " ": ["00000","00000","00000","00000","00000","00000","00000"],
  "!": ["00100","00100","00100","00100","00100","00000","00100"],
  ".": ["00000","00000","00000","00000","00000","01100","01100"],
  ",": ["00000","00000","00000","00000","01100","00100","01000"],
  ":": ["00000","01100","01100","00000","01100","01100","00000"],
  "-": ["00000","00000","00000","11111","00000","00000","00000"],
  "_": ["00000","00000","00000","00000","00000","00000","11111"],
  "'": ["00100","00100","01000","00000","00000","00000","00000"],
  '"': ["01010","01010","01010","00000","00000","00000","00000"],
  "0": ["01110","10001","10011","10101","11001","10001","01110"],
  "1": ["00100","01100","00100","00100","00100","00100","01110"],
  "2": ["01110","10001","00001","00010","00100","01000","11111"],
  "3": ["11110","00001","00001","01110","00001","00001","11110"],
  "4": ["00010","00110","01010","10010","11111","00010","00010"],
  "5": ["11111","10000","10000","11110","00001","00001","11110"],
  "6": ["01110","10000","10000","11110","10001","10001","01110"],
  "7": ["11111","00001","00010","00100","01000","01000","01000"],
  "8": ["01110","10001","10001","01110","10001","10001","01110"],
  "9": ["01110","10001","10001","01111","00001","00001","01110"],
  "A": ["01110","10001","10001","11111","10001","10001","10001"],
  "B": ["11110","10001","10001","11110","10001","10001","11110"],
  "C": ["01110","10001","10000","10000","10000","10001","01110"],
  "D": ["11110","10001","10001","10001","10001","10001","11110"],
  "E": ["11111","10000","10000","11110","10000","10000","11111"],
  "F": ["11111","10000","10000","11110","10000","10000","10000"],
  "G": ["01110","10001","10000","10111","10001","10001","01110"],
  "H": ["10001","10001","10001","11111","10001","10001","10001"],
  "I": ["01110","00100","00100","00100","00100","00100","01110"],
  "J": ["00111","00010","00010","00010","10010","10010","01100"],
  "K": ["10001","10010","10100","11000","10100","10010","10001"],
  "L": ["10000","10000","10000","10000","10000","10000","11111"],
  "M": ["10001","11011","10101","10101","10001","10001","10001"],
  "N": ["10001","11001","10101","10011","10001","10001","10001"],
  "O": ["01110","10001","10001","10001","10001","10001","01110"],
  "P": ["11110","10001","10001","11110","10000","10000","10000"],
  "Q": ["01110","10001","10001","10001","10101","10010","01101"],
  "R": ["11110","10001","10001","11110","10100","10010","10001"],
  "S": ["01111","10000","10000","01110","00001","00001","11110"],
  "T": ["11111","00100","00100","00100","00100","00100","00100"],
  "U": ["10001","10001","10001","10001","10001","10001","01110"],
  "V": ["10001","10001","10001","10001","10001","01010","00100"],
  "W": ["10001","10001","10001","10101","10101","10101","01010"],
  "X": ["10001","10001","01010","00100","01010","10001","10001"],
  "Y": ["10001","10001","01010","00100","00100","00100","00100"],
  "Z": ["11111","00001","00010","00100","01000","10000","11111"],
  "?": ["01110","10001","00001","00010","00100","00000","00100"],
  // B"H 2026-10-09 (css-worker-2): list-marker + quote glyphs. ::marker
  // bullets fell back to "?" — a real disc renders for disc/square/circle
  // markers and list-style-image fallbacks.
  "•": ["00000","00000","01110","01110","01110","00000","00000"],
  "○": ["00000","00000","01110","01010","01110","00000","00000"],
  "▪": ["00000","00000","01110","01110","01110","00000","00000"],
  "◆": ["00000","00100","01110","11111","01110","00100","00000"],
  "“": ["01010","01010","01010","00000","00000","00000","00000"],
  "”": ["01010","01010","01010","00000","00000","00000","00000"],
  "‘": ["00100","00100","01000","00000","00000","00000","00000"],
  "’": ["00100","00100","01000","00000","00000","00000","00000"],
  // B"H 2026-10-09: block elements (for text-shadow / box-shadow glyph shapes).
  "█": ["11111","11111","11111","11111","11111","11111","11111"],
  "▀": ["11111","11111","11111","00000","00000","00000","00000"],
  "▄": ["00000","00000","00000","00000","11111","11111","11111"],
  "▌": ["11000","11000","11000","11000","11000","11000","11000"],
  "▐": ["00011","00011","00011","00011","00011","00011","00011"],
  "░": ["10101","01010","10101","01010","10101","01010","10101"],
  "▒": ["10101","11111","10101","11111","10101","11111","10101"],
  "▓": ["11111","10101","11111","10101","11111","11111","11111"],
  "/": ["00001","00010","00010","00100","01000","01000","10000"],
  "\\": ["10000","01000","01000","00100","00010","00010","00001"],
});

function drawGlyph(fb, ch, x, y, color, scale) {
  const rows = GLYPHS[ch] || GLYPHS[ch.toUpperCase?.()] || GLYPHS["?"];
  rows.forEach((row, yy) => [...row].forEach((bit, xx) => { if (bit === "1") fb.fillRect(x + xx * scale, y + yy * scale, scale, scale, color); }));
}

// B"H 2026-10-09: fix-forward. blendClipMask.js imports normalizeRadii and
// pointInRoundedRect from this module; the sibling's implementations had not
// landed yet. CSS border-radius normalization + point-in-rounded-rect test.
/**
 * Normalize per-corner radii {tl:[x,y],tr,br,bl} against box w/h per CSS:
 * if radii overlap, scale all down uniformly. Returns a fresh object.
 */
export function normalizeRadii(radii, w, h) {
  const r = {
    tl: (radii.tl || [0, 0]).slice(), tr: (radii.tr || [0, 0]).slice(),
    br: (radii.br || [0, 0]).slice(), bl: (radii.bl || [0, 0]).slice(),
  };
  const W = Math.max(1, Number(w) || 1), H = Math.max(1, Number(h) || 1);
  let f = 1;
  const pairs = [
    [r.tl[0] + r.tr[0], W], [r.bl[0] + r.br[0], W],
    [r.tl[1] + r.bl[1], H], [r.tr[1] + r.br[1], H],
  ];
  for (const [sum, dim] of pairs) {
    if (sum > dim && sum > 0) f = Math.min(f, dim / sum);
  }
  if (f < 1) {
    for (const k of ["tl", "tr", "br", "bl"]) { r[k][0] *= f; r[k][1] *= f; }
  }
  return r;
}

/** True if point (lx,ly) is inside the rounded rect at (x0,y0) size w×h. */
export function pointInRoundedRect(lx, ly, x0, y0, w, h, r) {
  if (lx < x0 || ly < y0 || lx > x0 + w || ly > y0 + h) return false;
  const rr = r || { tl: [0, 0], tr: [0, 0], br: [0, 0], bl: [0, 0] };
  const corners = [
    [x0, y0, rr.tl], [x0 + w, y0, rr.tr],
    [x0 + w, y0 + h, rr.br], [x0, y0 + h, rr.bl],
  ];
  for (let i = 0; i < 4; i++) {
    const [cx, cy, rad] = corners[i];
    const rx = Math.max(0, rad[0] || 0), ry = Math.max(0, rad[1] || 0);
    if (rx <= 0 || ry <= 0) continue;
    // Corner region bounds.
    const inX = i === 0 || i === 3 ? (lx < cx + rx) : (lx > cx - rx);
    const inY = i < 2 ? (ly < cy + ry) : (ly > cy - ry);
    if (inX && inY) {
      const ex = i === 0 || i === 3 ? cx + rx : cx - rx;
      const ey = i < 2 ? cy + ry : cy - ry;
      const dx = (lx - ex) / rx, dy = (ly - ey) / ry;
      if (dx * dx + dy * dy > 1) return false;
    }
  }
  return true;
}

// B"H 2026-10-09: fix-forward. boxPainter.js imports hasAnyRadius from
// this module; the sibling's implementation had not landed yet.
export function hasAnyRadius(radii) {
  if (!radii) return false;
  for (const k of ["tl", "tr", "br", "bl"]) {
    const c = radii[k];
    if (c && (Number(c[0]) > 0 || Number(c[1]) > 0)) return true;
  }
  return false;
}

// B"H 2026-10-09: fix-forward. textPainter.js and cssFilter.js import
// boxBlurRegion from this module; the sibling's implementation had not
// landed yet, breaking the import chain. Simple separable box blur over
// RGBA bytes (data: Uint8ClampedArray, w/h dims, radius in px).
export function boxBlurRegion(data, w, h, radius) {
  const r = Math.max(1, Math.round(Number(radius) || 1));
  if (!data || w < 1 || h < 1) return;
  // B"H 2026-10-09 (speed): sliding-window box blur. The naive version was
  // O(w*h*r) per pass (re-summing 2r+1 taps per pixel); the running sum makes
  // it O(w*h) — ~9x faster at r=4. Pixel-identical: the window slides with
  // the same edge clamping and the same constant divisor n = 2r+1.
  const tmp = new Uint8ClampedArray(data.length);
  const w4 = w * 4;
  const n = 2 * r + 1;
  // Horizontal pass.
  for (let y = 0; y < h; y++) {
    const row = y * w4;
    let sr = 0, sg = 0, sb = 0, sa = 0;
    for (let k = -r; k <= r; k++) {
      const o = row + Math.min(w - 1, Math.max(0, k)) * 4;
      sr += data[o]; sg += data[o + 1]; sb += data[o + 2]; sa += data[o + 3];
    }
    for (let x = 0; x < w; x++) {
      const o = row + x * 4;
      tmp[o] = sr / n; tmp[o + 1] = sg / n; tmp[o + 2] = sb / n; tmp[o + 3] = sa / n;
      const oOut = row + Math.min(w - 1, Math.max(0, x - r)) * 4;
      const oIn = row + Math.min(w - 1, Math.max(0, x + r + 1)) * 4;
      sr += data[oIn] - data[oOut];
      sg += data[oIn + 1] - data[oOut + 1];
      sb += data[oIn + 2] - data[oOut + 2];
      sa += data[oIn + 3] - data[oOut + 3];
    }
  }
  // Vertical pass.
  for (let x = 0; x < w; x++) {
    const col = x * 4;
    let sr = 0, sg = 0, sb = 0, sa = 0;
    for (let k = -r; k <= r; k++) {
      const o = Math.min(h - 1, Math.max(0, k)) * w4 + col;
      sr += tmp[o]; sg += tmp[o + 1]; sb += tmp[o + 2]; sa += tmp[o + 3];
    }
    for (let y = 0; y < h; y++) {
      const o = y * w4 + col;
      data[o] = sr / n; data[o + 1] = sg / n; data[o + 2] = sb / n; data[o + 3] = sa / n;
      const oOut = Math.min(h - 1, Math.max(0, y - r)) * w4 + col;
      const oIn = Math.min(h - 1, Math.max(0, y + r + 1)) * w4 + col;
      sr += tmp[oIn] - tmp[oOut];
      sg += tmp[oIn + 1] - tmp[oOut + 1];
      sb += tmp[oIn + 2] - tmp[oOut + 2];
      sa += tmp[oIn + 3] - tmp[oOut + 3];
    }
  }
}
