// B"H
/**
 * @file framebuffer.js
 * @description
 * A tiny software framebuffer with a real 5x7 bitmap glyph atlas. This is not
 * typography, but it is honest readable text: letters no longer collapse into
 * AAAAA. Text can wrap and clip inside boxes so the Awtsmoos image does not
 * leak glyphs past its vessel.
 */
const rgbPngFromRgba = () => { throw new Error("PNG encoding not available in the browser build"); };
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
    const cw = cex - csx, ch = cey - csy;
    if (cw <= 0 || ch <= 0) return;
    // B"H 2026-10-09 (scroll perf): opaque fast path. setPixel's per-pixel
    // blend math (Math.round x5, alpha multiply) dominated strip
    // rasterization at 44% of profile. Opaque fills write rows directly.
    if ((color[3] ?? 255) >= 255) {
      const d = this.data, W = this.width;
      const r = color[0], g = color[1], b = color[2];
      if (cw * ch >= 1024) {
        // Large: build one row pattern, memcpy per row (native speed).
        const row = new Uint8ClampedArray(cw * 4);
        for (let xx = 0; xx < cw; xx++) {
          const o = xx * 4;
          row[o] = r; row[o + 1] = g; row[o + 2] = b; row[o + 3] = 255;
        }
        for (let yy = csy; yy < cey; yy++) d.set(row, (yy * W + csx) * 4);
      } else {
        // Small: direct writes, no call overhead.
        for (let yy = csy; yy < cey; yy++) {
          let i = (yy * W + csx) * 4;
          for (let xx = 0; xx < cw; xx++) {
            d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
            i += 4;
          }
        }
      }
      return;
    }
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
    // B"H: hoist rounded-rect tests out of the per-pixel loop — was allocating
    // two test closures per pixel via pointInRoundedRect (23% of blog paint).
    const outerTest = makeRoundedTest(x, y, w, h, r);
    const innerTest = makeRoundedTest(ix, iy, iw, ih, inner);
    // outerTest non-null here (hasAnyRadius checked above); innerTest may be
    // null if radii shrank to zero — then fall back to plain rect check.
    const inOuter = outerTest;
    const inInner = innerTest || ((lx, ly) => lx >= ix && ly >= iy && lx <= ix + iw && ly <= iy + ih);
    for (let yy = sy; yy < ey; yy++) {
      for (let xx = sx; xx < ex; xx++) {
        const cx = xx + 0.5, cy = yy + 0.5;
        if (inOuter(cx, cy) && !inInner(cx, cy)) {
          this.setPixel(xx, yy, color);
        }
      }
    }
  }
  /** Corner bands of a rounded rect: middle x-range fills directly, corner
   * x-ranges are tested per pixel. Shared by fill/gradient variants. */  _roundedCornerBands(x, y, w, h, r, top, bot, lft, rgt, paint) {
    const midX0 = x + lft, midX1 = x + w - rgt;
    // B"H 2026-10-09 (render-bench): hoist the rounded-rect test out of the
    // per-pixel loop — was allocating per pixel via pointInRoundedRect.
    const test = makeRoundedTest(x, y, w, h, r);
    const inside = test || (() => true);
    for (const [b0, b1] of [[y, y + top], [y + h - bot, y + h]]) {
      const yy0 = Math.max(0, Math.floor(b0)), yy1 = Math.min(this.height, Math.ceil(b1));
      for (let yy = yy0; yy < yy1; yy++) {
        const xxA0 = Math.max(0, Math.floor(x)), xxA1 = Math.min(this.width, Math.ceil(midX0));
        for (let xx = xxA0; xx < xxA1; xx++)
          if (inside(xx + 0.5, yy + 0.5)) paint(xx, yy);
        if (midX1 > midX0) {
          const mx0 = Math.max(0, Math.floor(midX0)), mx1 = Math.min(this.width, Math.ceil(midX1));
          for (let xx = mx0; xx < mx1; xx++) paint(xx, yy);
        }
        const xxB0 = Math.max(0, Math.floor(midX1)), xxB1 = Math.min(this.width, Math.ceil(x + w));
        for (let xx = xxB0; xx < xxB1; xx++)
          if (inside(xx + 0.5, yy + 0.5)) paint(xx, yy);
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
  //
  // B"H (compositor): opts.srcRect {x0,y0,x1,y1} limits the source region
  // composited (device px) — opacity-group blits only touch the group's
  // bounds instead of the whole surface. opts.alphaScale (0..1) folds a
  // group-opacity multiply into the same pass, replacing the old separate
  // full-surface scaleSurfaceAlpha pass. Both default to no-ops, so
  // existing callers are behavior-identical.
  blitFrom(src, x, y, opts = {}) {
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
    const r = opts.srcRect;
    if (r) {
      x0 = Math.max(x0, Math.floor(r.x0 || 0)); y0 = Math.max(y0, Math.floor(r.y0 || 0));
      x1 = Math.min(x1, Math.ceil(r.x1 === undefined ? sw : r.x1));
      y1 = Math.min(y1, Math.ceil(r.y1 === undefined ? sh : r.y1));
    }
    if (x1 <= x0 || y1 <= y0) return;
    // B"H (compositor): alphaScale folds group opacity into the composite.
    // Math.round(srcA * k) matches the old scaleSurfaceAlpha pass exactly.
    const ak = opts.alphaScale;
    const useScale = ak !== undefined && ak < 1;
    for (let sy = y0; sy < y1; sy++) {
      const dy = oy + sy;
      const srow = sy * sw * 4, drow = dy * dw * 4;
      for (let sx = x0; sx < x1; sx++) {
        const si = srow + sx * 4;
        let a255 = sdata[si + 3];
        if (useScale) a255 = Math.round(a255 * ak);
        if (a255 <= 0) continue;
        const di = drow + (ox + sx) * 4;
        if (a255 >= 255) {
          ddata[di] = sdata[si]; ddata[di + 1] = sdata[si + 1];
          ddata[di + 2] = sdata[si + 2]; ddata[di + 3] = 255;
        } else {
          const a = a255 / 255, ia = 1 - a;
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

  // B"H 2026-10-09 (scroll compositor): raw opaque blit — memcpy a rectangle
  // from src (no alpha blending, no clip). Row-wise typed-array copies are
  // ~50x faster than blitFrom's per-pixel blend loop. Used for tile/strip
  // compositing where the source is fully painted and opaque.
  blitRaw(src, sx, sy, w, h, dx, dy) {
    if (!src || !src.data) return;
    sx |= 0; sy |= 0; w |= 0; h |= 0; dx |= 0; dy |= 0;
    // Clip to both surfaces.
    if (sx < 0) { w += sx; dx -= sx; sx = 0; }
    if (sy < 0) { h += sy; dy -= sy; sy = 0; }
    if (dx < 0) { w += dx; sx -= dx; dx = 0; }
    if (dy < 0) { h += dy; sy -= dy; dy = 0; }
    w = Math.min(w, src.width - sx, this.width - dx);
    h = Math.min(h, src.height - sy, this.height - dy);
    if (w <= 0 || h <= 0) return;
    const sdata = src.data, ddata = this.data;
    const sw4 = src.width * 4, dw4 = this.width * 4;
    const rowBytes = w * 4;
    for (let r = 0; r < h; r++) {
      const si = (sy + r) * sw4 + sx * 4;
      const di = (dy + r) * dw4 + dx * 4;
      ddata.set(sdata.subarray(si, si + rowBytes), di);
    }
  }

  // ------------------------------------------------------------------
  // B"H 2026-10-09 (canvas 2D correctness): alpha-correct compositing
  // primitives for canvas replay. The page pipeline keeps using the
  // opaque-optimized setPixel/fillRect above; these new methods preserve
  // real alpha and honor an optional path-clip mask, so canvas clearRect,
  // globalAlpha, composite ops, and clip() behave like a real canvas.
  // ------------------------------------------------------------------
  /** Path-clip mask: Uint8Array(w*h), 1 = paint allowed. null = no mask. */
  setClipMask(mask) { this._clipMask = mask || null; }
  getClipMask() { return this._clipMask || null; }
  _maskOk(ix, iy) { const m = this._clipMask; return !m || m[iy * this.width + ix] !== 0; }

  /**
   * Porter-Duff composite of one src pixel onto the surface, preserving
   * real alpha in the output. Fast path for the common source-over case.
   * r,g,b,a: 0-255. op: any canvas globalCompositeOperation value.
   */
  blendPixel(x, y, r, g, b, a, op = 'source-over') {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (!this._inClip(ix, iy) || !this._maskOk(ix, iy)) return;
    this._blendPixelFast(ix, iy, r, g, b, a, op);
  }

  /**
   * Blend one pixel with NO bounds/clip/mask checks — the caller guarantees
   * ix, iy are in range and paintable. Hot path for span fills and blits.
   */
  _blendPixelFast(ix, iy, r, g, b, a, op) {
    const i = (iy * this.width + ix) * 4;
    const d = this.data;
    const sa = (a | 0) / 255;
    if (sa <= 0) return;
    if (!op || op === 'source-over') {
      if (sa >= 1) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; return; }
      const da = d[i + 3] / 255, ia = 1 - sa;
      const oa = sa + da * ia;
      const inv = oa > 0 ? 1 / oa : 0;
      d[i] = Math.round((r * sa + d[i] * da * ia) * inv);
      d[i + 1] = Math.round((g * sa + d[i + 1] * da * ia) * inv);
      d[i + 2] = Math.round((b * sa + d[i + 2] * da * ia) * inv);
      d[i + 3] = Math.round(oa * 255);
      return;
    }
    // General Porter-Duff in premultiplied 0..1 space.
    const da = d[i + 3] / 255;
    const sr = r / 255, sg = g / 255, sb = b / 255;
    const dr = d[i] / 255, dg = d[i + 1] / 255, db = d[i + 2] / 255;
    const SP0 = sr * sa, SP1 = sg * sa, SP2 = sb * sa;
    const DP0 = dr * da, DP1 = dg * da, DP2 = db * da;
    let P0, P1, P2, oa;
    switch (op) {
      case 'destination-over':
        oa = da + sa * (1 - da);
        P0 = DP0 + SP0 * (1 - da); P1 = DP1 + SP1 * (1 - da); P2 = DP2 + SP2 * (1 - da);
        break;
      case 'copy': oa = sa; P0 = SP0; P1 = SP1; P2 = SP2; break;
      case 'lighter':
        oa = Math.min(1, sa + da);
        P0 = Math.min(1, SP0 + DP0); P1 = Math.min(1, SP1 + DP1); P2 = Math.min(1, SP2 + DP2);
        break;
      case 'xor':
        oa = sa + da - 2 * sa * da;
        P0 = SP0 * (1 - da) + DP0 * (1 - sa);
        P1 = SP1 * (1 - da) + DP1 * (1 - sa);
        P2 = SP2 * (1 - da) + DP2 * (1 - sa);
        break;
      case 'source-in': oa = sa * da; P0 = SP0 * da; P1 = SP1 * da; P2 = SP2 * da; break;
      case 'source-out': oa = sa * (1 - da); P0 = SP0 * (1 - da); P1 = SP1 * (1 - da); P2 = SP2 * (1 - da); break;
      case 'destination-in': oa = da * sa; P0 = DP0 * sa; P1 = DP1 * sa; P2 = DP2 * sa; break;
      case 'destination-out': oa = da * (1 - sa); P0 = DP0 * (1 - sa); P1 = DP1 * (1 - sa); P2 = DP2 * (1 - sa); break;
      case 'source-atop':
        oa = da; P0 = SP0 * da + DP0 * (1 - sa); P1 = SP1 * da + DP1 * (1 - sa); P2 = SP2 * da + DP2 * (1 - sa);
        break;
      case 'destination-atop':
        oa = sa; P0 = DP0 * sa + SP0 * (1 - da); P1 = DP1 * sa + SP1 * (1 - da); P2 = DP2 * sa + SP2 * (1 - da);
        break;
      default: // unknown op -> source-over
        oa = sa + da * (1 - sa);
        P0 = SP0 + DP0 * (1 - sa); P1 = SP1 + DP1 * (1 - sa); P2 = SP2 + DP2 * (1 - sa);
        break;
    }
    if (oa <= 0) { d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 0; return; }
    const inv = 1 / oa;
    d[i] = Math.round(Math.max(0, Math.min(1, P0 * inv)) * 255);
    d[i + 1] = Math.round(Math.max(0, Math.min(1, P1 * inv)) * 255);
    d[i + 2] = Math.round(Math.max(0, Math.min(1, P2 * inv)) * 255);
    d[i + 3] = Math.round(Math.max(0, Math.min(1, oa)) * 255);
  }

  /** Direct write with no blending (clearRect semantics), honors clip+mask. */
  writePixel(x, y, r, g, b, a) {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (!this._inClip(ix, iy) || !this._maskOk(ix, iy)) return;
    const i = (iy * this.width + ix) * 4;
    this.data[i] = r; this.data[i + 1] = g; this.data[i + 2] = b; this.data[i + 3] = a;
  }

  /** Erase a rect to transparent black (real clearRect). Honors clip+mask. */
  clearRectRaw(x, y, w, h) {
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    const [csx, csy, cex, cey] = this._clipBounds(sx, sy, ex, ey);
    const d = this.data, W = this.width, m = this._clipMask;
    for (let yy = csy; yy < cey; yy++) {
      const row = yy * W;
      for (let xx = csx; xx < cex; xx++) {
        if (m && m[row + xx] === 0) continue;
        const i = (row + xx) * 4;
        d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 0;
      }
    }
  }

  /**
   * Fill one horizontal span with an RGBA color under a composite op.
   * Fast path: opaque source-over writes directly (no per-pixel call).
   */
  fillSpanAlpha(y, x0, x1, r, g, b, a, op = 'source-over') {
    const yy = Math.round(y);
    if (yy < 0 || yy >= this.height) return;
    let xa = Math.max(0, Math.floor(x0)), xb = Math.min(this.width, Math.ceil(x1));
    const c = this._clip;
    if (c) {
      if (yy < c[1] || yy >= c[3]) return;
      xa = Math.max(xa, c[0]); xb = Math.min(xb, c[2]);
    }
    if (xb <= xa) return;
    const m = this._clipMask, row = yy * this.width, d = this.data;
    const sa = (a | 0) / 255;
    if (sa <= 0) return;
    if ((!op || op === 'source-over') && sa >= 1 && !m) {
      for (let xx = xa; xx < xb; xx++) {
        const i = (row + xx) * 4;
        d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
      }
      return;
    }
    for (let xx = xa; xx < xb; xx++) {
      if (m && m[row + xx] === 0) continue;
      this._blendPixelFast(xx, yy, r, g, b, a, op);
    }
  }

  /**
   * Composite a whole RGBA surface onto this one with globalAlpha and a
   * composite op, preserving real alpha. Honors clip rect + mask.
   */
  blitAlpha(src, dx, dy, alpha = 1, op = 'source-over') {
    if (!src || !src.data) return;
    const sw = src.width | 0, sh = src.height | 0;
    if (sw < 1 || sh < 1) return;
    const sdata = src.data, dW = this.width, dH = this.height;
    const ox = Math.round(dx), oy = Math.round(dy);
    let x0 = Math.max(0, -ox), y0 = Math.max(0, -oy);
    let x1 = Math.min(sw, dW - ox), y1 = Math.min(sh, dH - oy);
    const c = this._clip;
    if (c) {
      x0 = Math.max(x0, c[0] - ox); y0 = Math.max(y0, c[1] - oy);
      x1 = Math.min(x1, c[2] - ox); y1 = Math.min(y1, c[3] - oy);
    }
    if (x1 <= x0 || y1 <= y0) return;
    const m = this._clipMask;
    if ((!op || op === 'source-over') && !m) {
      // Fast path: bounds + page clip precomputed, no path mask.
      const d = this.data;
      for (let sy = y0; sy < y1; sy++) {
        const dy2 = oy + sy, srow = sy * sw, drow = (dy2 * dW + ox) * 4;
        for (let sx = x0; sx < x1; sx++) {
          const si = (srow + sx) * 4;
          const sa8 = sdata[si + 3];
          if (sa8 === 0) continue;
          const di = drow + sx * 4;
          if (alpha >= 1 && sa8 === 255) {
            d[di] = sdata[si]; d[di + 1] = sdata[si + 1]; d[di + 2] = sdata[si + 2]; d[di + 3] = 255;
            continue;
          }
          const sa = (sa8 / 255) * alpha, ia = 1 - sa;
          const da = d[di + 3] / 255;
          const oa = sa + da * ia;
          const inv = oa > 0 ? 1 / oa : 0;
          d[di] = Math.round((sdata[si] * sa + d[di] * da * ia) * inv);
          d[di + 1] = Math.round((sdata[si + 1] * sa + d[di + 1] * da * ia) * inv);
          d[di + 2] = Math.round((sdata[si + 2] * sa + d[di + 2] * da * ia) * inv);
          d[di + 3] = Math.round(oa * 255);
        }
      }
      return;
    }
    for (let sy = y0; sy < y1; sy++) {
      const dy2 = oy + sy, srow = sy * sw;
      for (let sx = x0; sx < x1; sx++) {
        if (m && m[dy2 * dW + ox + sx] === 0) continue;
        const si = (srow + sx) * 4;
        const sa = (sdata[si + 3] / 255) * alpha;
        if (sa <= 0) continue;
        this._blendPixelFast(ox + sx, dy2, sdata[si], sdata[si + 1], sdata[si + 2], Math.round(sa * 255), op);
      }
    }
  }

  /**
   * Tint for canvas shadows: rgb := color.rgb, a := a * color.a.
   * Used after rasterizing a blurred white silhouette.
   */
  tintWith(color) {
    const d = this.data;
    const r = color[0] | 0, g = color[1] | 0, b = color[2] | 0;
    const k = (color[3] ?? 255) / 255;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
      d[i + 3] = Math.round(d[i + 3] * k);
    }
  }

  /**
   * Alpha-aware text via the 5x7 glyph atlas. Each set-pixel run becomes a
   * span fill so globalAlpha / composite ops / clip masks apply correctly.
   */
  drawTextAlpha(text, x, y, color, scale = 1, maxWidth = Infinity, op = 'source-over') {
    const r = color[0] | 0, g = color[1] | 0, b = color[2] | 0, a = color[3] ?? 255;
    let cursor = x;
    const charW = 6 * scale;
    for (const ch of String(text || '')) {
      if (cursor + charW > x + maxWidth) break;
      const rows = GLYPHS[ch] || GLYPHS[ch.toUpperCase?.()] || GLYPHS['?'];
      for (let yy = 0; yy < rows.length; yy++) {
        const rowS = rows[yy];
        let run = -1;
        for (let xx = 0; xx <= 5; xx++) {
          const bit = xx < 5 ? rowS[xx] : '0';
          if (bit === '1' && run < 0) run = xx;
          if (bit !== '1' && run >= 0) {
            const x0 = cursor + run * scale, x1 = cursor + xx * scale;
            for (let syy = 0; syy < scale; syy++) {
              this.fillSpanAlpha(y + yy * scale + syy, x0, x1, r, g, b, a, op);
            }
            run = -1;
          }
        }
      }
      cursor += charW;
    }
    return cursor - x;
  }
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
/* B"H 2026-10-09 (render-bench): hoisted rounded-rect test. pointInRoundedRect
 * allocated a 4-element corners array + destructured per PIXEL — 37.6% of the
 * blog page (border-radius:3px on every card). Precompute corner ellipse
 * params once per rect, return a closure with zero per-pixel allocation. */
export function makeRoundedTest(x0, y0, w, h, r) {
  const rr = r || { tl: [0, 0], tr: [0, 0], br: [0, 0], bl: [0, 0] };
  const cs = [];
  const defs = [[x0, y0, rr.tl, 0], [x0 + w, y0, rr.tr, 1], [x0 + w, y0 + h, rr.br, 2], [x0, y0 + h, rr.bl, 3]];
  for (let k = 0; k < 4; k++) {
    const cx = defs[k][0], cy = defs[k][1], rad = defs[k][2], i = defs[k][3];
    const rx = Math.max(0, rad[0] || 0), ry = Math.max(0, rad[1] || 0);
    if (rx <= 0 || ry <= 0) continue;
    cs.push({
      left: i === 0 || i === 3, top: i < 2,
      bx: i === 0 || i === 3 ? cx + rx : cx - rx,
      by: i < 2 ? cy + ry : cy - ry,
      ex: (i === 0 || i === 3 ? cx + rx : cx - rx),
      ey: i < 2 ? cy + ry : cy - ry,
      rx, ry,
    });
  }
  if (!cs.length) return null;
  const x1 = x0 + w, y1 = y0 + h;
  return (lx, ly) => {
    if (lx < x0 || ly < y0 || lx > x1 || ly > y1) return false;
    for (let k = 0; k < cs.length; k++) {
      const c = cs[k];
      const inX = c.left ? (lx < c.bx) : (lx > c.bx);
      const inY = c.top ? (ly < c.by) : (ly > c.by);
      if (inX && inY) {
        const dx = (lx - c.ex) / c.rx, dy = (ly - c.ey) / c.ry;
        if (dx * dx + dy * dy > 1) return false;
      }
    }
    return true;
  };
}

export function pointInRoundedRect(lx, ly, x0, y0, w, h, r) {
  const test = makeRoundedTest(x0, y0, w, h, r);
  return test ? test(lx, ly) : (lx >= x0 && ly >= y0 && lx <= x0 + w && ly <= y0 + h);
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
