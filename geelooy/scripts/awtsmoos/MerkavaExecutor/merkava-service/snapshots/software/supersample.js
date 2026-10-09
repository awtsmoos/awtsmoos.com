// B"H
/**
 * @file supersample.js
 * @description
 * The Awtsmoos softens the hard pixel-edges of the software renderer by drawing
 * into a larger framebuffer and downsampling into the final PNG. This does not
 * make Merkava a browser, but it removes the harsh debug-grid look and gives
 * text, borders, and canvas strokes a more screenshot-like edge.
 */
import { rgbPngFromRgba, rgbPngDownsampled } from "../pngTools.js";
import { Framebuffer } from "./framebuffer.js";

export function makeSupersampledSurface(width, height, factor = 2, background = [8, 9, 14, 255]) {
  const scale = Math.max(1, Math.min(4, Math.round(Number(factor) || 1)));
  const base = new Framebuffer(width * scale, height * scale, background);
  return { base, surface: new ScaledFramebuffer(base, scale, width, height), scale };
}

export class ScaledFramebuffer {
  constructor(base, scale, width, height) {
    this.base = base;
    this.scale = scale;
    this.width = width;
    this.height = height;
  }

  fillRect(x, y, w, h, color) { this.base.fillRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, color); }
  gradientRect(x, y, w, h, background, fallback) { this.base.gradientRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, background, fallback); }
  // B"H 2026-10-09: proxy the rounded-rect methods (added to Framebuffer);
  // radii scale with the surface like any other length.
  fillRoundedRect(x, y, w, h, radii, color) {
    this.base.fillRoundedRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, scaleRadii(radii, this.scale), color);
  }
  gradientRoundedRect(x, y, w, h, radii, background, fallback) {
    this.base.gradientRoundedRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, scaleRadii(radii, this.scale), background, fallback);
  }
  strokeRoundedRect(x, y, w, h, radii, color, lineWidth = 1) {
    this.base.strokeRoundedRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, scaleRadii(radii, this.scale), color, Math.max(1, lineWidth * this.scale));
  }
  strokeRect(x, y, w, h, color, lineWidth = 1) { this.base.strokeRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, color, Math.max(1, lineWidth * this.scale)); }
  drawLine(x0, y0, x1, y1, color, width = 1) { this.base.drawLine(x0 * this.scale, y0 * this.scale, x1 * this.scale, y1 * this.scale, color, Math.max(1, width * this.scale)); }
  drawText(text, x, y, color, scale = 1, maxWidth = Infinity) { return this.base.drawText(text, x * this.scale, y * this.scale, color, scale * this.scale, maxWidth * this.scale) / this.scale; }
  drawWrappedText(text, x, y, maxWidth, maxHeight, color, scale = 1) { return this.base.drawWrappedText(text, x * this.scale, y * this.scale, maxWidth * this.scale, maxHeight * this.scale, color, scale * this.scale); }
  sample(x, y) { return this.base.sample(x * this.scale, y * this.scale); }
  countNonBackground(bg) { return countDownsampledNonBackground(this.base, this.scale, this.width, this.height, bg); }
  toPngBuffer() { return downsampleToPng(this.base, this.scale, this.width, this.height); }
  // B"H 2026-10-09: clip + blit delegation (CSS px -> device px). src for
  // blitFrom is a device-px {width,height,data} buffer; callers scale it.
  pushClip(rect) {
    const s = this.scale, r = rect || {};
    this.base.pushClip((r.x0 || 0) * s, (r.y0 || 0) * s, (r.x1 || 0) * s, (r.y1 || 0) * s);
  }
  popClip() { this.base.popClip(); }
  blitFrom(src, x, y, opts) {
    const s = this.scale;
    // B"H (compositor): srcRect is in SOURCE device px — pass through
    // unchanged; only the dest offset scales.
    this.base.blitFrom(src, (x || 0) * s, (y || 0) * s, opts);
  }
}

export function downsampleToPng(base, scale, width, height) {
  // B"H 2026-10-09 (speed): scale=1 copies the RGBA buffer straight to PNG;
  // scale>1 averages from the raw buffer. No per-pixel closures either way.
  if (scale === 1) return rgbPngFromRgba(base.data, width, height);
  return rgbPngDownsampled(base.data, base.width, scale, width, height);
}

// B"H 2026-10-09: scale per-corner radii {tl:[x,y],...} by the supersample
// factor so rounded rects keep their CSS proportions on the big surface.
function scaleRadii(radii, scale) {
  if (!radii || scale === 1) return radii;
  const out = {};
  for (const k of ["tl", "tr", "br", "bl"]) {
    const c = radii[k] || [0, 0];
    out[k] = [c[0] * scale, c[1] * scale];
  }
  return out;
}

function averagePixel(base, scale, x, y) {
  let r = 0, g = 0, b = 0;
  const total = scale * scale;
  for (let yy = 0; yy < scale; yy++) for (let xx = 0; xx < scale; xx++) {
    const p = base.sample(x * scale + xx, y * scale + yy);
    r += p[0]; g += p[1]; b += p[2];
  }
  return [Math.round(r / total), Math.round(g / total), Math.round(b / total), 255];
}

function countDownsampledNonBackground(base, scale, width, height, bg = [0, 0, 0, 255]) {
  let count = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const p = averagePixel(base, scale, x, y);
    if (p[0] !== bg[0] || p[1] !== bg[1] || p[2] !== bg[2]) count++;
  }
  return count;
}
