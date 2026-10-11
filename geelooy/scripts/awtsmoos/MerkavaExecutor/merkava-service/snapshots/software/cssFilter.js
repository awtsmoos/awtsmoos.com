// B"H
/**
 * cssFilter — real CSS `filter` rendering for the software painter.
 *
 * Parses the `filter` property (blur, brightness, contrast, grayscale, sepia,
 * saturate, hue-rotate, invert, opacity, drop-shadow) and applies it as pixel
 * ops on an item's temp buffer, in CSS order: filter runs after the item is
 * painted and before opacity/transform compositing.
 *
 * Lengths are CSS px; callers pass the device scale so blur radii and shadow
 * offsets scale with supersampling.
 */
import { boxBlurRegion } from "./framebuffer.js";
import { parseColor } from "./color.js";

const KNOWN = new Set([
  "blur", "brightness", "contrast", "grayscale", "sepia",
  "saturate", "hue-rotate", "invert", "opacity", "drop-shadow",
]);

/** The CSS filter functions this module renders. */
export const FILTER_FUNCTIONS = KNOWN;

/** Split "fn(a, b) fn2(c)" into [{name, args:[...]}]. */
export function parseFilterList(value) {
  const text = String(value || "").trim();
  if (!text || text.toLowerCase() === "none") return [];
  const out = [];
  const re = /([a-zA-Z][a-zA-Z0-9-]*)\s*\(/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1].toLowerCase();
    const openAt = m.index + m[0].length - 1;
    const closeAt = balancedParenEnd(text, openAt);
    if (closeAt < 0) break;
    out.push({ name, args: splitTopLevel(text.slice(openAt + 1, closeAt), ",") });
    re.lastIndex = closeAt + 1;
  }
  return out;
}

function balancedParenEnd(text, openAt) {
  let depth = 0;
  for (let at = openAt; at < text.length; at += 1) {
    if (text[at] === "(") depth += 1;
    else if (text[at] === ")") { depth -= 1; if (depth === 0) return at; }
  }
  return -1;
}

function splitTopLevel(text, sep) {
  const parts = [];
  let start = 0, depth = 0;
  for (let at = 0; at <= text.length; at += 1) {
    const ch = text[at];
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if ((at === text.length || ch === sep) && depth === 0) {
      const part = text.slice(start, at).trim();
      if (part) parts.push(part);
      start = at + 1;
    }
  }
  return parts;
}

/** True when the style carries at least one real CSS filter function. */
export function hasRealFilter(style = {}) {
  const list = parseFilterList(style.filter);
  return list.some(f => KNOWN.has(f.name));
}

/** True when the raw filter value is a real CSS filter (not a fake-glow token). */
export function isRealCssFilterValue(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  const list = parseFilterList(text);
  return list.length > 0 && list.every(f => KNOWN.has(f.name));
}

