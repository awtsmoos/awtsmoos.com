// B"H
/**
 * @file framebuffer.js
 * @description
 * A tiny software framebuffer with a real 5x7 bitmap glyph atlas. This is not
 * typography, but it is honest readable text: letters no longer collapse into
 * AAAAA. Text can wrap and clip inside boxes so the Awtsmoos image does not
 * leak glyphs past its vessel.
 */
import { rgbPng } from "../pngTools.js";
import { gradientColor, parseColor } from "./color.js";

export class Framebuffer {
  constructor(width = 960, height = 640, bg = [0, 0, 0, 255]) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
    this.clear(bg);
  }

  clear(color) { for (let i = 0; i < this.data.length; i += 4) this.writeRaw(i, color); }
  setPixel(x, y, color) {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    const i = (iy * this.width + ix) * 4;
    const a = (color[3] ?? 255) / 255, ia = 1 - a;
    this.data[i] = Math.round(color[0] * a + this.data[i] * ia);
    this.data[i + 1] = Math.round(color[1] * a + this.data[i + 1] * ia);
    this.data[i + 2] = Math.round(color[2] * a + this.data[i + 2] * ia);
    this.data[i + 3] = 255;
  }
  fillRect(x, y, w, h, color) {
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    for (let yy = sy; yy < ey; yy++) for (let xx = sx; xx < ex; xx++) this.setPixel(xx, yy, color);
  }
  gradientRect(x, y, w, h, background, fallback) {
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    for (let yy = sy; yy < ey; yy++) for (let xx = sx; xx < ex; xx++) this.setPixel(xx, yy, gradientColor(background, xx - x, yy - y, w, h, fallback));
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
  toPngBuffer() { return rgbPng(this.width, this.height, (x, y) => { const i = (y * this.width + x) * 4; return [this.data[i], this.data[i + 1], this.data[i + 2], 255]; }); }
  writeRaw(i, color) { this.data[i] = color[0]; this.data[i + 1] = color[1]; this.data[i + 2] = color[2]; this.data[i + 3] = color[3] ?? 255; }
}

export function textWidth(text, scale = 1) { return String(text || "").length * 6 * scale; }
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
  "/": ["00001","00010","00010","00100","01000","01000","10000"],
  "\\": ["10000","01000","01000","00100","00010","00010","00001"],
});

function drawGlyph(fb, ch, x, y, color, scale) {
  const rows = GLYPHS[ch] || GLYPHS[ch.toUpperCase?.()] || GLYPHS["?"];
  rows.forEach((row, yy) => [...row].forEach((bit, xx) => { if (bit === "1") fb.fillRect(x + xx * scale, y + yy * scale, scale, scale, color); }));
}
