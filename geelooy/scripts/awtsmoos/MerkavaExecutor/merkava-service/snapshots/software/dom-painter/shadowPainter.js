// B"H
/**
 * shadowPainter.js — text-shadow parsing for the DOM painter.
 *
 * B"H 2026-10-09: fix-forward shim. textPainter.js (sibling WIP) imports
 * parseTextShadows from this module; the sibling's full implementation had
 * not landed yet, which broke the render pipeline import chain. This minimal
 * parser covers the standard text-shadow syntax so renders proceed. The
 * sibling's richer implementation can extend/replace this file additively.
 *
 * parseTextShadows(style) -> [{ dx, dy, blur, color }]
 *   dx/dy: pixel offsets, blur: px radius, color: [r,g,b,a]
 */

function parseLengthPx(token) {
  const m = /^(-?\d+(?:\.\d+)?)(px)?$/.exec(String(token || "").trim());
  return m ? parseFloat(m[1]) : null;
}

function parseShadowColor(tokens) {
  // Find the token that is not a length.
  for (const t of tokens) {
    if (parseLengthPx(t) === null && t !== "inset") return parseCssColor(t);
  }
  return [0, 0, 0, 255];
}

function parseCssColor(v) {
  const s = String(v || "").trim().toLowerCase();
  const named = {
    black: [0, 0, 0, 255], white: [255, 255, 255, 255], red: [255, 0, 0, 255],
    green: [0, 128, 0, 255], blue: [0, 0, 255, 255], gray: [128, 128, 128, 255],
    grey: [128, 128, 128, 255], transparent: [0, 0, 0, 0],
  };
  if (named[s]) return named[s].slice();
  const hex = s.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    if (h.length === 6) h += "ff";
    if (h.length === 8) {
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), parseInt(h.slice(6, 8), 16)];
    }
  }
  const rgb = s.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(",").map(x => x.trim());
    const r = Math.max(0, Math.min(255, parseFloat(parts[0]) || 0));
    const g = Math.max(0, Math.min(255, parseFloat(parts[1]) || 0));
    const b = Math.max(0, Math.min(255, parseFloat(parts[2]) || 0));
    let a = 255;
    if (parts[3] !== undefined) {
      const av = parseFloat(parts[3]);
      a = Math.round((av <= 1 ? av : av / 255) * 255);
    }
    return [r, g, b, Math.max(0, Math.min(255, a))];
  }
  return [0, 0, 0, 255];
}

