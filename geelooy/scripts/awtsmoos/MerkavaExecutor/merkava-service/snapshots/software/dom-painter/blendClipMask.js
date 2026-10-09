// B"H
/**
 * @file blendClipMask.js
 * @description
 * mix-blend-mode, clip-path, and mask-image for Merkava's software renderer.
 *
 * Design: the painter already rasterizes items into item-sized temp buffers
 * (paintWithEffects, animation.js) for opacity/transform. Blend, clip and mask
 * ride that same temp-buffer path:
 *   - mix-blend-mode: the temp buffer is composited onto the destination with
 *     the W3C blend formula instead of plain source-over.
 *   - clip-path: pixels outside the clip shape are erased from the temp buffer
 *     before compositing. An element's own clip-path resolves in its local box;
 *     ancestor clip-paths resolve in page space (walked in domPainter via the
 *     DOM parent chain) and apply to every descendant.
 *   - mask-image: a gradient mask scales the temp buffer's alpha per pixel.
 *     Only gradient masks are supported (linear via color.js, radial sampled
 *     here); url()/image masks are ignored honestly (no mask applied).
 *   - background-blend-mode: background layers are rasterized bottom-up and
 *     blended with the mode list, in boxPainter.
 */

import { parseColor } from "../color.js";
import { Framebuffer, pointInRoundedRect, makeRoundedTest, normalizeRadii } from "../framebuffer.js";
import { ScaledFramebuffer } from "../supersample.js";

/* ------------------------------------------------------------------ */
/* mix-blend-mode                                                      */
/* ------------------------------------------------------------------ */

const KNOWN_BLENDS = new Set([
  "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "difference", "exclusion", "hard-light", "soft-light",
]);

/** Returns the blend mode, or null when absent/unknown (unknown = honest no-op). */
export function parseMixBlendMode(style = {}) {
  const v = String(style["mix-blend-mode"] || "").trim().toLowerCase();
  if (!v || v === "normal") return null;
  return KNOWN_BLENDS.has(v) ? v : null;
}

function blendChannel(mode, cs, cb) {
  switch (mode) {
    case "multiply": return cs * cb;
    case "screen": return cs + cb - cs * cb;
    case "overlay": return cb <= 0.5 ? 2 * cs * cb : 1 - 2 * (1 - cs) * (1 - cb);
    case "darken": return Math.min(cs, cb);
    case "lighten": return Math.max(cs, cb);
    case "difference": return Math.abs(cs - cb);
    case "exclusion": return cs + cb - 2 * cs * cb;
    case "hard-light": return cs <= 0.5 ? 2 * cs * cb : 1 - 2 * (1 - cs) * (1 - cb);
    case "soft-light": {
      // W3C soft-light approximation.
      const d = cb <= 0.25
        ? ((16 * cb - 12) * cb + 4) * cb
        : Math.sqrt(cb);
      return cs <= 0.5 ? cb - (1 - 2 * cs) * cb * (1 - cb) : cb + (2 * cs - 1) * (d - cb);
    }
    case "color-dodge": return cs === 1 ? 1 : Math.min(1, cb / (1 - cs));
    case "color-burn": return cs === 0 ? 0 : Math.max(0, 1 - (1 - cb) / cs);
    default: return cs;
  }
}

/**
 * W3C compositing of one source pixel over one destination pixel.
 * out = [r,g,b,a] in 0..255.
 */
