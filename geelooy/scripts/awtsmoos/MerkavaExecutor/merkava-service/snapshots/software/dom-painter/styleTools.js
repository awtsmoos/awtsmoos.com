// B"H
import { cssColor } from "../framebuffer.js";

/**
 * The Awtsmoos turns raw CSS whispers into useful paint decisions. This module
 * is the small lamp: colors, borders, text sizes, and overflow names are pulled
 * from the measured style without letting the main painter become a jungle.
 */
export function background(style, item) {
  const bg = style["background-image"] || style.background || "";
  const color = cssColor(style["background-color"] || style.background, fallbackFor(item.kind));
  return /gradient\(/i.test(bg) ? { gradient: bg, color } : { color };
}

export function overflowValue(style) {
  const both = String(style.overflow || "visible").trim().toLowerCase();
  return {
    x: String(style["overflow-x"] || both).trim().toLowerCase(),
    y: String(style["overflow-y"] || both).trim().toLowerCase()
  };
}

export function borderColor(style, kind) {
  // B"H 2026-10-09 (mass-test batch 2): logical border shorthands carry
  // their own color token (e.g. `border-inline-start: 8px solid #e11`).
  const logical = String(style["border-inline-start"] || style["border-inline-end"] || "").trim();
  const logicalColor = logical ? logical.split(/\s+/).slice(2).join(" ") : "";
  return cssColor(style["border-color"] || style.border || logicalColor || (isControl(kind) ? "#7edcff" : "#000000"), isControl(kind) ? [126, 220, 255, 255] : [0, 0, 0, 255]);
}

export function borderWidth(style, kind) {
  return parsePx(style["border-width"] || String(style.border || "").match(/\d+(?:\.\d+)?px/)?.[0]) || (isControl(kind) ? 2 : 0);
}

export function textColor(kind, style) {
  return cssColor(style.color, isControl(kind) ? [240, 248, 255, 255] : [245, 245, 245, 255]);
}

export function textScale(kind, style) {
  const size = parsePx(style["font-size"]) || (kind === "h1" ? 24 : kind === "h2" ? 20 : isControl(kind) ? 14 : 14);
  return kind === "button" || isControl(kind) ? 1 : Math.max(1, Math.min(3, Math.round(size / 10)));
}

export function fallbackFor(kind) {
  if (kind === "body") return [255, 255, 255, 255];
  // B"H: CSS spec — background-color initial value is transparent. Unstyled
  // div/main/section/article must show the canvas through, not opaque dark.
  // (Screenshot proof: httpbin.org rendered dark bars on plain <div>s.)
  if (["main", "section", "article", "div", "form", "fieldset"].includes(kind)) return [0, 0, 0, 0];
  if (kind === "button") return [69, 90, 210, 255];
  if (["input", "select", "textarea"].includes(kind)) return [24, 38, 59, 255];
  if (["h1", "h2", "h3", "p", "span", "strong", "label", "li", "ul"].includes(kind)) return [0, 0, 0, 0];
  return [0, 0, 0, 0];
}

export function isControl(kind) {
  return ["button", "input", "select", "textarea"].includes(kind);
}

export function hasGlow(style) {
  return /shadow|glow|blur/i.test(String(style["box-shadow"] || style.filter || ""));
}

export function classText(item) {
  return String(item.node?.className || item.node?.attributes?.class || "");
}

// B"H 2026-10-09: fix-forward. textPainter.js (sibling WIP) imports
// resolveFontWeight from this module; it had not landed yet. Resolves CSS
// font-weight to a numeric weight (400 normal, 700 bold).
export function resolveFontWeight(style = {}) {
  const v = String(style["font-weight"] ?? style.fontWeight ?? "400").trim().toLowerCase();
  if (v === "bold" || v === "bolder") return 700;
  if (v === "normal" || v === "lighter") return 400;
  const n = parseInt(v, 10);
  if (!isNaN(n)) return Math.max(100, Math.min(900, Math.round(n / 100) * 100));
  return 400;
}

// B"H 2026-10-09: fix-forward. boxPainter.js (sibling WIP) imports
// borderRadii from this module; it had not landed yet. Parses CSS
// border-radius (incl. per-corner) into normalized {tl:[x,y],tr,br,bl}.
export function borderRadii(style = {}, w = 0, h = 0) {
  const px = (v) => {
    const m = /^(-?\d+(?:\.\d+)?)(px)?$/.exec(String(v || "").trim());
    return m ? parseFloat(m[1]) : 0;
  };
  const get = (prop) => style[prop] ?? style[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())];
  let tl = [0, 0], tr = [0, 0], br = [0, 0], bl = [0, 0];
  const single = (v) => { const n = px(v); return [n, n]; };
  const dual = (v) => {
    const parts = String(v || "").trim().split(/\s+/);
    if (parts.length >= 2) return [px(parts[0]), px(parts[1])];
    return single(v);
  };
  const r = get("border-radius");
  if (r) {
    // Handle "H / V" syntax.
    const [horiz, vert] = String(r).split("/").map(s => s.trim());
    const hp = (horiz || "").split(/\s+/).filter(Boolean);
    const vp = vert ? vert.split(/\s+/).filter(Boolean) : null;
    const q = (arr, i) => px(arr[i] ?? arr[i - 2] ?? arr[0] ?? 0);
    const corners = ["tl", "tr", "br", "bl"];
    const out = {};
    corners.forEach((c, i) => {
      const hx = q(hp, i);
      const vy = vp ? q(vp, i) : hx;
      out[c] = [hx, vy];
    });
    tl = out.tl; tr = out.tr; br = out.br; bl = out.bl;
  }
  const per = {
    tl: get("border-top-left-radius"), tr: get("border-top-right-radius"),
    br: get("border-bottom-right-radius"), bl: get("border-bottom-left-radius"),
  };
  if (per.tl) tl = dual(per.tl);
  if (per.tr) tr = dual(per.tr);
  if (per.br) br = dual(per.br);
  if (per.bl) bl = dual(per.bl);
  // Normalize against box size (CSS spec: scale down on overlap).
  const W = Math.max(1, Number(w) || 1), H = Math.max(1, Number(h) || 1);
  let f = 1;
  const sums = [[tl[0] + tr[0], W], [bl[0] + br[0], W], [tl[1] + bl[1], H], [tr[1] + br[1], H]];
  for (const [s, d] of sums) if (s > d && s > 0) f = Math.min(f, d / s);
  if (f < 1) for (const c of [tl, tr, br, bl]) { c[0] *= f; c[1] *= f; }
  return { tl, tr, br, bl };
}

export function parsePx(value) {  const match = String(value || "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}
// B"H 2026-10-09: collision fix. Two sibling fix-forward borderRadii stubs
// landed in the same file (duplicate declaration = hard SyntaxError, module
// unloadable). Kept the FIRST definition above (strict superset: per-corner
// properties + camelCase fallback + H/V syntax); removed the second stub,
// which handled only the plain border-radius shorthand. No behavior lost.