function lengthPx(text) {
  const t = String(text || "").trim().toLowerCase();
  if (t.endsWith("px")) return parseFloat(t) || 0;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

function numArg(args, i, fallback) {
  const n = parseFloat(args[i]);
  return Number.isFinite(n) ? n : fallback;
}

function angleDeg(text) {
  const t = String(text || "").trim().toLowerCase();
  if (t.endsWith("deg")) return parseFloat(t) || 0;
  if (t.endsWith("rad")) return (parseFloat(t) || 0) * 180 / Math.PI;
  if (t.endsWith("grad")) return (parseFloat(t) || 0) * 0.9;
  if (t.endsWith("turn")) return (parseFloat(t) || 0) * 360;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Extra temp-buffer padding (CSS px) a filter list needs beyond the item box:
 * blur spread + drop-shadow offset/blur spread.
 */
export function filterPadPx(filters) {
  let pad = 0;
  for (const f of filters) {
    if (f.name === "blur") {
      pad += Math.ceil(lengthPx(f.args[0]) * 2) + 2;
    } else if (f.name === "drop-shadow") {
      const p = splitTopLevel(f.args.join(" "), " ").filter(Boolean);
      const dx = Math.abs(lengthPx(p[0]));
      const dy = Math.abs(lengthPx(p[1]));
      const bl = p.length > 3 ? lengthPx(p[2]) : 0;
      pad += Math.ceil(dx + dy + bl * 2) + 2;
    }
  }
  return pad;
}

/** Split drop-shadow args on whitespace outside parens. */
function shadowParts(f) {
  return splitTopLevel(f.args.join(" "), " ").filter(Boolean);
}

function parseDropShadow(f) {
  const p = shadowParts(f);
  const dx = lengthPx(p[0]);
  const dy = lengthPx(p[1]);
  let blur = 0, colorText = "black";
  if (p.length >= 4) { blur = Math.max(0, lengthPx(p[2])); colorText = p.slice(3).join(" "); }
  else if (p.length === 3) {
    // ambiguous: 3rd token is blur length or color
    if (/^-?[\d.]/.test(p[2])) blur = Math.max(0, lengthPx(p[2]));
    else colorText = p[2];
  }
  return { dx, dy, blur, color: parseColor(colorText, [0, 0, 0, 255]) };
}

/* ---------------- pixel ops ---------------- */

function luminance(r, g, b) { return 0.2126 * r + 0.7152 * g + 0.0722 * b; }

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h;
  if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (mx === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  h = ((h % 1) + 1) % 1;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const tc = t => {
    let tt = ((t % 1) + 1) % 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [Math.round(tc(h + 1 / 3) * 255), Math.round(tc(h) * 255), Math.round(tc(h - 1 / 3) * 255)];
}

/** src over dst, both non-premultiplied RGBA, in place on dst. */
function blitOver(dst, dw, dh, src, sw, sh, ox, oy) {
  for (let y = 0; y < dh; y++) {
    const sy = y - oy;
    if (sy < 0 || sy >= sh) continue;
    for (let x = 0; x < dw; x++) {
      const sx = x - ox;
      if (sx < 0 || sx >= sw) continue;
      const si = (sy * sw + sx) * 4;
      const sa = src[si + 3] / 255;
      if (sa <= 0) continue;
      const di = (y * dw + x) * 4;
      const da = dst[di + 3] / 255;
      const outA = sa + da * (1 - sa);
      if (outA <= 0) { dst[di + 3] = 0; continue; }
      const ia = 1 - sa;
      dst[di] = (src[si] * sa + dst[di] * da * ia) / outA;
      dst[di + 1] = (src[si + 1] * sa + dst[di + 1] * da * ia) / outA;
      dst[di + 2] = (src[si + 2] * sa + dst[di + 2] * da * ia) / outA;
      dst[di + 3] = outA * 255;
    }
  }
}

function applyDropShadow(data, w, h, f, scale) {
  const { dx, dy, blur, color } = parseDropShadow(f);
  const [cr, cg, cb, ca] = color;
  const sh = new Uint8ClampedArray(data);
  for (let i = 0; i < sh.length; i += 4) {
    const a = data[i + 3] * (ca / 255);
    sh[i] = cr; sh[i + 1] = cg; sh[i + 2] = cb; sh[i + 3] = a;
  }
  if (blur > 0) boxBlurRegion(sh, w, h, Math.max(1, Math.round((blur * scale) / 2)));
  const out = new Uint8ClampedArray(data.length);
  blitOver(out, w, h, sh, w, h, Math.round(dx * scale), Math.round(dy * scale));
  blitOver(out, w, h, data, w, h, 0, 0);
  data.set(out);
}

/**
 * Apply a parsed filter list to RGBA device pixels in place.
 * `scale` = device px per CSS px (supersample factor).
 */
export function applyCssFilters(data, w, h, filters, scale = 1) {
  if (!data || !filters || !filters.length) return;
  const n = data.length;
  for (const f of filters) {
    switch (f.name) {
      case "blur": {
        const px = Math.max(0, lengthPx(f.args[0]) * scale);
        if (px > 0) boxBlurRegion(data, w, h, Math.max(1, Math.round(px / 2)));
        break;
      }
      case "brightness": {
        const k = numArg(f.args, 0, 1);
        for (let i = 0; i < n; i += 4) { data[i] *= k; data[i + 1] *= k; data[i + 2] *= k; }
        break;
      }
      case "contrast": {
        const k = numArg(f.args, 0, 1);
        for (let i = 0; i < n; i += 4) {
          data[i] = (data[i] - 128) * k + 128;
          data[i + 1] = (data[i + 1] - 128) * k + 128;
          data[i + 2] = (data[i + 2] - 128) * k + 128;
        }
        break;
      }
      case "grayscale":
      case "sepia":
      case "saturate": {
        const t = f.name === "saturate" ? numArg(f.args, 0, 1) : numArg(f.args, 0, 1);
        for (let i = 0; i < n; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          let nr, ng, nb;
          if (f.name === "grayscale") {
            const l = luminance(r, g, b);
            nr = r + (l - r) * t; ng = g + (l - g) * t; nb = b + (l - b) * t;
          } else if (f.name === "sepia") {
            const sr = 0.393 * r + 0.769 * g + 0.189 * b;
            const sg = 0.349 * r + 0.686 * g + 0.168 * b;
            const sb = 0.272 * r + 0.534 * g + 0.131 * b;
            nr = r + (sr - r) * t; ng = g + (sg - g) * t; nb = b + (sb - b) * t;
          } else {
            const l = luminance(r, g, b);
            nr = l + (r - l) * t; ng = l + (g - l) * t; nb = l + (b - l) * t;
          }
          data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
        }
        break;
      }
      case "hue-rotate": {
        const deg = angleDeg(f.args[0]);
        if (((deg % 360) + 360) % 360 === 0) break;
        const dh = deg / 360;
        for (let i = 0; i < n; i += 4) {
          if (data[i + 3] === 0) continue;
          const [hh, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
          const [nr, ng, nb] = hslToRgb(hh + dh, s, l);
          data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
        }
        break;
      }
      case "invert": {
        const t = numArg(f.args, 0, 1);
        if (t === 0) break;
        for (let i = 0; i < n; i += 4) {
          data[i] += (255 - 2 * data[i]) * t;
          data[i + 1] += (255 - 2 * data[i + 1]) * t;
          data[i + 2] += (255 - 2 * data[i + 2]) * t;
        }
        break;
      }
      case "opacity": {
        const k = Math.min(1, Math.max(0, numArg(f.args, 0, 1)));
        for (let i = 3; i < n; i += 4) data[i] *= k;
        break;
      }
      case "drop-shadow":
        applyDropShadow(data, w, h, f, scale);
        break;
      default:
        break;
    }
  }
}
