// B"H
/**
 * @file color.js
 * @description
 * Color is the first garment of the rendered vessel. These helpers parse the
 * practical CSS color river needed by Merkava's software renderer: named colors
 * used by canvas tests, hex, rgb/rgba, and simple linear gradients. The worker
 * canvas fidelity gate specifically needs `lime`, because a browser treats it
 * as #00ff00, not as a fallback shadow.
 */

const NAMED = Object.freeze({
  aliceblue: [240, 248, 255, 255], antiquewhite: [250, 235, 215, 255], aqua: [0, 255, 255, 255],
  aquamarine: [127, 255, 212, 255], azure: [240, 255, 255, 255], beige: [245, 245, 220, 255],
  bisque: [255, 228, 196, 255], black: [0, 0, 0, 255], blue: [0, 0, 255, 255],
  blueviolet: [138, 43, 226, 255], brown: [165, 42, 42, 255], coral: [255, 127, 80, 255],
  crimson: [220, 20, 60, 255], cyan: [0, 255, 255, 255], darkblue: [0, 0, 139, 255],
  darkcyan: [0, 139, 139, 255], darkgray: [169, 169, 169, 255], darkgreen: [0, 100, 0, 255],
  darkgrey: [169, 169, 169, 255], darkmagenta: [139, 0, 139, 255], darkorange: [255, 140, 0, 255],
  darkred: [139, 0, 0, 255], deeppink: [255, 20, 147, 255], deepskyblue: [0, 191, 255, 255],
  dimgray: [105, 105, 105, 255], dimgrey: [105, 105, 105, 255], dodgerblue: [30, 144, 255, 255],
  firebrick: [178, 34, 34, 255], fuchsia: [255, 0, 255, 255], gold: [255, 215, 0, 255],
  goldenrod: [218, 165, 32, 255], gray: [128, 128, 128, 255], green: [0, 128, 0, 255],
  greenyellow: [173, 255, 47, 255], grey: [128, 128, 128, 255], hotpink: [255, 105, 180, 255],
  indigo: [75, 0, 130, 255], ivory: [255, 255, 240, 255], khaki: [240, 230, 140, 255],
  lavender: [230, 230, 250, 255], lavenderblush: [255, 240, 245, 255], lawngreen: [124, 252, 0, 255],
  lemonchiffon: [255, 250, 205, 255], lightblue: [173, 216, 230, 255], lightcyan: [224, 255, 255, 255],
  lightgray: [211, 211, 211, 255], lightgreen: [144, 238, 144, 255], lightgrey: [211, 211, 211, 255],
  lightpink: [255, 182, 193, 255], lightskyblue: [135, 206, 250, 255], lightyellow: [255, 255, 224, 255],
  lime: [0, 255, 0, 255], limegreen: [50, 205, 50, 255], magenta: [255, 0, 255, 255],
  maroon: [128, 0, 0, 255], navy: [0, 0, 128, 255], olive: [128, 128, 0, 255],
  orange: [255, 165, 0, 255], orangered: [255, 69, 0, 255], orchid: [218, 112, 214, 255],
  pink: [255, 192, 203, 255], plum: [221, 160, 221, 255], purple: [128, 0, 128, 255],
  red: [255, 0, 0, 255], royalblue: [65, 105, 225, 255], salmon: [250, 128, 114, 255],
  silver: [192, 192, 192, 255], skyblue: [135, 206, 235, 255], teal: [0, 128, 128, 255],
  tomato: [255, 99, 71, 255], transparent: [0, 0, 0, 0], violet: [238, 130, 238, 255],
  white: [255, 255, 255, 255], whitesmoke: [245, 245, 245, 255], yellow: [255, 255, 0, 255]
});

export function parseColor(value, fallback = [0, 0, 0, 255]) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return fallback;
  if (NAMED[text]) return NAMED[text].slice();
  const hex = text.match(/#([0-9a-f]{3,8})\b/i);
  if (hex) return hexColor(hex[1], fallback);
  const rgb = text.match(/rgba?\(([^)]+)\)/i);
  if (rgb) return rgbColor(rgb[1], fallback);
  return fallback;
}

export function mix(a, b, t) {
  const n = Math.max(0, Math.min(1, Number(t) || 0));
  return [0, 1, 2, 3].map(i => Math.round(a[i] + (b[i] - a[i]) * n));
}

export function gradientColor(value, x, y, width, height, fallback) {
  const text = String(value || "");
  const match = text.match(/linear-gradient\((.*)\)/i);
  if (!match) return fallback;
  const colors = [...match[1].matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]+\)|\b[a-z]+\b/gi)]
    .map(m => parseColor(m[0], null))
    .filter(Boolean);
  if (!colors.length) return fallback;
  if (colors.length === 1) return colors[0];
  const t = Math.max(0, Math.min(1, (x + y) / Math.max(1, width + height)));
  const step = t * (colors.length - 1);
  const i = Math.floor(step);
  return mix(colors[i], colors[Math.min(colors.length - 1, i + 1)], step - i);
}

function hexColor(hex, fallback) {
  if (hex.length === 3 || hex.length === 4) {
    const chars = hex.split("").map(ch => parseInt(ch + ch, 16));
    return [chars[0], chars[1], chars[2], chars[3] ?? 255];
  }
  if (hex.length === 6 || hex.length === 8) return [0, 2, 4, 6].map(i => i < hex.length ? parseInt(hex.slice(i, i + 2), 16) : 255);
  return fallback;
}

function rgbColor(raw, fallback) {
  const parts = raw.split(/\s*,\s*/).map(item => item.trim());
  if (parts.length < 3) return fallback;
  const rgb = parts.slice(0, 3).map(toByte);
  const alpha = parts[3] == null ? 255 : Math.round(Math.max(0, Math.min(1, Number(parts[3]))) * 255);
  return [...rgb, alpha];
}

function toByte(value) {
  if (value.endsWith("%")) return Math.round(Math.max(0, Math.min(100, Number(value.slice(0, -1)))) * 2.55);
  return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}