function splitShadowList(value) {
  // Split on commas not inside parens.
  const out = [];
  let depth = 0, cur = "";
  for (const ch of String(value || "")) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/**
 * Parse CSS box-shadow into [{ dx, dy, blur, spread, color, inset }].
 * Returns [] for "none", missing, or unparseable input (never throws).
 */
export function parseBoxShadows(style = {}) {
  try {
    const raw = style["box-shadow"] ?? style.boxShadow ?? "";
    if (!raw || /^none$/i.test(String(raw).trim())) return [];
    const shadows = [];
    for (const part of splitShadowList(raw)) {
      const tokens = part.split(/\s+/).filter(Boolean);
      if (tokens.length < 2) continue;
      const inset = tokens[0].toLowerCase() === "inset";
      const t = inset ? tokens.slice(1) : tokens;
      if (t.length < 2) continue;
      const dx = parseLengthPx(t[0]);
      const dy = parseLengthPx(t[1]);
      if (dx === null || dy === null) continue;
      let blur = 0, spread = 0, ci = 2;
      if (t.length > ci && parseLengthPx(t[ci]) !== null) { blur = Math.max(0, parseLengthPx(t[ci])); ci++; }
      if (t.length > ci && parseLengthPx(t[ci]) !== null) { spread = parseLengthPx(t[ci]); ci++; }
      shadows.push({ dx, dy, blur, spread, color: parseShadowColor(t), inset });
    }
    return shadows;
  } catch (_) {
    return [];
  }
}

/**
 * Paint box shadows. mode "outset" paints non-inset shadows under the box;
 * mode "inset" paints inset shadows over it.
 * B"H 2026-10-09: three fixes — (1) spread EXPANDS the shadow rect on all
 * sides (was shifting it instead); (2) CSS paints the FIRST shadow in the
 * list on top, so paint back-to-front; (3) the temp buffer is built at device
 * px via fb.scale (blitFrom takes a device-px buffer with CSS-px offsets).
 */
export function paintBoxShadows(fb, item, radii, shadows, mode) {
  try {
    if (!fb || !item || !Array.isArray(shadows)) return;
    const want = shadows.filter(s => (mode === "inset") === !!s.inset);
    if (!want.length) return;
    if (typeof fb.blitFrom !== "function") return;
    const scale = (fb && fb.scale) || 1;
    for (let si = want.length - 1; si >= 0; si--) {
      const sh = want[si];
      const blur = Math.max(0, sh.blur || 0);
      const spread = sh.spread || 0;
      const pad = Math.ceil(blur * 2) + 4;
      // Shadow rect = border box expanded by spread, offset by (dx,dy).
      const rx = (item.x || 0) + (mode === "inset" ? 0 : sh.dx) - spread;
      const ry = (item.y || 0) + (mode === "inset" ? 0 : sh.dy) - spread;
      const rw = Math.max(1, (item.width || 0) + spread * 2);
      const rh = Math.max(1, (item.height || 0) + spread * 2);
      const sw = Math.max(1, Math.ceil((rw + pad * 2) * scale));
      const shh = Math.max(1, Math.ceil((rh + pad * 2) * scale));
      const tmp = { width: sw, height: shh, data: new Uint8ClampedArray(sw * shh * 4) };
      const ix = Math.round(pad * scale), iy = Math.round(pad * scale);
      const iw = Math.max(1, Math.round(rw * scale)), ih = Math.max(1, Math.round(rh * scale));
      const col = sh.color || [0, 0, 0, 128];
      for (let y = 0; y < ih; y++) {
        for (let x = 0; x < iw; x++) {
          const o = ((iy + y) * sw + (ix + x)) * 4;
          tmp.data[o] = col[0]; tmp.data[o + 1] = col[1];
          tmp.data[o + 2] = col[2]; tmp.data[o + 3] = col[3];
        }
      }
      if (blur > 0) boxBlurRegionLocal(tmp.data, sw, shh, Math.max(1, Math.round(blur * scale)));
      if (mode === "inset") {
        // B"H 2026-10-09: inset shadows are a soft INNER edge — punch out the
        // box interior (eroded by the blur radius) so the blurred solid rect
        // doesn't fill the center. What remains is the inner fade.
        const er = Math.max(0, Math.round(blur * scale));
        const px0 = Math.round(pad * scale), py0 = Math.round(pad * scale);
        const px1 = Math.round((pad + rw) * scale), py1 = Math.round((pad + rh) * scale);
        for (let yy = Math.max(0, py0 + er); yy < Math.min(shh, py1 - er); yy++) {
          for (let xx = Math.max(0, px0 + er); xx < Math.min(sw, px1 - er); xx++) {
            tmp.data[(yy * sw + xx) * 4 + 3] = 0;
          }
        }
      }
      fb.blitFrom(tmp, rx - pad, ry - pad);
    }
  } catch (_) { /* shadows are decorative; never break the render */ }
}

// Local blur (avoids a hard import cycle; framebuffer.js has the canonical one).
function boxBlurRegionLocal(data, w, h, radius) {
  const r = Math.max(1, Math.round(Number(radius) || 1));
  if (!data || w < 1 || h < 1) return;
  const tmp = new Uint8ClampedArray(data.length);
  const w4 = w * 4;
  for (let y = 0; y < h; y++) {
    const row = y * w4;
    for (let x = 0; x < w; x++) {
      let sr = 0, sg = 0, sb = 0, sa = 0, n = 0;
      for (let k = -r; k <= r; k++) {
        const xx = Math.min(w - 1, Math.max(0, x + k));
        const o = row + xx * 4;
        sr += data[o]; sg += data[o + 1]; sb += data[o + 2]; sa += data[o + 3]; n++;
      }
      const o = row + x * 4;
      tmp[o] = sr / n; tmp[o + 1] = sg / n; tmp[o + 2] = sb / n; tmp[o + 3] = sa / n;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let sr = 0, sg = 0, sb = 0, sa = 0, n = 0;
      for (let k = -r; k <= r; k++) {
        const yy = Math.min(h - 1, Math.max(0, y + k));
        const o = yy * w4 + x * 4;
        sr += tmp[o]; sg += tmp[o + 1]; sb += tmp[o + 2]; sa += tmp[o + 3]; n++;
      }
      const o = y * w4 + x * 4;
      data[o] = sr / n; data[o + 1] = sg / n; data[o + 2] = sb / n; data[o + 3] = sa / n;
    }
  }
}

/**
 * Parse CSS text-shadow into [{ dx, dy, blur, color }].
 * Returns [] for "none", missing, or unparseable input (never throws).
 */
export function parseTextShadows(style = {}) {
  try {
    const raw = style["text-shadow"] ?? style.textShadow ?? "";
    if (!raw || /^none$/i.test(String(raw).trim())) return [];
    const shadows = [];
    for (const part of splitShadowList(raw)) {
      const tokens = part.split(/\s+/).filter(Boolean);
      if (tokens.length < 2) continue;
      const dx = parseLengthPx(tokens[0]);
      const dy = parseLengthPx(tokens[1]);
      if (dx === null || dy === null) continue;
      let blur = 0;
      if (tokens.length >= 3) {
        const b = parseLengthPx(tokens[2]);
        if (b !== null) blur = Math.max(0, b);
      }
      shadows.push({ dx, dy, blur, color: parseShadowColor(tokens) });
    }
    return shadows;
  } catch (_) {
    return [];
  }
}