export function blendCompositePixel(sr, sg, sb, sa, dr, dg, db, da, mode) {
  const as = sa / 255, ab = da / 255;
  const cs = [sr / 255, sg / 255, sb / 255];
  const cb = [dr / 255, dg / 255, db / 255];
  const b = [blendChannel(mode, cs[0], cb[0]), blendChannel(mode, cs[1], cb[1]), blendChannel(mode, cs[2], cb[2])];
  const ao = as + ab * (1 - as);
  const out = [0, 0, 0, Math.round(ao * 255)];
  if (ao > 0) {
    for (let i = 0; i < 3; i++) {
      const co = as * (1 - ab) * cs[i] + as * ab * b[i] + (1 - as) * ab * cb[i];
      out[i] = Math.round((co / ao) * 255);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* clip-path                                                           */
/* ------------------------------------------------------------------ */

function parseLen(token, against) {
  const t = String(token || "").trim().toLowerCase();
  if (!t) return 0;
  // Position keywords (radial-gradient "at", circle/ellipse "at", inset round n/a).
  if (t === "center") return against / 2;
  if (t === "left" || t === "top") return 0;
  if (t === "right" || t === "bottom") return against;
  if (t.endsWith("%")) return ((Number(t.slice(0, -1)) || 0) / 100) * against;
  const m = t.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

function splitArgs(text) {
  // Split on whitespace, keeping "at" markers; commas treated as separators.
  return String(text || "").replace(/,/g, " ").split(/\s+/).filter(Boolean);
}

/**
 * Parse a clip-path value against a box of (w,h).
 * Returns { test(lx, ly) } in box-local px, or null when unsupported.
 * Supported: circle(), ellipse(), inset() (with round), polygon().
 */
export function parseClipPath(value, w, h) {
  const v = String(value || "").trim().toLowerCase();
  if (!v || v === "none") return null;
  const m = v.match(/^([a-z-]+)\(([\s\S]*)\)$/);
  if (!m) return null;
  const fn = m[1], body = m[2].trim();
  const W = Math.max(1, w), H = Math.max(1, h);

  if (fn === "circle" || fn === "ellipse") {
    const parts = splitArgs(body);
    const atIdx = parts.indexOf("at");
    const shapeToks = atIdx >= 0 ? parts.slice(0, atIdx) : parts;
    const posToks = atIdx >= 0 ? parts.slice(atIdx + 1) : [];
    const cx = posToks[0] !== undefined ? parseLen(posToks[0], W) : W / 2;
    const cy = posToks[1] !== undefined ? parseLen(posToks[1], H) : H / 2;
    if (fn === "circle") {
      // Spec: % radius resolves against sqrt(w^2+h^2)/sqrt(2).
      const rTok = shapeToks[0] || "50%";
      const r = rTok.endsWith("%")
        ? ((Number(rTok.slice(0, -1)) || 0) / 100) * (Math.sqrt(W * W + H * H) / Math.SQRT2)
        : parseLen(rTok, Math.min(W, H));
      return { kind: "circle", test: (lx, ly) => (lx - cx) ** 2 + (ly - cy) ** 2 <= r * r };
    }
    const rx = shapeToks[0] !== undefined ? parseLen(shapeToks[0], W) : W / 2;
    const ry = shapeToks[1] !== undefined ? parseLen(shapeToks[1], H) : H / 2;
    return {
      kind: "ellipse",
      test: (lx, ly) => ((lx - cx) / Math.max(rx, 0.001)) ** 2 + ((ly - cy) / Math.max(ry, 0.001)) ** 2 <= 1,
    };
  }

  if (fn === "inset") {
    const roundIdx = body.toLowerCase().indexOf("round");
    const lenPart = roundIdx >= 0 ? body.slice(0, roundIdx) : body;
    const toks = splitArgs(lenPart);
    const vals = toks.map((t) => parseLen(t, 0));
    const [t0 = 0, r0 = t0, b0 = t0, l0 = r0] = vals;
    const x0 = l0, y0 = t0, x1 = W - r0, y1 = H - b0;
    let radii = { tl: [0, 0], tr: [0, 0], br: [0, 0], bl: [0, 0] };
    if (roundIdx >= 0) {
      const rt = splitArgs(body.slice(roundIdx + 5));
      const q = rt.map((x) => parseLen(x, 0));
      const [a = 0, b = a, c = a, d = b] = q;
      radii = { tl: [a, a], tr: [b, b], br: [c, c], bl: [d, d] };
    }
    const r = normalizeRadii(radii, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    // B"H 2026-10-09 (render-bench): hoisted test — the per-pixel closure
    // was allocating via pointInRoundedRect on every pixel.
    const roundedTest = makeRoundedTest(x0, y0, x1 - x0, y1 - y0, r);
    return { kind: "inset", test: roundedTest || ((lx, ly) => lx >= x0 && ly >= y0 && lx <= x1 && ly <= y1) };
  }

  if (fn === "polygon") {
    const pts = [];
    for (const pair of String(body).split(",")) {
      const toks = splitArgs(pair);
      if (toks.length < 2) continue;
      pts.push([parseLen(toks[0], W), parseLen(toks[1], H)]);
    }
    if (pts.length < 3) return null;
    // Even-odd point-in-polygon.
    return {
      kind: "polygon",
      test: (lx, ly) => {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if (yi > ly !== yj > ly && lx < ((xj - xi) * (ly - yi)) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
      },
    };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* mask-image                                                          */
/* ------------------------------------------------------------------ */

/** Returns { image } for gradient masks, else null (url() masks: honest no-op). */
export function parseMask(style = {}) {
  const v = String(style["mask-image"] || style["-webkit-mask-image"] || style["mask"] || "").trim();
  if (!v || v.toLowerCase() === "none") return null;
  if (!/gradient\(/i.test(v)) return null;
  return { image: v };
}

function parseMaskStops(args) {
  const stops = [];
  for (const raw of args) {
    const t = String(raw).trim();
    if (!t) continue;
    const pm = t.match(/^(.*?)\s+(-?\d+(?:\.\d+)?)%\s*$/);
    const colorText = pm ? pm[1].trim() : t;
    const pos = pm ? Number(pm[2]) / 100 : null;
    const c = parseColor(colorText, null);
    if (!c) continue;
    stops.push({ color: c, pos });
  }
  if (!stops.length) return stops;
  const n = stops.length;
  if (stops[0].pos == null) stops[0].pos = 0;
  if (stops[n - 1].pos == null) stops[n - 1].pos = 1;
  let runStart = 0;
  for (let i = 1; i < n; i++) {
    if (stops[i].pos != null) {
      const a = stops[runStart].pos, b = stops[i].pos, gap = i - runStart;
      for (let j = 1; j < gap; j++) stops[runStart + j].pos = a + ((b - a) * j) / gap;
      runStart = i;
    }
  }
  stops.sort((p, q) => p.pos - q.pos);
  return stops;
}

function stopAlphaAt(stops, t) {
  if (!stops.length) return 1;
  if (stops.length === 1) return stops[0].color[3] / 255;
  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1].pos) i++;
  const a = stops[i], b = stops[i + 1];
  const span = b.pos - a.pos || 1;
  const local = Math.max(0, Math.min(1, (t - a.pos) / span));
  const ca = a.color[3] / 255, cb = b.color[3] / 255;
  return ca + (cb - ca) * local;
}

function splitTop(text) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of String(text)) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

/** CSS gradient angle in radians (mirrors color.js: 0deg points up). */
function maskGradientAngle(firstArg) {
  const t = String(firstArg || "").trim().toLowerCase();
  const degMatch = t.match(/^(-?\d+(?:\.\d+)?)(deg|rad|grad|turn)$/);
  if (degMatch) {
    const v = Number(degMatch[1]), unit = degMatch[2];
    const deg = unit === "rad" ? (v * 180) / Math.PI : unit === "grad" ? v * 0.9 : unit === "turn" ? v * 360 : v;
    return (deg * Math.PI) / 180;
  }
  const toMatch = t.match(/^to\s+(.+)$/);
  if (toMatch) {
    const words = toMatch[1].trim().split(/\s+/);
    let dx = 0, dy = 0;
    if (words.includes("right")) dx += 1;
    if (words.includes("left")) dx -= 1;
    if (words.includes("bottom")) dy += 1;
    if (words.includes("top")) dy -= 1;
    if (!dx && !dy) return Math.PI;
    return Math.atan2(dx, -dy);
  }
  return Math.PI;
}

// B"H — mask sampler cache: parsing the gradient once per (image,box) keeps
// per-pixel masking O(1) instead of O(parse). Capped; hot pages reuse boxes.
const maskSamplerCache = new Map();

function buildMaskSampler(image, w, h) {
  const W = Math.max(1, w), H = Math.max(1, h);
  const rm = String(image).match(/radial-gradient\(([\s\S]*)\)\s*$/i);
  if (rm) {
    const args = splitTop(rm[1]);
    let shape = "ellipse", cx = W / 2, cy = H / 2, stopArgs = args;
    const first = (args[0] || "").trim().toLowerCase();
    if (/circle|ellipse|at|farthest|closest|contain|cover/.test(first)) {
      stopArgs = args.slice(1);
      if (first.includes("circle")) shape = "circle";
      const atM = first.match(/at\s+(.+)$/);
      if (atM) {
        const pt = splitArgs(atM[1]);
        cx = pt[0] !== undefined ? parseLen(pt[0], W) : W / 2;
        cy = pt[1] !== undefined ? parseLen(pt[1], H) : H / 2;
      }
    }
    const stops = parseMaskStops(stopArgs);
    if (!stops.length) return () => 1;
    let rx, ry;
    if (shape === "circle") {
      rx = ry = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
    } else {
      rx = Math.max(cx, W - cx) || 1;
      ry = Math.max(cy, H - cy) || 1;
    }
    return (x, y) => stopAlphaAt(stops, Math.max(0, Math.min(1, Math.hypot((x - cx) / rx, (y - cy) / ry))));
  }
  const lm = String(image).match(/linear-gradient\(([\s\S]*)\)\s*$/i);
  if (!lm) return () => 1;
  const args = splitTop(lm[1]);
  if (!args.length) return () => 1;
  const probe = args[0].trim().toLowerCase();
  const hasDirection = /^(-?\d+(?:\.\d+)?(deg|rad|grad|turn)|to\s+)/.test(probe);
  const rad = hasDirection ? maskGradientAngle(args[0]) : Math.PI;
  const stops = parseMaskStops(hasDirection ? args.slice(1) : args);
  if (!stops.length) return () => 1;
  const dx = Math.sin(rad), dy = -Math.cos(rad);
  const lineLen = Math.abs(W * dx) + Math.abs(H * dy) || 1;
  return (x, y) => {
    const t = Math.max(0, Math.min(1, 0.5 + ((x - W / 2) * dx + (y - H / 2) * dy) / lineLen));
    return stopAlphaAt(stops, t);
  };
}

function maskSampler(image, w, h) {
  const key = `${image}|${Math.round(w)}x${Math.round(h)}`;
  let fn = maskSamplerCache.get(key);
  if (!fn) {
    if (maskSamplerCache.size > 240) maskSamplerCache.clear();
    fn = buildMaskSampler(image, w, h);
    maskSamplerCache.set(key, fn);
  }
  return fn;
}

/**
 * Mask alpha (0..1) at box-local (x,y). Gradients use their alpha channel
 * (mask-mode: match-source -> alpha for gradients).
 */
export function maskAlpha(spec, x, y, w, h) {
  if (!spec) return 1;
  return maskSampler(spec.image, w, h)(x, y);
}

/* ------------------------------------------------------------------ */
/* temp-buffer application: clip + mask on a painted temp framebuffer  */
/* ------------------------------------------------------------------ */

/**
 * Erase clipped pixels and scale alpha by the mask on a device-pixel temp
 * buffer. base: Framebuffer (device px). tx0,ty0: item box top-left in temp
 * CSS px. item: {x,y,width,height} in page CSS px. chain: ancestor clips as
 * [{clip, box:{x,y}}] in page px.
 */
export function applyClipMaskToTemp(base, scale, tx0, ty0, item, ownClip, chain, mask) {
  const cw = Math.round(base.width / scale), ch = Math.round(base.height / scale);
  const w = Math.max(1, Number(item.width) || 1), h = Math.max(1, Number(item.height) || 1);
  const ix = Number(item.x) || 0, iy = Number(item.y) || 0;
  const data = base.data, bw = base.width;
  const clips = [];
  if (ownClip) clips.push({ clip: ownClip, page: false });
  for (const c of chain || []) clips.push({ clip: c.clip, page: true, bx: c.box.x, by: c.box.y });
  for (let cy = 0; cy < ch; cy++) {
    for (let cx = 0; cx < cw; cx++) {
      const lx = cx - tx0, ly = cy - ty0;
      let keep = true;
      for (const c of clips) {
        const qx = c.page ? ix + lx - c.bx : lx;
        const qy = c.page ? iy + ly - c.by : ly;
        if (!c.clip.test(qx, qy)) { keep = false; break; }
      }
      let ma = 1;
      if (keep && mask) ma = maskAlpha(mask, lx, ly, w, h);
      if (!keep || ma <= 0.003) {
        // Erase: clear alpha on every device pixel in this CSS cell.
        const dx0 = Math.round(cx * scale), dy0 = Math.round(cy * scale);
        for (let yy = 0; yy < scale; yy++) {
          const dy = dy0 + yy;
          if (dy < 0 || dy >= base.height) continue;
          for (let xx = 0; xx < scale; xx++) {
            const dx = dx0 + xx;
            if (dx < 0 || dx >= bw) continue;
            data[(dy * bw + dx) * 4 + 3] = 0;
          }
        }
      } else if (ma < 0.999) {
        const dx0 = Math.round(cx * scale), dy0 = Math.round(cy * scale);
        for (let yy = 0; yy < scale; yy++) {
          const dy = dy0 + yy;
          if (dy < 0 || dy >= base.height) continue;
          for (let xx = 0; xx < scale; xx++) {
            const dx = dx0 + xx;
            if (dx < 0 || dx >= bw) continue;
            const di = (dy * bw + dx) * 4;
            data[di + 3] = Math.round(data[di + 3] * ma);
          }
        }
      }
    }
  }
}

/**
 * Blend-aware inverse-map composite (mirrors blitMatrix in animation.js):
 * the temp buffer composites onto the destination with the blend mode
 * instead of plain source-over. Handles ScaledFramebuffer destinations.
 */
export function blitMatrixBlend(destFb, srcBase, m, tx, ty, ox, oy, tb, scale, mode) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!det || !Number.isFinite(det)) return;
  const inv = [
    m[3] / det, -m[1] / det,
    -m[2] / det, m[0] / det,
    (m[2] * m[5] - m[3] * m[4]) / det,
    (m[1] * m[4] - m[0] * m[5]) / det,
  ];
  const bx = (Number(tb.x) || 0) + (tx || 0);
  const by = (Number(tb.y) || 0) + (ty || 0);
  const bw = Number(tb.width) || 0;
  const bh = Number(tb.height) || 0;
  const x0 = Math.floor(bx), y0 = Math.floor(by);
  const x1 = Math.ceil(bx + bw), y1 = Math.ceil(by + bh);
  const destBase = destFb && destFb.base ? destFb.base : destFb;
  const ds = (destFb && destFb.scale) || 1;
  if (!destBase || !destBase.data) return;
  const sw = srcBase.width, sh = srcBase.height;
  const sdata = srcBase.data, ddata = destBase.data;
  const dw = destBase.width, dh = destBase.height;
  const out = [0, 0, 0, 0];
  for (let cyy = y0; cyy < y1; cyy++) {
    for (let cxx = x0; cxx < x1; cxx++) {
      const lx = cxx - (tx || 0), ly = cyy - (ty || 0);
      const sx = inv[0] * lx + inv[2] * ly + inv[4] + ox;
      const sy = inv[1] * lx + inv[3] * ly + inv[5] + oy;
      const px = Math.round(sx * scale), py = Math.round(sy * scale);
      if (px < 0 || py < 0 || px >= sw || py >= sh) continue;
      const si = (py * sw + px) * 4;
      const a = sdata[si + 3];
      if (a <= 4) continue;
      const dx0 = Math.round(cxx * ds), dy0 = Math.round(cyy * ds);
      for (let yy = 0; yy < ds; yy++) {
        const dy = dy0 + yy;
        if (dy < 0 || dy >= dh) continue;
        for (let xx = 0; xx < ds; xx++) {
          const dx = dx0 + xx;
          if (dx < 0 || dx >= dw) continue;
          const di = (dy * dw + dx) * 4;
          const r = blendCompositePixel(
            sdata[si], sdata[si + 1], sdata[si + 2], a,
            ddata[di], ddata[di + 1], ddata[di + 2], ddata[di + 3], mode);
          ddata[di] = r[0]; ddata[di + 1] = r[1]; ddata[di + 2] = r[2]; ddata[di + 3] = r[3];
        }
      }
    }
  }
}

/**
 * Axis-aligned blend blit of a temp buffer onto a destination at (dx,dy)
 * in CSS px. Used for background-blend-mode layers.
 */
export function blendBlit(destFb, srcBase, dx, dy, mode) {
  const destBase = destFb && destFb.base ? destFb.base : destFb;
  const ds = (destFb && destFb.scale) || 1;
  if (!destBase || !destBase.data) return;
  const sw = srcBase.width, sh = srcBase.height;
  const sdata = srcBase.data, ddata = destBase.data;
  const dw = destBase.width, dh = destBase.height;
  const cssW = Math.round(sw / ds), cssH = Math.round(sh / ds);
  for (let cy = 0; cy < cssH; cy++) {
    const ty = Math.round((dy + cy) * ds);
    if (ty < 0 || ty >= dh) continue;
    for (let cx = 0; cx < cssW; cx++) {
      const tx = Math.round((dx + cx) * ds);
      if (tx < 0 || tx >= dw) continue;
      const sTop = Math.min(sh - 1, Math.round(cy * ds));
      const sLeft = Math.min(sw - 1, Math.round(cx * ds));
      if (sdata[(sTop * sw + sLeft) * 4 + 3] <= 4) continue;
      for (let yy = 0; yy < ds; yy++) {
        const dy2 = ty + yy;
        if (dy2 < 0 || dy2 >= dh) continue;
        for (let xx = 0; xx < ds; xx++) {
          const dx2 = tx + xx;
          if (dx2 < 0 || dx2 >= dw) continue;
          const di = (dy2 * dw + dx2) * 4;
          const sy2 = Math.min(sh - 1, Math.round(cy * ds) + yy);
          const sx2 = Math.min(sw - 1, Math.round(cx * ds) + xx);
          const s2 = (sy2 * sw + sx2) * 4;
          const r = blendCompositePixel(
            sdata[s2], sdata[s2 + 1], sdata[s2 + 2], sdata[s2 + 3],
            ddata[di], ddata[di + 1], ddata[di + 2], ddata[di + 3], mode);
          ddata[di] = r[0]; ddata[di + 1] = r[1]; ddata[di + 2] = r[2]; ddata[di + 3] = r[3];
        }
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* background-blend-mode                                               */
/* ------------------------------------------------------------------ */

export function parseBackgroundBlendModes(style = {}) {
  const v = String(style["background-blend-mode"] || "").trim().toLowerCase();
  if (!v || v === "normal") return null;
  const modes = splitTop(v).map((s) => s.trim()).filter(Boolean);
  if (!modes.length) return null;
  // Unknown modes degrade to normal (honest), never to garbage.
  return modes.map((m) => (KNOWN_BLENDS.has(m) ? m : "normal"));
}

/**
 * Paint a background with background-blend-mode: bg color first, then each
 * background-image layer blended bottom-up with its mode.
 */
export function paintBlendedBackground(fb, item, bgImageText, bg, radii, rounded, modes) {
  const x = Number(item.x) || 0, y = Number(item.y) || 0;
  const w = Math.max(1, Math.ceil(Number(item.width) || 1));
  const h = Math.max(1, Math.ceil(Number(item.height) || 1));
  if (bg.color[3] > 0) {
    if (rounded) fb.fillRoundedRect(x, y, w, h, radii, bg.color);
    else fb.fillRect(x, y, w, h, bg.color);
  }
  const layers = splitTop(bgImageText).map((s) => s.trim()).filter(Boolean);
  const scale = (fb && fb.scale) || 1;
  // Bottom layer first: CSS paints the last layer at the back.
  for (let bi = layers.length - 1; bi >= 0; bi--) {
    const layer = layers[bi];
    const mode = modes[bi % modes.length] || "normal";
    const base = new Framebuffer(w * scale, h * scale, [0, 0, 0, 0]);
    const tmp = new ScaledFramebuffer(base, scale, w, h);
    if (/gradient\(/i.test(layer)) {
      if (rounded) tmp.gradientRoundedRect(0, 0, w, h, radii, layer, bg.color);
      else tmp.gradientRect(0, 0, w, h, layer, bg.color);
    } else {
      const c = parseColor(layer, null);
      if (c && c[3] > 0) {
        if (rounded) tmp.fillRoundedRect(0, 0, w, h, radii, c);
        else tmp.fillRect(0, 0, w, h, c);
      } else continue;
    }
    // "normal" falls out of the blend formula as plain source-over.
    blendBlit(fb, base, x, y, mode);
  }
}
