// B"H
/**
 * @file supersample.js
 * @description
 * The Awtsmoos softens the hard pixel-edges of the software renderer by drawing
 * into a larger framebuffer and downsampling into the final PNG. This does not
 * make Merkava a browser, but it removes the harsh debug-grid look and gives
 * text, borders, and canvas strokes a more screenshot-like edge.
 */
import { rgbPng } from "../pngTools.js";
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
  strokeRect(x, y, w, h, color, lineWidth = 1) { this.base.strokeRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, color, Math.max(1, lineWidth * this.scale)); }
  drawLine(x0, y0, x1, y1, color, width = 1) { this.base.drawLine(x0 * this.scale, y0 * this.scale, x1 * this.scale, y1 * this.scale, color, Math.max(1, width * this.scale)); }
  drawText(text, x, y, color, scale = 1, maxWidth = Infinity) { return this.base.drawText(text, x * this.scale, y * this.scale, color, scale * this.scale, maxWidth * this.scale) / this.scale; }
  drawWrappedText(text, x, y, maxWidth, maxHeight, color, scale = 1) { return this.base.drawWrappedText(text, x * this.scale, y * this.scale, maxWidth * this.scale, maxHeight * this.scale, color, scale * this.scale); }
  sample(x, y) { return this.base.sample(x * this.scale, y * this.scale); }
  countNonBackground(bg) { return countDownsampledNonBackground(this.base, this.scale, this.width, this.height, bg); }
  toPngBuffer() { return downsampleToPng(this.base, this.scale, this.width, this.height); }
}

export function downsampleToPng(base, scale, width, height) {
  return rgbPng(width, height, (x, y) => averagePixel(base, scale, x, y));
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
